import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🔍</div>
          <h3 className="text-3xl font-bold text-white mb-4">No products found</h3>
          <p className="text-gray-400 text-lg">Try adjusting your search or category filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <div className="grid grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;