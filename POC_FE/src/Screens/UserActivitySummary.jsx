import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const UserActivitySummary = () => {
  const { user } = useAuth();
  const apiBaseUrl = API_BASE;
  const authToken = user?.accessToken || null;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (authToken) {
      fetchActivitySummary();
    }
  }, [authToken]);

  const fetchActivitySummary = async () => {
    if (!authToken) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (username) {
        params.append('username', username);
      }
      if (fromDate) {
        params.append('from_date', fromDate);
      }
      if (toDate) {
        params.append('to_date', toDate);
      }
      
      const queryString = params.toString();
      const url = `${apiBaseUrl}/activity/summary/${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching activity summary with URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivityData(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch activity summary' }));
        setError(errorData.error || 'Failed to fetch activity summary');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch activity summary');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchActivitySummary();
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setUsername('');
    // Fetch with empty filters after a short delay to allow state to update
    setTimeout(() => {
      fetchActivitySummary();
    }, 100);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading && !activityData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Small when closed, overlay when open */}
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-0 overflow-hidden'}`}>
            <AdminSidebar
              isMobileOpen={isMobileSidebarOpen}
              setIsMobileOpen={setIsMobileSidebarOpen}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
          
          {/* Overlay Sidebar when expanded */}
          {!isSidebarCollapsed && (
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg">
              <AdminSidebar
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
              />
            </div>
          )}

          {/* Main Content */}
          <div 
            className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300"
            style={{
              marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
                ? (isSidebarCollapsed ? '0px' : '256px')
                : '0px'
            }}
          >
            <Navbar
              onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              isSidebarCollapsed={isSidebarCollapsed}
            />
            <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center" style={{ paddingTop: '80px' }}>
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading activity summary...</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const activitySummaries = activityData?.activity_summary || [];
  const sectionVisits = activityData?.section_visits || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Small when closed, overlay when open */}
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-0 overflow-hidden'}`}>
          <AdminSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>
        
        {/* Overlay Sidebar when expanded */}
        {!isSidebarCollapsed && (
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg">
            <AdminSidebar
              isMobileOpen={isMobileSidebarOpen}
              setIsMobileOpen={setIsMobileSidebarOpen}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
        )}

        {/* Main Content */}
        <div 
          className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300"
          style={{
            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
              ? (isSidebarCollapsed ? '0px' : '256px')
              : '0px'
          }}
        >
          <Navbar
            onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto p-6" style={{ paddingTop: '80px' }}>
            <div className="max-w-7xl mx-auto">
              <div style={{ padding: '20px' }}>
                {/* <h2 className="text-3xl font-bold text-gray-900 mb-6">User Activity Summary</h2> */}
                
                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Username Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* From Date Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* To Date Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleApplyFilters}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={handleResetFilters}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                {/* Activity Summary Table - Multiple Sessions */}
                {activityData && activitySummaries.length > 0 && (
                  <>
                    <div className="bg-white border border-[#003366] rounded-lg overflow-hidden mb-6">
                      <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Activity Summary - All Sessions</h3>
                      </div>
                      <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container" style={{ width: '100%' }}>
                        <table className="w-full text-sm border border-[#003366]" style={{ minWidth: '1400px' }}>
                          <thead className="bg-gray-100 text-[#003366] sticky top-0">
                            <tr>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Username</th>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">First Login</th>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Last Login</th>
                              <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">Active Time</th>
                              <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">Inactive Duration</th>
                              <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">Page Visits</th>
                              <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">API Calls</th>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Most Visited Page</th>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Status</th>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Last Logout Time</th>
                              <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Logout Reason</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {activitySummaries.map((summary, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-3 px-3 text-gray-800 font-medium whitespace-nowrap">{summary.username || 'N/A'}</td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{formatDateTime(summary.first_login)}</td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{formatDateTime(summary.last_login)}</td>
                                <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatTime(summary.active_time_seconds || 0)}</td>
                                <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatTime(summary.inactive_duration_seconds || 0)}</td>
                                <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{summary.page_visits || 0}</td>
                                <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{summary.api_calls || 0}</td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{summary.most_visited_page || '-'}</td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: summary.status === 'Active' ? '#d1fae5' : summary.status === 'SessionTimeout' ? '#fee2e2' : '#e5e7eb',
                                    color: summary.status === 'Active' ? '#065f46' : summary.status === 'SessionTimeout' ? '#991b1b' : '#374151'
                                  }}>
                                    {summary.status || 'N/A'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{summary.last_logout_time ? formatDateTime(summary.last_logout_time) : '-'}</td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{summary.logout_reason || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  {/* Section Visits Table */}
                  <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
                    <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
                      <h3 className="text-sm font-semibold">Most Visited Sections</h3>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container" style={{ width: '100%' }}>
                      <table className="w-full text-sm border border-[#003366]">
                        <thead className="bg-gray-100 text-[#003366] sticky top-0">
                          <tr>
                            <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Section Name</th>
                            <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Backend Name</th>
                            <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">Total Visits</th>
                            <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">Time Spent</th>
                            <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Last Visit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {sectionVisits.length > 0 ? (
                            sectionVisits.map((section, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="py-3 px-3 text-gray-800 font-medium whitespace-nowrap">{section.section_name}</td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{section.backend_name || 'N/A'}</td>
                                <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{section.total_visits || 0}</td>
                                <td className="py-3 px-3 text-right text-gray-700 whitespace-nowrap">{formatTime(section.total_time_spent_seconds || 0)}</td>
                                <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{formatDateTime(section.last_visit_time)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 px-3 text-center text-gray-500">No section visits recorded</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </>
                )}
                
                {!activityData && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    No activity data available. Please apply filters to view data.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserActivitySummary;

