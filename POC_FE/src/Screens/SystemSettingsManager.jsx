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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

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
      } else {
        setMessage({ type: 'error', text: 'Failed to load settings' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Error loading settings' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting) => {
    setEditingKey(setting.setting_key);
    setEditValue(setting.setting_value);
    setMessage({ type: '', text: '' });
  };

  const handleSave = async (settingKey) => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
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
        setMessage({ type: 'success', text: 'Setting updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update setting' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setMessage({ type: 'error', text: 'Error updating setting' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
    setMessage({ type: '', text: '' });
  };

  const getInputType = (dataType) => {
    if (dataType?.toLowerCase() === 'boolean' || dataType?.toLowerCase() === 'bool') {
      return 'checkbox';
    }
    if (dataType?.toLowerCase() === 'integer' || dataType?.toLowerCase() === 'int' || dataType?.toLowerCase() === 'number') {
      return 'number';
    }
    return 'text';
  };

  const isBoolean = (value, dataType) => {
    if (dataType?.toLowerCase() === 'boolean' || dataType?.toLowerCase() === 'bool') {
      return true;
    }
    if (value === 'true' || value === 'false' || value === true || value === false) {
      return true;
    }
    return false;
  };

  const handleBooleanToggle = async (setting) => {
    const currentValue = setting.setting_value === 'true' || setting.setting_value === true;
    const newValue = !currentValue;
    
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const response = await fetch(`${apiBaseUrl}/system/settings/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setting_key: setting.setting_key,
          setting_value: newValue.toString(),
        }),
      });

      if (response.ok) {
        await fetchSettings();
        setMessage({ type: 'success', text: 'Setting updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update setting' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setMessage({ type: 'error', text: 'Error updating setting' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Don't show full page loader - show inline loader instead

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
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
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
              {/* Header */}
              <div className="mb-6 mt-4">
                <h1 className="text-3xl font-bold text-gray-900">System Control Settings</h1>
                {/* <p className="text-gray-600 mt-1">Manage and configure system-wide settings and preferences</p> */}
              </div>

              {/* Message */}
              {message.text && (
                <div className={`mb-4 px-4 py-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading settings...</p>
                  </div>
                </div>
              ) : settings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No settings available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settings.map((setting) => (
                    <div key={setting.setting_key} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        {setting.setting_description && (
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">{setting.setting_description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Type: <span className="font-medium">{setting.data_type || 'String'}</span>
                        </p>
                      </div>

                      <div className="mt-auto">
                        {isBoolean(setting.setting_value, setting.data_type) ? (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Current Value</label>
                              <p className="text-sm text-gray-600">
                                {setting.setting_value === 'true' || setting.setting_value === true ? 'Enabled' : 'Disabled'}
                              </p>
                            </div>
                            <button
                              onClick={() => handleBooleanToggle(setting)}
                              disabled={saving}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-3 ${
                                setting.setting_value === 'true' || setting.setting_value === true
                                  ? 'bg-blue-600' 
                                  : 'bg-gray-300'
                              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.setting_value === 'true' || setting.setting_value === true
                                    ? 'translate-x-6' 
                                    : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ) : (
                          <div>
                            {editingKey === setting.setting_key ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Edit Value
                                  </label>
                                  <input
                                    type={getInputType(setting.data_type)}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={saving}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSave(setting.setting_key)}
                                    disabled={saving}
                                    className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {saving ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        Saving...
                                      </>
                                    ) : (
                                      'Save'
                                    )}
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Current Value
                                  </label>
                                  <div className="px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 break-words">
                                    {setting.setting_value || 'N/A'}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleEdit(setting)}
                                  className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsManager;

