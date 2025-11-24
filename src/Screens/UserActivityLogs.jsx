import React, { useState, useEffect } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { adminGetActivityLogs } from '../utils/api'

const UserActivityLogs = () => {
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user?.accessToken) {
      fetchLogs()
    }
  }, [user?.accessToken])

  const fetchLogs = async () => {
    // Dummy data for demo fallback
    const dummyLogs = [
      { id: 1, username: 'adminkotak', login_time: '2025-11-07 11:00:00', logout_time: null, status: 'Active' },
      { id: 2, username: 'john.doe', login_time: '2025-11-07 10:30:00', logout_time: '2025-11-07 18:00:00', status: 'LoggedOut' },
      { id: 3, username: 'jane.smith', login_time: '2025-11-06 15:00:00', logout_time: '2025-11-06 20:00:00', status: 'LoggedOut' },
      { id: 4, username: 'sarah.jones', login_time: '2025-11-07 08:00:00', logout_time: null, status: 'Active' },
      { id: 5, username: 'emily.davis', login_time: '2025-11-07 07:00:00', logout_time: '2025-11-07 19:00:00', status: 'LoggedOut' },
      { id: 6, username: 'robert.wilson', login_time: '2025-11-05 09:00:00', logout_time: '2025-11-05 17:00:00', status: 'LoggedOut' },
      { id: 7, username: 'david.miller', login_time: '2025-11-04 16:00:00', logout_time: '2025-11-04 22:00:00', status: 'LoggedOut' }
    ]

    if (!user?.accessToken) {
      setError('Authentication required')
      setLogs(dummyLogs)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await adminGetActivityLogs(user.accessToken)
      if (data && data.logs) {
        setLogs(data.logs)
      } else {
        setLogs([])
        setError('No activity logs data received')
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      setError(err.message || 'Failed to fetch activity logs. Please try again.')
      // Fallback to dummy data on error
      setLogs(dummyLogs)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true
    if (filter === 'active') return log.status === 'Active'
    if (filter === 'logged_out') return log.status === 'LoggedOut'
    return true
  })

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
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Activity Logs</h1>
                  <p className="text-gray-600 mt-2">Monitor user login and activity history</p>
                </div>
                <button
                  onClick={fetchLogs}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Filter */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      filter === 'active' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Active Sessions
                  </button>
                  <button
                    onClick={() => setFilter('logged_out')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      filter === 'logged_out' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Logged Out
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                              No activity logs found.
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.map((log) => {
                            const loginTime = log.login_time ? new Date(log.login_time) : null
                            const logoutTime = log.logout_time ? new Date(log.logout_time) : null
                            let duration = '-'
                            
                            if (loginTime && logoutTime) {
                              const diff = logoutTime - loginTime
                              const hours = Math.floor(diff / (1000 * 60 * 60))
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                              duration = `${hours}h ${minutes}m`
                            } else if (loginTime && log.status === 'Active') {
                              const diff = new Date() - loginTime
                              const hours = Math.floor(diff / (1000 * 60 * 60))
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                              duration = `${hours}h ${minutes}m (ongoing)`
                            }

                            return (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {loginTime ? loginTime.toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {logoutTime ? logoutTime.toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    log.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {log.status || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{duration}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default UserActivityLogs

