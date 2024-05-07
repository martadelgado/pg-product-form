import React, { useState, useEffect } from "react";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "./styles.css";

function Product({ index, onFormDataChange, onDeleteProduct }) {
  const isMobile = window.innerWidth <= 768 ?? false;
  const [selectedOption, setSelectedOption] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [items, setItems] = useState(null);
  const [formData, setFormData] = useState({
    index: index,
    ean: "",
    item: selectedOption,
    qty: "",
    price: "",
    discount: "",
    discounts: "",
    total: "",
  });

  const roundedNumber = (number) => {
    return Math.round(number * 100) / 100;
  };

  // API call to populate items dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const items = [];

        data.results.forEach((result) => {
          items.push({
            label: result.text,
            value: result.text,
            price: result.basePrice,
            ean: result.id,
            discounts: result.prices,
          });
        });
        setItems(items);
        setIsDisabled(false);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchItems();
  }, []);

  // retrieve discount from range of discounts based on quantity
  const getDiscount = (quantity, discounts) => {
    for (const discount of discounts) {
      if (
        quantity >= discount.minQty &&
        (discount.maxQty === null || quantity <= discount.maxQty)
      ) {
        return discount.discount;
      }
    }
    return 0;
  };

  const calculateDiscount = (discountsArr, quantity, discount) => {
    return discountsArr.length ? getDiscount(quantity, discountsArr) : discount;
  };

  const calculateTotal = (price, quantity) => {
    return price * quantity;
  };

  const calculateTotalWithDiscount = (discount, total) => {
    return discount > 0 ? total - (total * discount) / 100 : total;
  };

  /* when quantity is updated, total price is updated
   * when discount is updated, percentage is calculated and subtracted from total
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "qty") {
      // regex to accept positive integers
      /^\d*(\.\d{0,2})?$/.test(value) &&
        setFormData((prevFormData) => {
          const discount = calculateDiscount(
            prevFormData.discounts,
            value,
            prevFormData.discount
          );
          const total = calculateTotal(prevFormData.price, value);
          const totalWithDiscount = calculateTotalWithDiscount(discount, total);
          const updatedFormData = {
            ...prevFormData,
            [name]: value,
            discount: discount,
            total: roundedNumber(totalWithDiscount),
          };
          onFormDataChange(updatedFormData, index);
          return updatedFormData;
        });
    }

    if (name === "discount") {
      // regex to only accept positive integers rounded to two decimal places
      /^\d*\.?\d{0,2}$|^$/.test(value) &&
        setFormData((prevFormData) => {
          const total = calculateTotal(prevFormData.price, prevFormData.qty);

          const totalWithDiscount = calculateTotalWithDiscount(value, total);
          const updatedFormData = {
            ...prevFormData,
            [name]: value,
            total: roundedNumber(totalWithDiscount),
          };
          onFormDataChange(updatedFormData, index);
          return updatedFormData;
        });
    }
  };

  // sets form data values upon item selection
  const handleItemChange = (itemSelected) => {
    const defaultQty = 1;
    const discount = calculateDiscount(itemSelected.discounts, defaultQty, 0);
    setSelectedOption(itemSelected);

    const total = calculateTotal(itemSelected.price, defaultQty);
    const totalWithDiscount = calculateTotalWithDiscount(discount, total);

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        discounts: itemSelected.discounts,
        discount: discount,
        item: itemSelected.value,
        qty: defaultQty,
        price: itemSelected.price,
        ean: itemSelected.ean,
        total: roundedNumber(totalWithDiscount),
      };
      onFormDataChange(updatedFormData, index);
      return updatedFormData;
    });
  };

  // deletes product line
  const handleDelete = (index) => {
    onDeleteProduct(index);
  };

  return (
    <div className="product-row">
      <Row>
        <Col xs={12} sm={2}>
          {(index === 0 || isMobile) && <Form.Label> EAN </Form.Label>}
          <Form.Control
            name="ean"
            value={formData.ean}
            onChange={handleChange}
          />
        </Col>
        <Col xs={12} sm={2}>
          {(index === 0 || isMobile) && <Form.Label> Item: </Form.Label>}
          <Select
            name="item"
            value={selectedOption}
            onChange={handleItemChange}
            options={items}
            isSearchable
            isDisabled={isDisabled}
          />
        </Col>
        <Col xs={12} md={2}>
          {(index === 0 || isMobile) && <Form.Label> Qty: </Form.Label>}
          <Form.Control
            type="number"
            name="qty"
            value={formData.qty}
            onChange={handleChange}
          />
        </Col>
        <Col xs={12} md={2}>
          {(index === 0 || isMobile) && <Form.Label> Precio: </Form.Label>}
          <Form.Control
            name="price"
            value={formData.price}
            onChange={handleChange}
            readOnly
          />
        </Col>
        <Col xs={12} md={2}>
          {(index === 0 || isMobile) && <Form.Label> Dto. </Form.Label>}
          <Form.Control
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
          />
        </Col>
        <Col xs={6} md={1}>
          {(index === 0 || isMobile) && <Form.Label> Total </Form.Label>}
          <Form.Control
            name="total"
            value={formData.total}
            onChange={handleChange}
            readOnly
          />
        </Col>
        <Col className="button-delete" xs={6} md={1}>
          {index !== 0 && (
            <Button
              onClick={() => {
                handleDelete(index);
              }}
              size="sm"
              variant="outline-danger"
            >
              {isMobile ? "Borrar Producto" : "X"}
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default Product;
