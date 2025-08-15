import React from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" 
        onClick={() => setIsCartOpen(false)} 
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-800 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors hover:scale-110 transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400">Add some amazing products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-4 bg-gray-800 p-4 rounded-xl hover:bg-gray-750 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h4 className="text-white font-semibold line-clamp-1">{item.name}</h4>
                    <p className="text-gray-400 text-sm">{item.brand}</p>
                    <p className="text-blue-400 font-bold">${item.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-gray-400 hover:text-white transition-colors hover:scale-110 transform"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="text-white w-8 text-center font-semibold">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-400 hover:text-white transition-colors hover:scale-110 transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-red-400 hover:text-red-300 ml-3 transition-colors hover:scale-110 transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-800 p-6 space-y-4 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-white">
                Total: ${getTotalPrice().toFixed(2)}
              </span>
              <button
                onClick={clearCart}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Cart
              </button>
            </div>
            
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;