import React from 'react';
import { Search, Filter, Home, Smartphone, Laptop, Tablet, Headphones } from 'lucide-react';
import DB_DATA from '../data/db.json';

const SearchFilterBar = ({ onSearch, searchTerm, selectedCategory, onCategoryChange }) => {
  const getIcon = (iconName) => {
    const icons = { Home, Smartphone, Laptop, Tablet, Headphones };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <Home className="w-5 h-5" />;
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-8 py-6">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for electronics, brands, models..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl pl-12 pr-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-600"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-3 ml-8">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            {DB_DATA.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {getIcon(category.icon)}
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;