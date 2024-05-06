import React, { useState, useEffect } from "react";
import Select from "react-select";
import Product from "./Product";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function OrderForm() {
  // state for form data
  const [formData, setFormData] = useState({
    pos: "",
    address: "",
    totalAmount: "",
    products: [
      {
        ean: "",
        item: "",
        qty: "",
        price: "",
        discount: "",
        total: "",
      },
    ],
  });
  const [selectedPos, setSelectedPos] = useState(null);
  // set supermarket select as disabled by default
  const [isDisabled, setIsDisabled] = useState(true);
  const [posOptions, setPosOptions] = useState(null);

  // centralize if needed
  const roundedNumber = (number) => {
    return Math.round(number * 100) / 100;
  };

  // set dropdown value and form data value based on pos selected
  const handlePosChange = (posSelected) => {
    setSelectedPos(posSelected);
    setFormData({
      ...formData,
      pos: posSelected.value,
      address: posSelected.address,
    });
  };

  // API call to populate POS dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const posOptions = [];

        data.results.forEach((result) => {
          posOptions.push({
            label: result.name,
            value: result.name,
            address: result.address,
          });
        });
        setPosOptions(posOptions);
        // enable supermarket dropdown
        setIsDisabled(false);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // callback that sets form data upon change in child component
  const handleProductFormDataChange = (productData, index) => {
    setFormData((prevFormData) => {
      const updatedProducts = [...prevFormData.products];
      updatedProducts[index] = { ...updatedProducts[index], ...productData };
      const updatedFormData = { ...prevFormData, products: updatedProducts };
      const totalSum = updatedFormData.products.reduce(
        (acc, product) => acc + product.total,
        0
      );

      return {
        ...updatedFormData,
        totalAmount: roundedNumber(totalSum),
      };
    });
  };

  // add product component on button click
  const [products, setProducts] = useState([
    <Product
      key={0}
      index={0}
      onFormDataChange={handleProductFormDataChange}
    />,
  ]);
  const addProduct = () => {
    const newProducts = [...products];
    newProducts.push(null);
    setProducts(newProducts);
  };

  // delete product component on button click
  const handleDeleteProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // payload to be sent for product order api call
    console.log(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Container>
        <div>Nuevo Pedido:</div>
        <Row>
          <Col xs={12} sm={4}>
            <Form.Label> POS </Form.Label>
            <Select
              name="pos"
              value={selectedPos}
              onChange={handlePosChange}
              options={posOptions}
              isSearchable
              isDisabled={isDisabled}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={4}>
            <Form.Label> Direccion: </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.address}
              readOnly
            />
          </Col>
        </Row>
        {products.map((product, index) => (
          <Product
            key={index}
            index={index}
            onFormDataChange={handleProductFormDataChange}
            onDeleteProduct={handleDeleteProduct}
          />
        ))}
        <Button onClick={addProduct} variant="link">
          Añadir producto
        </Button>
        <Button variant="primary" type="submit">
          Guardar
        </Button>
        <Row>
          <Col xs={12} sm={{ span: 1, offset: 10 }}>
            <Form.Label> Total: </Form.Label>
            <Form.Control value={formData.totalAmount} readOnly />
          </Col>
        </Row>
      </Container>
    </Form>
  );
}

export default OrderForm;
