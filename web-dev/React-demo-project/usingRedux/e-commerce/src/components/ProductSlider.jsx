import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import '../style/productSlider.css';

const ProductSlider = ({ products, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const itemsPerView = 4; // Number of products visible at once

  useEffect(() => {
    if (!isAutoPlaying || products.length <= itemsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, products.length - itemsPerView);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 3000); // Auto-slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length, itemsPerView]);

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - itemsPerView);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - itemsPerView);
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  if (!products || products.length === 0) {
    return <div className="no-products">No products to display</div>;
  }

  const canSlide = products.length > itemsPerView;

  return (
    <div 
      className="product-slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="slider-container">
        {canSlide && (
          <button 
            className="slider-nav prev"
            onClick={goToPrevious}
            disabled={!canSlide}
          >
            ❮
          </button>
        )}

        <div className="slider-wrapper" ref={sliderRef}>
          <div 
            className="slider-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              transition: 'transform 0.5s ease-in-out'
            }}
          >
            {products.map((product) => (
              <div key={product.id} className="slider-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {canSlide && (
          <button 
            className="slider-nav next"
            onClick={goToNext}
            disabled={!canSlide}
          >
            ❯
          </button>
        )}
      </div>

      {canSlide && (
        <div className="slider-indicators">
          {Array.from({ length: Math.max(0, products.length - itemsPerView + 1) }).map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      <div className="slider-info">
        <span className="slider-counter">
          {currentIndex + 1} - {Math.min(currentIndex + itemsPerView, products.length)} of {products.length}
        </span>
        <div className="slider-controls">
          <button
            className={`auto-play-btn ${isAutoPlaying ? 'active' : ''}`}
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;