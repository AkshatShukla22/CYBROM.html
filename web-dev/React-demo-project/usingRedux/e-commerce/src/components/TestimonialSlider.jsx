import React from 'react';

const ServiceFeatures = () => {
  const features = [
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₹999',
      detail: 'Fast & reliable delivery'
    },
    {
      icon: '🔄',
      title: 'Easy Returns',
      description: 'Hassle-free returns within 30 days',
      detail: 'No questions asked'
    },
    {
      icon: '🛡️',
      title: 'Secure Payment',
      description: '100% secure payment gateway',
      detail: 'SSL encrypted transactions'
    },
    {
      icon: '⚡',
      title: 'Fast Delivery',
      description: 'Same day delivery in major cities',
      detail: 'Track your order real-time'
    },
    {
      icon: '🎧',
      title: '24/7 Support',
      description: 'Round the clock customer support',
      detail: 'We are here to help'
    },
    {
      icon: '💯',
      title: 'Quality Guarantee',
      description: 'Only authentic products',
      detail: 'Premium quality assured'
    }
  ];

  return (
    <section className="service-features">
      <div className="features-container">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">
              {feature.icon}
            </div>
            <div className="feature-content">
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <span className="feature-detail">{feature.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceFeatures;