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

  useEffect(() => {
    fetchActivitySummary();
  }, []);

  const fetchActivitySummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/activity/summary/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivityData(data);
      } else {
        setError('Failed to fetch activity summary');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <div>Loading activity summary...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!activityData) {
    return <div>No activity data available</div>;
  }

  const activitySummary = activityData.activity_summary?.[0] || {};
  const sectionVisits = activityData.section_visits || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} transition-all duration-300 fixed lg:static inset-y-0 left-0 z-50`}>
          <AdminSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div style={{ padding: '20px' }}>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">User Activity Summary</h2>
                
                {/* Activity Summary Table */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 className="text-xl font-semibold mb-4">Session Information</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Metric</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>First Login</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {formatDateTime(activitySummary.first_login)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>Last Activity</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {formatDateTime(activitySummary.last_activity)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>Active Time</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {formatTime(activitySummary.active_time_seconds || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>Inactive Duration</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {formatTime(activitySummary.inactive_duration_seconds || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>Page Visits</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {activitySummary.page_visits || 0}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>API Calls</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {activitySummary.api_calls || 0}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>Status</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {activitySummary.status || 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section Visits Table */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Most Visited Sections</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Section Name</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Backend Name</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Total Visits</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Time Spent</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Last Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionVisits.length > 0 ? (
                        sectionVisits.map((section, index) => (
                          <tr key={index}>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                              {section.section_name}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                              {section.backend_name || 'N/A'}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                              {section.total_visits || 0}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                              {formatTime(section.total_time_spent_seconds || 0)}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                              {formatDateTime(section.last_visit_time)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                            No section visits recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserActivitySummary;

