import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { adminGetMaintenanceStatus, adminSetMaintenanceMode } from '../utils/api'

const MaintenanceManagement = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchMaintenanceStatus()
  }, [user?.accessToken])

  const fetchMaintenanceStatus = async () => {
    if (!user?.accessToken) return

    try {
      const data = await adminGetMaintenanceStatus(user.accessToken)
      setMaintenanceMode(data.is_maintenance_mode || false)
    } catch (err) {
      console.error('Error fetching maintenance status:', err)
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('maintenanceMode')
      if (stored) {
        setMaintenanceMode(stored === 'true')
      }
    }
  }

  const handleToggleMaintenance = async (enable) => {
    if (!user?.accessToken) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await adminSetMaintenanceMode(user.accessToken, enable)
      setMaintenanceMode(enable)
      localStorage.setItem('maintenanceMode', enable.toString())
      setSuccess(enable ? 'Maintenance mode enabled. Website is now under maintenance.' : 'Maintenance mode disabled. Website is now operational.')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      console.error('Error setting maintenance mode:', err)
      setError(err.message || 'Failed to update maintenance mode')
      
      // Fallback to localStorage
      setMaintenanceMode(enable)
      localStorage.setItem('maintenanceMode', enable.toString())
      setSuccess(enable ? 'Maintenance mode enabled (local). Website is now under maintenance.' : 'Maintenance mode disabled (local). Website is now operational.')
      
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } finally {
      setLoading(false)
    }
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
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Maintenance Management</h1>
                <p className="text-gray-600 mt-2">Control website maintenance mode</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Maintenance Mode Status</h2>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-lg font-medium text-gray-700">
                      {maintenanceMode ? 'Website is Under Maintenance' : 'Website is Operational'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {maintenanceMode 
                      ? 'Users will see a maintenance page when they try to access the website.'
                      : 'All users can access the website normally.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                    
                    {!maintenanceMode ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800 mb-4">
                          <strong>Warning:</strong> Enabling maintenance mode will prevent all users (except admins) from accessing the website. They will see a maintenance page instead.
                        </p>
                        <button
                          onClick={() => handleToggleMaintenance(true)}
                          disabled={loading}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Enabling...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Enable Maintenance Mode
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800 mb-4">
                          Maintenance mode is currently active. Click the button below to disable it and make the website operational again.
                        </p>
                        <button
                          onClick={() => handleToggleMaintenance(false)}
                          disabled={loading}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Disabling...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Disable Maintenance Mode
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• When maintenance mode is enabled, all users will see a maintenance page.</p>
                      <p>• Admin users can still access the admin panel even during maintenance.</p>
                      <p>• Maintenance mode status is stored and persists across page refreshes.</p>
                      <p>• You can disable maintenance mode at any time to restore normal operations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceManagement



