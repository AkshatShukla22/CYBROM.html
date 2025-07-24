import React from 'react';
import { X } from 'lucide-react';
import { users } from '../data/mockData';

const UserListModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Users</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {users.map((user, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-gray-500 text-sm">{user.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;