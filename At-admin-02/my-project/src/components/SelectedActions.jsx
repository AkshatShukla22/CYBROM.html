import React from 'react';
import { Download, X } from 'lucide-react';

const SelectedActions = ({ selectedItems, onClear }) => {
  if (selectedItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border px-6 py-4 flex items-center space-x-4 z-40">
      <span className="text-sm text-gray-600">
        {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
      </span>
      <div className="flex space-x-2">
        <button className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
          <X className="w-4 h-4" />
          <span>Delete</span>
        </button>
        <button 
          onClick={onClear}
          className="px-3 py-2 border rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default SelectedActions;