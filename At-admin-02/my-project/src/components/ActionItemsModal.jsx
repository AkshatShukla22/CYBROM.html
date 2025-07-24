// ActivityItemsModal.jsx
import React, { useState } from 'react';
import { X, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import '../styles/actionItemsModal.css';

// Mock data for activity items
const activityItems = [
  {
    id: 1,
    title: "Share revised costing with the Buyer and get it approved.",
    status: "In Progress",
    dueDate: "01 May, 2025",
    assignedTo: "Mohd Saleem",
    role: "Merchandiser"
  },
  {
    id: 2,
    title: "Send fabric swatches",
    status: "Pending",
    dueDate: "01 May, 2025",
    assignedTo: "Mohd Saleem",
    role: "Merchandiser"
  },
  {
    id: 3,
    title: "Confirm delivery window",
    status: "Completed",
    dueDate: "01 May, 2025",
    assignedTo: "Mohd Saleem",
    role: "Merchandiser"
  }
];

const ActivityItemsModal = ({ isOpen, onClose }) => {
  const [showDropdown, setShowDropdown] = useState(null);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    const statusColors = {
      'In Progress': 'status-in-progress',
      'Pending': 'status-pending',
      'Completed': 'status-completed',
      'Overdue': 'status-overdue'
    };
    return statusColors[status] || 'status-default';
  };

  const handleActionClick = (action, itemId) => {
    console.log(`${action} clicked for item ${itemId}`);
    setShowDropdown(null);
  };

  const handleDropdownToggle = (itemId) => {
    setShowDropdown(showDropdown === itemId ? null : itemId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Activity Items (3)</h2>
          <button
            onClick={onClose}
            className="close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="modal-content">
          <div className="table-container">
            <table className="activity-table">
              <thead className="table-header">
                <tr>
                  <th className="th-activity-items">Activity Items</th>
                  <th className="th-status">Status</th>
                  <th className="th-due-date">Due Date</th>
                  <th className="th-assigned-to">Assigned to</th>
                  <th className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {activityItems.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell">
                      <div className="activity-title">{item.title}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="due-date">{item.dueDate}</div>
                    </td>
                    <td className="table-cell">
                      <div className="assignee-container">
                        <div className="avatar">M</div>
                        <div className="assignee-info">
                          <div className="assignee-name">{item.assignedTo}</div>
                          <div className="assignee-role">{item.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="action-container">
                        <button
                          onClick={() => handleDropdownToggle(item.id)}
                          className="action-button"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {showDropdown === item.id && (
                          <div className="dropdown-menu">
                            <button
                              onClick={() => handleActionClick('Edit', item.id)}
                              className="dropdown-item"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleActionClick('Delete', item.id)}
                              className="dropdown-item delete"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Status Legend and Action Buttons */}
          <div className="status-legend">
            <div className="legend-container">
              <span className="legend-label">Statuses in dropdown</span>
              <div className="legend-badges">
                <span className="legend-badge status-pending">Pending</span>
                <span className="legend-badge status-in-progress">In Progress</span>
                <span className="legend-badge status-completed">Completed</span>
                <span className="legend-badge status-overdue">Overdue</span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="action-btn">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="action-btn">
                <X className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItemsModal;

