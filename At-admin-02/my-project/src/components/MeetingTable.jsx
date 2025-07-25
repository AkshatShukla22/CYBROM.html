import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Plus, Download, Eye, Edit, Activity, X, MoreHorizontal } from 'lucide-react';

const MeetingTable = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [showRowActions, setShowRowActions] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pageInput, setPageInput] = useState('1');
  const [showActionItems, setShowActionItems] = useState(false);
  const [actionItemsRowActions, setActionItemsRowActions] = useState(null);
  const dropdownRef = useRef(null);
  const actionItemsDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRowActions(null);
      }
      if (actionItemsDropdownRef.current && !actionItemsDropdownRef.current.contains(event.target)) {
        setActionItemsRowActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update page input when current page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Mock data based on the images
  const meetings = [
    {
      id: 1,
      dateTime: '01 May, 2025 at 2pm',
      status: 'Completed',
      type: 'Online',
      buyer: 'Mango Private Limited',
      brand: 'Mango',
      dept: 'Design',
      title: 'Costing Discussion with Zara',
      meetingDate: '01 May, 2025 at 2pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 2,
      dateTime: '02 May, 2025 at 3pm',
      status: 'Upcoming',
      type: 'Offline',
      buyer: 'Cherry Innovations',
      brand: 'Cherry',
      dept: 'Development',
      title: 'UI/UX Review',
      meetingDate: '02 May, 2025 at 3pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 3,
      dateTime: '03 May, 2025 at 10am',
      status: 'Follow-up',
      type: 'Offline',
      buyer: 'Pineapple Inc.',
      brand: 'Pineapple',
      dept: 'Marketing',
      title: 'Campaign Strategy',
      meetingDate: '03 May, 2025 at 10am',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 4,
      dateTime: '04 May, 2025 at 1pm',
      status: 'Re-scheduled',
      type: 'Offline',
      buyer: 'Peach Corp.',
      brand: 'Peach',
      dept: 'Finance',
      title: 'Budget Review',
      meetingDate: '04 May, 2025 at 1pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 5,
      dateTime: '05 May, 2025 at 4pm',
      status: 'Overdue',
      type: 'Online',
      buyer: 'Banana Solutions',
      brand: 'Banana',
      dept: 'Product',
      title: 'Feature Prioritization',
      meetingDate: '05 May, 2025 at 4pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 6,
      dateTime: '06 May, 2025 at 11am',
      status: 'In Progress',
      statusDetail: '(1/3)',
      type: 'Online',
      buyer: 'Coconut Group',
      brand: 'Coconut',
      dept: 'Support',
      title: 'Customer Feedback',
      meetingDate: '06 May, 2025 at 11am',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 7,
      dateTime: '07 May, 2025 at 2pm',
      status: 'Ongoing',
      type: 'Online',
      buyer: 'Lemon Technologies',
      brand: 'Lemon',
      dept: 'Sales',
      title: 'Sales Strategy',
      meetingDate: '07 May, 2025 at 2pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 8,
      dateTime: '08 May, 2025 at 9am',
      status: 'Completed',
      type: 'Offline',
      buyer: 'Grapefruit LLC',
      brand: 'Grapefruit',
      dept: 'Research',
      title: 'Market Analysis',
      meetingDate: '08 May, 2025 at 9am',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 9,
      dateTime: '09 May, 2025 at 3pm',
      status: 'Draft',
      type: 'Offline',
      buyer: 'Kiwi Systems',
      brand: 'Kiwi',
      dept: 'HR',
      title: 'Employee Engagement',
      meetingDate: '09 May, 2025 at 3pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    },
    {
      id: 10,
      dateTime: '10 May, 2025 at 5pm',
      status: 'Archived',
      type: 'Offline',
      buyer: 'Orange Enterprises',
      brand: 'Orange',
      dept: 'Legal',
      title: 'Contract Review',
      meetingDate: '10 May, 2025 at 5pm',
      participants: 'Mohd Saleem +2',
      participantRole: 'Buyer, Sales'
    }
  ];

  // Action Items Data
  const actionItems = [
    {
      id: 1,
      task: 'Share revised costing with the Buyer and get it approved.',
      status: 'In Progress',
      dueDate: '01 May, 2025',
      assignedTo: 'Mohd Saleem',
      role: 'Merchandiser'
    },
    {
      id: 2,
      task: 'Send fabric swatches',
      status: 'Pending',
      dueDate: '01 May, 2025',
      assignedTo: 'Mohd Saleem',
      role: 'Merchandiser'
    },
    {
      id: 3,
      task: 'Confirm delivery window',
      status: 'Completed',
      dueDate: '01 May, 2025',
      assignedTo: 'Mohd Saleem',
      role: 'Merchandiser'
    }
  ];

  const filteredMeetings = meetings.filter(meeting => {
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Draft' && meeting.status === 'Draft') ||
                      (activeTab === 'Archive' && meeting.status === 'Archived');
    
    const matchesSearch = !searchTerm || 
                         meeting.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = filteredMeetings.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedItems.length === filteredMeetings.length && filteredMeetings.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMeetings.map(m => m.id));
    }
  };

  const handleItemSelect = (meetingId) => {
    setSelectedItems(prev => {
      if (prev.includes(meetingId)) {
        return prev.filter(id => id !== meetingId);
      } else {
        return [...prev, meetingId];
      }
    });
  };

  const handleRowAction = (action, meetingId) => {
    console.log(`${action} action for meeting ${meetingId}`);
    if (action === 'Action Items') {
      setShowActionItems(true);
    }
    setShowRowActions(null);
  };

  const handleActionItemRowAction = (action, itemId) => {
    console.log(`${action} action for action item ${itemId}`);
    setActionItemsRowActions(null);
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInput);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getActionItemStatusStyles = (status) => {
    const statusStyles = {
      'In Progress': { background: '#ea580c', color: 'white' },
      'Pending': { background: '#ca8a04', color: 'white' },
      'Completed': { background: '#16a34a', color: 'white' },
      'Overdue': { background: '#dc2626', color: 'white' }
    };
    return statusStyles[status] || { background: '#6b7280', color: 'white' };
  };

  if (showActionItems) {
    return (
      <div style={{ 
        marginLeft: '260px', 
        marginTop: '70px',
        padding: '24px', 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}>
        {/* Back Button */}
        <button
          onClick={() => setShowActionItems(false)}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          ← Back to Meetings
        </button>

        {/* Action Items Header */}
        <div style={{
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#6b7280',
            margin: 0,
            padding: '16px 0',
            borderBottom: '1px solid #e5e7eb'
          }}>Action Items (3)</h2>
        </div>

        {/* Action Items Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: 'calc(100vw - 300px)'
        }}>
          <div style={{ 
            overflowX: 'auto',
            overflowY: 'visible'
          }}>
            <table style={{ 
              width: '100%',
              minWidth: '800px',
              borderCollapse: 'collapse'
            }}>
              <thead style={{ 
                background: '#f8f9fa'
              }}>
                <tr>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6b7280',
                    width: '40%'
                  }}>Action Items</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6b7280',
                    width: '15%'
                  }}>Status</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6b7280',
                    width: '15%'
                  }}>Due Date</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6b7280',
                    width: '20%'
                  }}>Assigned to</th>
                  <th style={{
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6b7280',
                    width: '10%'
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item, index) => (
                  <tr key={item.id} style={{ 
                    borderBottom: index < actionItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <td style={{ 
                      padding: '20px',
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: '1.4'
                    }}>
                      {item.task}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        ...getActionItemStatusStyles(item.status)
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '20px',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {item.dueDate}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#10b981',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          M
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ 
                            fontSize: '14px', 
                            color: '#374151',
                            fontWeight: 500
                          }}>
                            {item.assignedTo}
                          </span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#9ca3af'
                          }}>
                            {item.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '20px',
                      position: 'relative'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionItemsRowActions(actionItemsRowActions === item.id ? null : item.id);
                        }}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <MoreHorizontal style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                      
                      {actionItemsRowActions === item.id && (
                        <div
                          ref={actionItemsDropdownRef}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: '8px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            zIndex: 1000,
                            minWidth: '120px',
                            padding: '4px',
                            marginTop: '4px'
                          }}
                        >
                          <button
                            onClick={() => handleActionItemRowAction('Edit', item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#374151',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <Edit style={{ width: '14px', height: '14px' }} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleActionItemRowAction('Delete', item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              padding: '8px 12px',
                              background: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#dc2626',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <X style={{ width: '14px', height: '14px' }} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Legend */}
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '100px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          minWidth: '160px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '12px'
          }}>
            Statuses in dropdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Pending', 'In Progress', 'Completed', 'Overdue'].map(status => (
              <span key={status} style={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
                ...getActionItemStatusStyles(status)
              }}>
                {status}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      marginLeft: '260px', 
      marginTop: '70px',
      padding: '24px', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0
          }}>Buyer Meeting List View</h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span style={{ color: '#8b5cf6', cursor: 'pointer' }}>Buyer Meeting</span>
            <span style={{ color: '#9ca3af' }}>→</span>
            <span>Buyer Meeting List View</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#8b5cf6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            <Plus style={{ width: '16px', height: '16px' }} />
            Create New Meeting
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '24px',
        background: '#e5e7eb',
        padding: '4px',
        borderRadius: '8px',
        width: 'fit-content'
      }}>
        {[
          { name: 'All', count: 100 },
          { name: 'Draft', count: 50 },
          { name: 'Archive', count: 75 }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: activeTab === tab.name ? '#8b5cf6' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: activeTab === tab.name ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <span>{tab.name}</span>
            <span style={{
              background: activeTab === tab.name ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
              color: activeTab === tab.name ? 'white' : '#6b7280',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Search anything here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          />
        </div>
        
        {[
          'Buyer Name',
          'Brand',
          'Dept',
          'Meeting Type',
          'Participants',
          'Meeting Date',
          'Status'
        ].map(filter => (
          <button
            key={filter}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{filter}</span>
            <ChevronDown style={{ width: '14px', height: '14px', color: '#6b7280' }} />
          </button>
        ))}
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        width: '100%'
      }}>
        <div style={{ 
          overflowX: 'auto',
          overflowY: 'visible',
          width: '100%',
          maxWidth: '100%'
        }}>
          <table style={{ 
            width: '1400px',
            borderCollapse: 'collapse',
            tableLayout: 'fixed'
          }}>
            <thead style={{ 
              background: '#f9fafb', 
              borderBottom: '1px solid #e5e7eb',
              position: 'sticky',
              top: 0,
              zIndex: 2
            }}>
              <tr>
                <th style={{
                  padding: '16px 12px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '60px',
                  position: 'sticky',
                  left: 0,
                  background: '#f9fafb',
                  zIndex: 3,
                  borderRight: '1px solid #e5e7eb'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredMeetings.length && filteredMeetings.length > 0}
                    onChange={handleSelectAll}
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      border: selectedItems.length === filteredMeetings.length && filteredMeetings.length > 0 ? 'none' : '2px solid #d1d5db',
                      borderRadius: '3px',
                      background: selectedItems.length === filteredMeetings.length && filteredMeetings.length > 0 ? '#8b5cf6' : 'white',
                      position: 'relative',
                      backgroundImage: selectedItems.length === filteredMeetings.length && filteredMeetings.length > 0 ? 
                        "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none' d='m4 8 2.5 2.5L12 5'/%3e%3c/svg%3e\")" : 'none',
                      backgroundSize: '14px 14px',
                      backgroundPosition: '1px 1px',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '140px' }}>Date & Time</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '110px' }}>Status</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '80px' }}>Type</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '180px' }}>Buyer Name</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '100px' }}>Brand</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '100px' }}>Dept.</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '180px' }}>Title</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '140px' }}>Meeting Date</th>
                <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', width: '160px' }}>Participants</th>
                <th style={{ 
                  padding: '16px 12px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: '#6b7280', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  right: 0,
                  background: '#f9fafb',
                  zIndex: 3,
                  borderLeft: '1px solid #e5e7eb',
                  width: '80px'
                }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentMeetings.map((meeting) => (
                <tr key={meeting.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ 
                    padding: '16px 12px',
                    position: 'sticky',
                    left: 0,
                    background: 'white',
                    zIndex: 1,
                    borderRight: '1px solid #f3f4f6',
                    width: '60px'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(meeting.id)}
                      onChange={() => handleItemSelect(meeting.id)}
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        border: selectedItems.includes(meeting.id) ? 'none' : '2px solid #d1d5db',
                        borderRadius: '3px',
                        background: selectedItems.includes(meeting.id) ? '#8b5cf6' : 'white',
                        position: 'relative',
                        backgroundImage: selectedItems.includes(meeting.id) ? 
                          "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none' d='m4 8 2.5 2.5L12 5'/%3e%3c/svg%3e\")" : 'none',
                        backgroundSize: '14px 14px',
                        backgroundPosition: '1px 1px',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>{meeting.dateTime}</td>
                  <td style={{ padding: '16px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                      ...getStatusStyles(meeting.status)
                    }}>
                      {meeting.status}{meeting.statusDetail || ''}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: meeting.type === 'Online' ? '#d1fae5' : '#f3f4f6',
                      color: meeting.type === 'Online' ? '#065f46' : '#6b7280',
                      whiteSpace: 'nowrap'
                    }}>
                      {meeting.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{meeting.buyer}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>{meeting.brand}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{meeting.dept}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap' }}>{meeting.title}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{meeting.meetingDate}</td>
                  <td style={{ padding: '16px 12px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#10b981',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '2px solid white',
                        flexShrink: 0
                      }}>
                        M
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>{meeting.participants}</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{meeting.participantRole}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ 
                    padding: '16px 12px', 
                    position: 'sticky', 
                    right: 0, 
                    background: 'white',
                    zIndex: 1,
                    borderLeft: '1px solid #f3f4f6',
                    width: '80px'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRowActions(showRowActions === meeting.id ? null : meeting.id);
                        }}
                        style={{
                          padding: '8px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <MoreHorizontal style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      </button>
                      
                      {showRowActions === meeting.id && (
                        <div
                          ref={dropdownRef}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: '0px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            zIndex: 10,
                            minWidth: '140px',
                            padding: '4px'
                          }}
                        >
                          {[
                            { icon: Eye, label: 'View', color: '#374151' },
                            { icon: Edit, label: 'Edit', color: '#374151' },
                            { icon: Activity, label: 'Action Items', color: '#374151' },
                            { icon: X, label: 'Delete', color: '#dc2626' }
                          ].map((action) => (
                            <button
                              key={action.label}
                              onClick={() => handleRowAction(action.label, meeting.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: action.color,
                                textAlign: 'left'
                              }}
                            >
                              <action.icon style={{ width: '14px', height: '14px' }} />
                              <span>{action.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <span>Items Per Page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span>{startIndex + 1} - {Math.min(endIndex, filteredMeetings.length)} of {filteredMeetings.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                minWidth: '40px',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              ‹
            </button>
            
            {generatePageNumbers().map((page, index) => {
              if (page === '...') {
                return <span key={index} style={{ padding: '8px 4px', color: '#9ca3af' }}>...</span>;
              }
              
              if (page === currentPage) {
                return (
                  <input
                    key={index}
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyPress={handlePageInputSubmit}
                    onBlur={() => {
                      const pageNum = parseInt(pageInput);
                      if (pageNum >= 1 && pageNum <= totalPages) {
                        setCurrentPage(pageNum);
                      } else {
                        setPageInput(currentPage.toString());
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      background: '#8b5cf6',
                      border: '1px solid #8b5cf6',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '14px',
                      textAlign: 'center',
                      minWidth: '40px',
                      width: '50px'
                    }}
                  />
                );
              }
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    color: '#6b7280',
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '40px'
                  }}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#6b7280',
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                minWidth: '40px',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              ›
            </button>
            
            <span style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginLeft: '12px' 
            }}>
              {startIndex + 1}-{Math.min(endIndex, filteredMeetings.length)} of {filteredMeetings.length}
            </span>
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {selectedItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#000000',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 1000
        }}>
          <span>{selectedItems.length} items selected</span>
          <button
            onClick={() => setSelectedItems([])}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px'
            }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function for status styles
const getStatusStyles = (status) => {
  const statusStyles = {
    'Completed': { background: '#16a34a', color: 'white' },
    'Upcoming': { background: '#eab308', color: 'white' },
    'Follow-up': { background: '#3b82f6', color: 'white' },
    'Re-scheduled': { background: '#8b5cf6', color: 'white' },
    'Overdue': { background: '#dc2626', color: 'white' },
    'In Progress': { background: '#ea580c', color: 'white' },
    'Ongoing': { background: '#374151', color: 'white' },
    'Draft': { background: '#6b7280', color: 'white' },
    'Archived': { background: '#dc2626', color: 'white' }
  };
  return statusStyles[status] || { background: '#6b7280', color: 'white' };
};

export default MeetingTable;