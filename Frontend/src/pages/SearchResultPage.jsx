import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts } from "../api/api";
import './SearchResultPage.css';
import Filter from "../components/Filter";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const query = searchParams.get("q");

  const handleFilterChange = (filters) => {
    fetchProducts({ query, ...filters }).then(setProducts);
  };

  useEffect(() => {
    if (query) {
      fetchProducts({ query }).then(setProducts);
    }
  }, [query]);

  const addToWishlist = async (productId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("🔒 Please log in to use wishlist.");
      return;
    }

    const res = await fetch("/api/users/wishlist/add/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ product_id: productId })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Product Bookmarked");
      setWishlistIds(prev => [...prev, productId]); // Add to local list
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(data.error || "Login to Bookmark Product");
    }
  };

  return (
    <div className="search-page">
      {message && (
        <div className="toast-message">
          {message}
        </div>
      )}
      <div className="filter-result">
        <div className="filter">
          <p className="filter-tag"> Filter</p>
          <i class="bi bi-funnel" id="filter-icon"></i>
        </div>
        <div className="result">
          <p className="result-heading">
            Showing
            <span className="result-count"> {products.length} {products.length === 1 ? "result" : "results"} </span>
            for <span className="result-op">" {query}" </span>
            
          </p>
        </div>
        
      </div>
      
      <div className="search-main-container">
        {/* LEFT: Filter */}
        <div className="filter-box-left">
          <Filter onFilterChange={handleFilterChange} />
        </div>

        {/* RIGHT: Existing Product Layout – UNTOUCHED */}
        <div className="products-box">
          {products.length > 0 ? (
            <div className="products-grid">
              
              {products.map((product) => (
                <div key={product.id} className="product-link">
                  <div className="product-card">
                    <Link className="link" to={`/product/${product.id}`}>
                      <img src={product.Image} alt={product.Product_Name} className="product-image" />
                    </Link>

                    <div className="product-info">
                      <Link className="link" to={`/product/${product.id}`}>
                        <p className="product-title">{product.Product_Name}</p>
                        <p className="product-price"><sup>₹</sup>{product.Latest_Price}</p>
                      </Link>

                      <div className="product-actions">
                        <a 
                          href={product.Links} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="external-link-button"
                          onClick={(e) => e.stopPropagation()} // Prevent bubbling
                        >
                          View on {product.Source}
                        </a>
                      </div>
                    </div>
                  </div>

                    <button
                      className="wishlist-btn"
                      onClick={() => addToWishlist(product.id)}
                      title="Add to wishlist"
                    >
                      {wishlistIds.includes(product.id) ? (
                        <BsBookmarkFill size={20} />
                      ) : (
                        <BsBookmark size={20} />
                      )}
                    </button>
                  </div>

              ))}
            </div>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResultsPage;
