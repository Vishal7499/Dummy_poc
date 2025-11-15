import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'

const SystemSettings = () => {
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [settings, setSettings] = useState({
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireTwoFactor: false,
    emailNotifications: true,
    systemMaintenance: false
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }, 1000)
  }

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
              {/* Header */}
              <div className="mb-4 mt-4">
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                {/* <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p> */}
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

              {/* Settings Sections */}
              <div className="space-y-4">
                {/* Security Settings */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Security Settings</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.passwordMinLength}
                        onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Require Two-Factor Authentication</label>
                        <p className="text-sm text-gray-500">Enforce 2FA for all users</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, requireTwoFactor: !settings.requireTwoFactor })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.requireTwoFactor ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.requireTwoFactor ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Notification Settings</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-sm text-gray-500">Send email notifications for important events</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Maintenance */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">System Maintenance</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                        <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, systemMaintenance: !settings.systemMaintenance })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.systemMaintenance ? 'bg-red-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.systemMaintenance ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings








