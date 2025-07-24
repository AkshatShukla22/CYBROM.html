export const getStatusColor = (status) => {
  const colors = {
    'Completed': 'bg-green-500 text-white',
    'Upcoming': 'bg-orange-500 text-white',
    'Follow-up': 'bg-blue-500 text-white',
    'Re-scheduled': 'bg-purple-500 text-white',
    'Overdue': 'bg-red-500 text-white',
    'In Progress': 'bg-orange-500 text-white',
    'Ongoing': 'bg-black text-white',
    'Draft': 'bg-gray-500 text-white',
    'Archived': 'bg-red-400 text-white',
    'Pending': 'bg-yellow-600 text-white'
  };
  return colors[status] || 'bg-gray-500 text-white';
};

export const getTypeColor = (type) => {
  return type === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
};