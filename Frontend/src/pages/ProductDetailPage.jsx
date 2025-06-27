import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PriceHistoryGraph from "../components/PriceHistoryGraph";
import './ProductDetailPage.css';
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { BASE_URL } from "../api/api";


const ProductDetailPage = () => {
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setError('Product ID is missing.');
      return;
    }

    const url = `${BASE_URL}/product/${productId}/`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setProductData(data))
      .catch((error) => setError(`Error fetching product details: ${error.message}`));
  }, [productId]);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (typeof price === 'string') return price;
    return `₹${price.toLocaleString()}`;
  };

    // Define this helper function inside the component
  const getRecommendationClass = (text) => {
    if (!text) return "";
    if (text.toLowerCase().includes("great deal")) return "recommendation success";
    if (text.toLowerCase().includes("good price")) return "recommendation warning";
    if (text.toLowerCase().includes("wait")) return "recommendation danger";
    return "recommendation default";
  };



  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<BsStarFill key={`full-${i}`} color="#facc15" size={18} />);
    }

    if (halfStar) {
      stars.push(<BsStarHalf key="half" color="#facc15" size={18} />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<BsStar key={`empty-${i}`} color="#d1d5db" size={18} />);
    }

    return <span className="rating-stars">{stars}</span>;
  };


  return (
    <div className="product-container">
      {error && <p className="text-red-500">{error}</p>}

      {productData ? (
        <div className='detailed-info'>
          <div className="img-info">
            <img
              src={productData.Image}
              alt={productData.Product_Name}
              className="detail-page-image"
            />
            <div className="product-details">
              <div className={getRecommendationClass(productData.Recommendation)}>
                  {productData.Recommendation}
              </div>
              <h1 className="product-header">{productData.Product_Name}</h1>
              <div className="detail-page-product-info">
                
                <div className="rating">
                  {renderStars(parseFloat(productData.Ratings))}
                  <span style={{ marginLeft: "0.5rem", color: "#4b5563" }}>
                    {productData.Ratings} / 5
                  </span>
                </div>
                <p className='reviews'>{productData.Reviews}</p>
                <p className='detail-page-price'>{formatPrice(productData.Latest_Price)}</p>

                <a
                  href={productData.Links}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='button'
                >
                  View on {productData.Source}
                </a>

              </div>
            
            </div>
          </div>
          
          <div className="analysis">
            {/* Price History Graph */}
            {productData.Price_History && (
              <div className="graph-wrapper">
                <PriceHistoryGraph priceHistory={productData.Price_History} />
              </div>
            )}

            {/* Min/Max Prices */}
            <div className="min-max-container">
              <p className='min'>Minimum Price: {formatPrice(productData.Min_Price)}</p>
              <p className='max'>Maximum Price: {formatPrice(productData.Max_Price)}</p>
            </div>
          </div>

            
          

          
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProductDetailPage;
