import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/DashboardAnalytics.css';

const DashboardAnalytics = ({ appointments, stats }) => {
  const [analyticsData, setAnalyticsData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
    byLocation: [],
    statusDistribution: []
  });
  const [analyticsFilter, setAnalyticsFilter] = useState('daily');

  useEffect(() => {
    if (appointments.length > 0) {
      generateAnalyticsData();
    }
  }, [appointments]);

  const generateAnalyticsData = () => {
    const completedAppointments = appointments.filter(app => 
      ['completed', 'confirmed', 'in-progress'].includes(app.status)
    );

    // Generate daily data for last 30 days
    const dailyData = generateDailyData(completedAppointments);
    
    // Generate weekly data for last 12 weeks
    const weeklyData = generateWeeklyData(completedAppointments);
    
    // Generate monthly data for last 12 months
    const monthlyData = generateMonthlyData(completedAppointments);
    
    // Generate yearly data
    const yearlyData = generateYearlyData(completedAppointments);
    
    // Generate location-wise data - Use ALL appointments, not just completed
    const locationData = generateLocationData(appointments);
    
    // Generate status distribution
    const statusData = generateStatusData(appointments);

    setAnalyticsData({
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData,
      byLocation: locationData,
      statusDistribution: statusData
    });
  };

  const generateDailyData = (appointments) => {
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = appointments.filter(app => {
        const appDate = new Date(app.appointmentDate).toISOString().split('T')[0];
        return appDate === dateStr;
      }).length;
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        patients: count,
        fullDate: dateStr
      });
    }
    
    return last30Days;
  };

  const generateWeeklyData = (appointments) => {
    const last12Weeks = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const count = appointments.filter(app => {
        const appDate = new Date(app.appointmentDate);
        return appDate >= weekStart && appDate <= weekEnd;
      }).length;
      
      last12Weeks.push({
        week: `Week ${12 - i}`,
        patients: count,
        period: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
      });
    }
    
    return last12Weeks;
  };

  const generateMonthlyData = (appointments) => {
    const last12Months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const count = appointments.filter(app => {
        const appDate = new Date(app.appointmentDate);
        const appMonthStr = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;
        return appMonthStr === monthStr;
      }).length;
      
      last12Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        patients: count
      });
    }
    
    return last12Months;
  };

  const generateYearlyData = (appointments) => {
    const yearlyStats = {};
    
    appointments.forEach(app => {
      const year = new Date(app.appointmentDate).getFullYear();
      yearlyStats[year] = (yearlyStats[year] || 0) + 1;
    });
    
    return Object.entries(yearlyStats)
      .map(([year, count]) => ({ year, patients: count }))
      .sort((a, b) => a.year - b.year);
  };

  const generateLocationData = (appointments) => {
    const locationStats = {};
    
    appointments.forEach(app => {
      const location = app.locationName || 'Unknown Location';
      locationStats[location] = (locationStats[location] || 0) + 1;
    });
    
    return Object.entries(locationStats)
      .map(([location, count]) => ({ location, patients: count }))
      .sort((a, b) => b.patients - a.patients);
  };

  const generateStatusData = (appointments) => {
    const statusStats = {};
    
    appointments.forEach(app => {
      statusStats[app.status] = (statusStats[app.status] || 0) + 1;
    });
    
    const colors = {
      scheduled: '#ffc107',
      confirmed: '#17a2b8',
      'in-progress': '#fd7e14',
      completed: '#28a745',
      cancelled: '#dc3545',
      'no-show': '#6c757d'
    };
    
    return Object.entries(statusStats)
      .map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        color: colors[status] || '#007bff'
      }));
  };

  return (
    <div className="analytics-container">
      {/* Analytics Filter */}
      <div className="analytics-filter-section">
        <div className="analytics-filter-tabs">
          <button 
            className={`analytics-filter-tab ${analyticsFilter === 'daily' ? 'active' : ''}`}
            onClick={() => setAnalyticsFilter('daily')}
          >
            Daily (30 days)
          </button>
          <button 
            className={`analytics-filter-tab ${analyticsFilter === 'weekly' ? 'active' : ''}`}
            onClick={() => setAnalyticsFilter('weekly')}
          >
            Weekly (12 weeks)
          </button>
          <button 
            className={`analytics-filter-tab ${analyticsFilter === 'monthly' ? 'active' : ''}`}
            onClick={() => setAnalyticsFilter('monthly')}
          >
            Monthly (12 months)
          </button>
          <button 
            className={`analytics-filter-tab ${analyticsFilter === 'yearly' ? 'active' : ''}`}
            onClick={() => setAnalyticsFilter('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="analytics-charts-grid">
        {/* Time-based Patient Attendance Chart */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3>
              Patient Attendance - {analyticsFilter.charAt(0).toUpperCase() + analyticsFilter.slice(1)}
            </h3>
            <p>Data points: {analyticsData[analyticsFilter]?.length || 0}</p>
          </div>
          <div className="chart-container">
            {analyticsData[analyticsFilter] && analyticsData[analyticsFilter].length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {analyticsFilter === 'daily' || analyticsFilter === 'weekly' ? (
                  <LineChart 
                    data={analyticsData[analyticsFilter]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={analyticsFilter === 'daily' ? 'date' : 'week'} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                ) : (
                  <BarChart 
                    data={analyticsData[analyticsFilter]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={analyticsFilter === 'monthly' ? 'month' : 'year'} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="patients" fill="#8884d8" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message">
                No data available for {analyticsFilter} view
              </div>
            )}
          </div>
        </div>

        {/* Location-wise Patient Distribution */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3>Patients by Location</h3>
            <p>Total locations: {analyticsData.byLocation?.length || 0}</p>
          </div>
          <div className="chart-container">
            {analyticsData.byLocation && analyticsData.byLocation.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={analyticsData.byLocation}
                  margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="location" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patients" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message">
                No location data available
              </div>
            )}
          </div>
        </div>

        {/* Appointment Status Distribution */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3>Appointment Status Distribution</h3>
            <p>Total statuses: {analyticsData.statusDistribution?.length || 0}</p>
          </div>
          <div className="chart-container">
            {analyticsData.statusDistribution && analyticsData.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ status, count, percent }) => 
                      `${status}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message">
                No status data available
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="analytics-chart-card">
          <div className="chart-header">
            <h3>Summary Statistics</h3>
          </div>
          <div className="summary-stats">
            <div className="summary-stat-item">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
            <div className="summary-stat-item">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="summary-stat-item">
              <div className="stat-number">
                {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
            <div className="summary-stat-item">
              <div className="stat-number">{analyticsData.byLocation.length}</div>
              <div className="stat-label">Active Locations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;