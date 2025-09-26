import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'large', message = 'Loading doctors...' }) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-content">
        {/* Main spinner */}
        <div className="spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        
        {/* Loading message */}
        <p className="loading-message">{message}</p>
        
        {/* Loading skeleton cards for better UX */}
        {size === 'large' && (
          <div className="loading-skeleton">
            <div className="skeleton-cards">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-line long"></div>
                      <div className="skeleton-line medium"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  </div>
                  <div className="skeleton-body">
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line long"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple inline spinner for smaller loading states
export const InlineSpinner = () => (
  <div className="inline-spinner">
    <div className="spinner-dot"></div>
    <div className="spinner-dot"></div>
    <div className="spinner-dot"></div>
  </div>
);

export default LoadingSpinner;