import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { adminGetDashboardStats } from '../utils/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    recentLogins: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        console.log('Fetching admin dashboard stats...')
        const statsData = await adminGetDashboardStats()
        console.log('Admin dashboard stats received:', statsData)
        
        setStats({
          totalUsers: statsData.total_users || 0,
          activeUsers: statsData.active_users || 0,
          inactiveUsers: statsData.inactive_users || 0,
          recentLogins: statsData.recent_logins_24h || 0
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          recentLogins: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconColor: 'text-gray-600',
      textColor: 'text-gray-900'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-gray-600',
      textColor: 'text-gray-900'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-red-500',
      textColor: 'text-red-500'
    },
    {
      title: 'Recent Logins (24h)',
      value: stats.recentLogins,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-gray-600',
      textColor: 'text-gray-900'
    }
  ]

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      action: () => navigate('/admin/users/add'),
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'View All Users',
      description: 'Manage existing users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      action: () => navigate('/admin/users'),
      gradient: 'from-emerald-500 to-green-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-green-700'
    },
    {
      title: 'Activity Logs',
      description: 'View user activity history',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      action: () => navigate('/admin/activity-logs'),
      gradient: 'from-purple-500 to-indigo-600',
      hoverGradient: 'hover:from-purple-600 hover:to-indigo-700'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => navigate('/admin/settings'),
      gradient: 'from-amber-500 to-orange-600',
      hoverGradient: 'hover:from-amber-600 hover:to-orange-700'
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
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
              {/* Header */}
              <div className="mb-8">
                {/* <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>Admin Dashboard</h1>
                <p className="mt-2" style={{ color: '#6B7280' }}>Welcome back, {user?.name || 'Admin'}. Manage your system from here.</p> */}
              </div>

              {/* Stats Cards */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#EF4444' }}></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-md border overflow-hidden relative" style={{ borderColor: '#E5E7EB' }}>
                        <div className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1" style={{ color: '#6B7280' }}>{stat.title}</p>
                              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.iconColor}`}>
                              {stat.icon}
                            </div>
                          </div>
                        </div>
                        <div className="h-1" style={{ backgroundColor: '#EF4444' }}></div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-md p-6 border mb-8" style={{ borderColor: '#E5E7EB' }}>
                    <h2 className="text-xl font-bold mb-1 pb-2 border-b-2" style={{ color: '#1F2937', borderColor: '#EF4444' }}>Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className="bg-white border rounded-lg p-6 text-left transition-all duration-300 cursor-pointer hover:shadow-md"
                          style={{ borderColor: '#E5E7EB' }}
                        >
                          <div className="mb-3" style={{ color: '#6B7280' }}>{action.icon}</div>
                          <h3 className="font-semibold text-lg mb-1" style={{ color: '#1F2937' }}>{action.title}</h3>
                          <p className="text-sm" style={{ color: '#6B7280' }}>{action.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Section */}
                  <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold mb-1 pb-2 border-b-2" style={{ color: '#1F2937', borderColor: '#EF4444' }}>System Overview</h2>
                      <button
                        onClick={() => navigate('/admin/activity-logs')}
                        className="text-sm font-medium transition-colors"
                        style={{ color: '#6B7280' }}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center p-5 bg-white rounded-lg border hover:shadow-md transition-all duration-300" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex-1">
                          <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>User Management</p>
                          <p className="text-sm" style={{ color: '#6B7280' }}>Manage user accounts, roles, and permissions</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/users')}
                          className="px-5 py-2.5 text-white rounded-lg transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg font-medium"
                          style={{ backgroundColor: '#6B46C1' }}
                        >
                          Manage
                        </button>
                      </div>
                      <div className="flex items-center p-5 bg-white rounded-lg border hover:shadow-md transition-all duration-300" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex-1">
                          <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>Activity Monitoring</p>
                          <p className="text-sm" style={{ color: '#6B7280' }}>Track user login history and system activities</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/activity-logs')}
                          className="px-5 py-2.5 text-white rounded-lg transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg font-medium"
                          style={{ backgroundColor: '#6B46C1' }}
                        >
                          View Logs
                        </button>
                      </div>
                      <div className="flex items-center p-5 bg-white rounded-lg border hover:shadow-md transition-all duration-300" style={{ borderColor: '#E5E7EB' }}>
                        <div className="flex-1">
                          <p className="font-semibold mb-1" style={{ color: '#1F2937' }}>System Configuration</p>
                          <p className="text-sm" style={{ color: '#6B7280' }}>Configure system settings and preferences</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/settings')}
                          className="px-5 py-2.5 text-white rounded-lg transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg font-medium"
                          style={{ backgroundColor: '#6B46C1' }}
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

