import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then((response) => setProduct(response.data))
      .catch((requestError) => {
        console.error("Error fetching product:", requestError);
        setError("Product could not be loaded.");
      });
  }, [productId]);

  if (error) return <p className="products-message error-message">{error}</p>;
  if (!product) return <p className="products-message">Loading product...</p>;

  const image = product.productImage
    ? `data:image/jpeg;base64,${product.productImage}`
    : null;

  return (
    <section className="product-detail-page">
      <Link to="/catalog">← Back to catalog</Link>
      <div className="product-detail-card">
        <div className="product-image">
          {image ? <img src={image} alt={product.name} /> : <span>⚔</span>}
        </div>
        <div>
          <p className="product-category">{product.category?.name || "Anime Collection"}</p>
          <h2>{product.name}</h2>
          <p className="product-detail-price">R {Number(product.price).toFixed(2)}</p>
          <p>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
