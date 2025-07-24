import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MeetingTable from './components/MeetingTable';
import ActionItemsModal from './components/ActionItemsModal';
import UserListModal from './components/UserListModal';
import SelectedActions from './components/SelectedActions';
import { meetings } from './data/mockData';

const App = () => {
  const [showActionItems, setShowActionItems] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === meetings.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(meetings.map(meeting => meeting.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <MeetingTable
          onShowActionItems={() => setShowActionItems(true)}
          onShowUserList={() => setShowUserList(true)}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onSelectAll={handleSelectAll}
        />
        
        <ActionItemsModal
          isOpen={showActionItems}
          onClose={() => setShowActionItems(false)}
        />
        
        <UserListModal
          isOpen={showUserList}
          onClose={() => setShowUserList(false)}
        />
        
        <SelectedActions
          selectedItems={selectedItems}
          onClear={handleClearSelection}
        />
      </div>
    </div>
  );
};

export default App;