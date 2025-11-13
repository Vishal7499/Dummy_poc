import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SystemSettingsManager = () => {
  const { user } = useAuth();
  const apiBaseUrl = API_BASE;
  const authToken = user?.accessToken || null;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/system/settings/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || []);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingKey(setting.setting_key);
    setEditValue(setting.setting_value);
  };

  const handleSave = async (settingKey) => {
    try {
      const response = await fetch(`${apiBaseUrl}/system/settings/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: settingKey,
          setting_value: editValue,
        }),
      });

      if (response.ok) {
        await fetchSettings();
        setEditingKey(null);
        setEditValue('');
        alert('Setting updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update setting'}`);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Error updating setting');
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">System Control Settings</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Setting Key</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Value</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Data Type</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((setting) => (
                      <tr key={setting.setting_key}>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {setting.setting_key}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {editingKey === setting.setting_key ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              style={{ width: '100%', padding: '5px' }}
                            />
                          ) : (
                            setting.setting_value
                          )}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {setting.setting_description || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {setting.data_type}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {editingKey === setting.setting_key ? (
                            <>
                              <button
                                onClick={() => handleSave(setting.setting_key)}
                                style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                style={{ padding: '5px 10px', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(setting)}
                              style={{ padding: '5px 10px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsManager;

