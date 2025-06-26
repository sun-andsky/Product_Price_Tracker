import React, { useEffect, useState } from "react";
import { fetchWishlist, removeFromWishlist } from "../api/api";
import "./WishlistPage.css";

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to view your wishlist.");
      return;
    }

    const loadWishlist = async () => {
      try {
        const data = await fetchWishlist(token);
        if (Array.isArray(data)) {
          setWishlist(data);
        } else {
        setError(data?.error || "Please log in to view Bookmarks");
        }
      } catch (err) {
        console.error("Failed to load Bookmarks:", err);
        setError("Something went wrong while loading Bookmarks.");
      }
    };

    loadWishlist();
  }, []);

    const handleRemove = async (productId) => {
    const token = localStorage.getItem("authToken");
    await removeFromWishlist(productId, token);
    setWishlist(wishlist.filter((p) => p.id !== productId));
  };

  return (
    <div className="wishlist-page">
      
      {error ? (
        <p className="error-msg">{error}</p>
      ) : wishlist.length === 0 ? (
        <p className="no-bookmarks">No Bookmarks</p>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div key={product.id} className="wishlist-card">
              <img className="product-bookmark-img" src={product.Image} alt={product.Product_Name} />
              <div className="bookmark-product-detail">

                <p className="product-name">{product.Product_Name}</p>
                <p className="product-price-bookmark">₹{product.Latest_Price}</p>
                <a
                  href={product.Links}                
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-link"
                >
                  Buy on {product.Source}
                </a>
                
              </div>
              <div className="delete-button">
                  <button onClick={() => handleRemove(product.id)}>
                  <i class="bi bi-trash3-fill "></i>
                  </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
