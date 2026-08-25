import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import api from "../utils/api";
import ProductsPage from "./ProductsPage";
import InventoryPage from "./InventoryPage";
import OrdersPage from "./OrdersPage";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    categoryName: "",
    productImage: null,
  });

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "productImage") {
      setFormData({ ...formData, productImage: files[0] });
    } else if (name === "stock") {
      setFormData({ ...formData, [name]: Math.max(0, value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.categoryName) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.stock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let categoryId;
      const existingCategory = categories.find(
        (category) =>
          category.name.toLowerCase() === formData.categoryName.toLowerCase(),
      );

      if (existingCategory) {
        categoryId = existingCategory.categoryId;
      } else {
        const categoryResponse = await api.post("/categories", {
          name: formData.categoryName,
        });
        categoryId = categoryResponse.data.categoryId;
        await fetchCategories();
      }

      const productFormData = new FormData();
      productFormData.append("name", formData.name);
      productFormData.append("price", formData.price);
      productFormData.append("stock", formData.stock);
      productFormData.append("category_Id", categoryId);

      if (formData.productImage) {
        productFormData.append("productImage", formData.productImage);
      }

      const productResponse = await api.post("/products", productFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      try {
        await api.post("/inventory/create", {
          product: { productId: productResponse.data.productId },
        });
      } catch (inventoryError) {
        console.error("Inventory creation failed:", inventoryError);
      }

      setFormData({
        name: "",
        price: "",
        stock: "",
        categoryName: "",
        productImage: null,
      });
      alert("Product created successfully!");
    } catch (err) {
      console.error("Failed to save product:", err);

      let errorMessage = "Failed to save product. ";
      if (err.response) {
        errorMessage += `Server error: ${err.response.status} - ${err.response.statusText}`;
        if (err.response.data) {
          errorMessage += ` - ${JSON.stringify(err.response.data)}`;
        }
      } else if (err.request) {
        errorMessage += "No response from server. Check if backend is running.";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <div className="bg-light p-3" style={{ minWidth: "220px", height: "100vh" }}>
        <h5 className="mb-4">ANIME CLOTHING</h5>
        <ul className="list-unstyled">
          {[
            ["dashboard", "Dashboard"],
            ["products", "Products"],
            ["orders", "Orders"],
            ["inventory", "Inventory"],
          ].map(([page, label]) => (
            <li
              key={page}
              className={`mb-2 ${activePage === page ? "text-primary fw-bold" : ""}`}
              onClick={() => setActivePage(page)}
              style={{ cursor: "pointer" }}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-grow-1 p-4">
        {activePage === "dashboard" && (
          <Card className="p-4">
            <h4 className="mb-3">Add New Product</h4>
            {error && (
              <div className="alert alert-danger">
                <strong>Error:</strong> {error}
              </div>
            )}

            <Form onSubmit={handleSubmit} encType="multipart/form-data">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock Quantity</Form.Label>
                    <Form.Control
                      name="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">Minimum value: 0</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select a category</option>
                      <option value="Beanie">Beanie</option>
                      <option value="Cap">Cap</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="Tee">Tee</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Image</Form.Label>
                    <Form.Control
                      type="file"
                      name="productImage"
                      accept="image/*"
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </Form>
          </Card>
        )}

        {activePage === "products" && <ProductsPage />}
        {activePage === "orders" && <OrdersPage />}
        {activePage === "inventory" && <InventoryPage />}
      </div>
    </div>
  );
}

export default AdminDashboard;