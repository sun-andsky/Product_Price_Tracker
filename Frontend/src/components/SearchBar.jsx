import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { fetchSuggestions, fetchProducts } from "../api/api";
import './SearchBar.css'; // assuming your CSS is in this file

function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions(query).then((res) => setSuggestions(res.suggestions));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    const products = await fetchProducts(suggestion);
    if (products && products.length > 0) {
      navigate(`/product/${products[0].id}`);
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-input-group">
        <i className="bi bi-search"></i>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search product"
        />
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(s)}
              className="suggestion-item"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
