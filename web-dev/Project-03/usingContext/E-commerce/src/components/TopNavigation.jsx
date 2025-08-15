import React, { useState } from 'react';
import { ShoppingCart, Home, Smartphone, Gift, User, Heart, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';

const TopNavigation = () => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Smartphone },
    { id: 'deals', label: 'Deals', icon: Gift },
    { id: 'about', label: 'About', icon: User },
    { id: 'support', label: 'Support', icon: Bell }
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white py-2 px-8">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <span className="animate-pulse">🔥 Hot Deals: Up to 50% OFF on Electronics!</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Free Shipping on orders over $299</span>
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
        </div>
      </div>

      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                ElectroMart
              </div>
              <div className="ml-3 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-xs font-medium text-white animate-pulse">
                Premium
              </div>
            </div>

            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                <Heart className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 transform"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-bounce font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button className="p-2 text-gray-300 hover:text-white transition-colors hover:scale-110 transform">
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default TopNavigation;