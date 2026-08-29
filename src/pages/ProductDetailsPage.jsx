import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        const selectedProduct = response.data;
        setProduct(selectedProduct);

        // Load other products from the same category to power the related-items section.
        const productsResponse = await api.get("/products");
        const sameCategoryProducts = productsResponse.data.filter((item) => {
          const itemCategory = item.category?.name || "Anime Collection";
          const selectedCategory = selectedProduct.category?.name || "Anime Collection";
          return item.productId !== selectedProduct.productId && itemCategory === selectedCategory;
        });

        setRelatedProducts(sameCategoryProducts.slice(0, 3));
      } catch (requestError) {
        console.error("Error fetching product:", requestError);
        setError("Product could not be loaded.");
      }
    };

    fetchProduct();
  }, [productId]);

  if (error) return <p className="products-message error-message">{error}</p>;
  if (!product) return <p className="products-message">Loading product...</p>;

  const image = product.productImage
    ? `data:image/jpeg;base64,${product.productImage}`
    : null;

  const categoryName = product.category?.name || "Anime Collection";

  return (
    <section className="product-detail-page">
      <Link to="/catalog">← Back to catalog</Link>
      <div className="product-detail-card">
        <div className="product-image">
          {image ? <img src={image} alt={product.name} /> : <span>⚔</span>}
        </div>
        <div>
          <p className="product-category">{categoryName}</p>
          <h2>{product.name}</h2>
          <p className="product-detail-price">R {Number(product.price).toFixed(2)}</p>
          <p>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
          <p className="product-detail-description">{product.description || "Built for anime fans who want standout style, premium comfort, and a statement look that feels as bold as their favorite series."}</p>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <div className="products-section-header related-header">
            <div>
              <p className="section-label">MORE IN</p>
              <h2>{categoryName}</h2>
            </div>
          </div>

          <div className="product-grid related-grid">
            {relatedProducts.map((relatedProduct) => {
              const relatedImage = relatedProduct.productImage
                ? `data:image/jpeg;base64,${relatedProduct.productImage}`
                : null;

              return (
                <Link
                  key={relatedProduct.productId}
                  className="product-card"
                  to={`/products/${relatedProduct.productId}`}
                >
                  <div className="product-image">
                    {relatedImage ? <img src={relatedImage} alt={relatedProduct.name} /> : <span>⚔</span>}
                  </div>
                  <div className="product-details">
                    <p className="product-category">{relatedProduct.category?.name || "Anime Collection"}</p>
                    <h3>{relatedProduct.name}</h3>
                    <div className="product-meta">
                      <strong>R {Number(relatedProduct.price).toFixed(2)}</strong>
                      <span className={relatedProduct.stock > 0 ? "in-stock" : "out-of-stock"}>
                        {relatedProduct.stock > 0 ? `${relatedProduct.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetailsPage;
