import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

function getProductImage(product) {
  if (!product.productImage) {
    return null;
  }

  if (typeof product.productImage === "string") {
    return `data:image/jpeg;base64,${product.productImage}`;
  }

  return null;
}

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (requestError) {
        console.error("Error fetching products:", requestError);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="products-home">
      <section className="products-hero" id="home">
        <p className="welcome">WELCOME TO ANIME STORE</p>
        <h2>Find your next <span>favorite</span>.</h2>
        <p>Discover anime-inspired clothing and collectibles selected for every fan.</p>
      </section>

      <section className="products-section" id="products">
        <div className="products-section-header">
          <div>
            <p className="section-label">OUR COLLECTION</p>
            <h2>Featured Products</h2>
          </div>
          {!loading && <span>{products.length} products</span>}
        </div>

        {loading && <p className="products-message">Loading products...</p>}
        {error && <p className="products-message error-message">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="products-message">No products are available yet.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => {
              const image = getProductImage(product);
              const category = product.category?.name || "Anime Collection";

              return (
                <Link
                  className="product-card"
                  key={product.productId}
                  to={`/products/${product.productId}`}
                >
                  <div className="product-image">
                    {image ? (
                      <img src={image} alt={product.name} />
                    ) : (
                      <span>⚔</span>
                    )}
                  </div>
                  <div className="product-details">
                    <p className="product-category">{category}</p>
                    <h3>{product.name}</h3>
                    <div className="product-meta">
                      <strong>R {Number(product.price).toFixed(2)}</strong>
                      <span className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default ProductsPage;
