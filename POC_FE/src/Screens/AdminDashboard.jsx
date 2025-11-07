import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { adminGetUsers, adminGetActivityLogs } from '../utils/api'

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
      // Dummy data for demo
      if (!user?.accessToken || user.accessToken === 'dummy_admin_token') {
        setStats({
          totalUsers: 8,
          activeUsers: 7,
          inactiveUsers: 1,
          recentLogins: 5
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [usersData, logsData] = await Promise.all([
          adminGetUsers(user.accessToken),
          adminGetActivityLogs(user.accessToken)
        ])

        const users = usersData.users || []
        const logs = logsData.logs || []
        
        const activeUsers = users.filter(u => u.is_active).length
        const inactiveUsers = users.filter(u => !u.is_active).length
        
        // Count recent logins (last 24 hours)
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const recentLogins = logs.filter(log => {
          if (!log.login_time) return false
          const loginDate = new Date(log.login_time)
          return loginDate > yesterday
        }).length

        setStats({
          totalUsers: users.length,
          activeUsers,
          inactiveUsers,
          recentLogins
        })
      } catch (error) {
        // Fallback to dummy data
        setStats({
          totalUsers: 8,
          activeUsers: 7,
          inactiveUsers: 1,
          recentLogins: 5
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.accessToken])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Recent Logins (24h)',
      value: stats.recentLogins,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
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
      color: 'bg-blue-500 hover:bg-blue-600'
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
      color: 'bg-green-500 hover:bg-green-600'
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
      color: 'bg-purple-500 hover:bg-purple-600'
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
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

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
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Admin'}. Manage your system from here.</p>
              </div>

              {/* Stats Cards */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                            <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                          </div>
                          <div className={`${stat.color} p-3 rounded-lg text-white`}>
                            {stat.icon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className={`${action.color} text-white p-6 rounded-lg text-left transition-colors cursor-pointer`}
                        >
                          <div className="mb-3">{action.icon}</div>
                          <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                          <p className="text-sm opacity-90">{action.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Section */}
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">System Overview</h2>
                      <button
                        onClick={() => navigate('/admin/activity-logs')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">User Management</p>
                          <p className="text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/users')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Activity Monitoring</p>
                          <p className="text-sm text-gray-600">Track user login history and system activities</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/activity-logs')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          View Logs
                        </button>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">System Configuration</p>
                          <p className="text-sm text-gray-600">Configure system settings and preferences</p>
                        </div>
                        <button
                          onClick={() => navigate('/admin/settings')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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

