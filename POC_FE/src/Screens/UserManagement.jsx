import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { adminGetUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../utils/api'

const UserManagement = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 50,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false
  })
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    role: 'user',
    is_active: true
  })

  useEffect(() => {
    if (user?.accessToken) {
      fetchUsers(pagination.current_page, pagination.page_size)
    }
  }, [pagination.current_page, pagination.page_size, user?.accessToken])

  const fetchUsers = async (page = 1, pageSize = 50) => {
    if (!user?.accessToken) {
      setError('Authentication required')
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await adminGetUsers(user.accessToken, page, pageSize)
      console.log('Fetched users data:', data)
      console.log('Users array:', data.users)
      if (data.users && data.users.length > 0) {
        console.log('First user sample:', data.users[0])
      }
      setUsers(data.users || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user?.accessToken) {
      setError('Authentication required')
      return
    }

    try {
      await adminCreateUser(user.accessToken, formData)
      setSuccess('User created successfully!')
      setShowAddModal(false)
      resetForm()
      fetchUsers(pagination.current_page, pagination.page_size)
      navigate('/admin/users')
    } catch (err) {
      setError(err.message || 'Failed to create user')
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!user?.accessToken) {
      setError('Authentication required')
      return
    }

    try {
      await adminUpdateUser(user.accessToken, selectedUser.username, formData)
      setSuccess('User updated successfully!')
      setShowEditModal(false)
      resetForm()
      setSelectedUser(null)
      fetchUsers(pagination.current_page, pagination.page_size)
    } catch (err) {
      setError(err.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    if (!user?.accessToken) {
      setError('Authentication required')
      return
    }

    setError('')
    setSuccess('')

    try {
      await adminDeleteUser(user.accessToken, selectedUser.username)
      setSuccess('User deactivated successfully!')
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers(pagination.current_page, pagination.page_size)
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      mobile_number: '',
      role: 'user',
      is_active: true
    })
  }

  const openEditModal = (userData) => {
    setSelectedUser(userData)
    setFormData({
      username: userData.username,
      password: '',
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      mobile_number: userData.mobile_number || '',
      role: userData.role || 'user',
      is_active: userData.is_active !== undefined ? userData.is_active : true
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (userData) => {
    setSelectedUser(userData)
    setShowDeleteModal(true)
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    )
  })

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }))
  }

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, page_size: parseInt(newPageSize), current_page: 1 }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F8' }}>
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
                  <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>User Management</h1>
                  <p className="mt-2" style={{ color: '#6B7280' }}>Manage user accounts and permissions</p>
                </div>
                <button
                  onClick={() => navigate('/admin/users/add')}
                  className="text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-4 border px-4 py-3 rounded-lg" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 border px-4 py-3 rounded-lg" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', color: '#16A34A' }}>
                  {success}
                </div>
              )}

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name, email, username, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' }}
                  />
                  <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#EF4444' }}></div>
                </div>
              ) : (
                <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
                  <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Users</h3>
                  </div>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container" style={{ width: '100%' }}>
                    <table className="w-full text-sm border border-[#003366]" style={{ minWidth: '1200px' }}>
                      <thead className="bg-gray-100 text-[#003366] sticky top-0">
                        <tr>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Username</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Name</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Mobile</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Role</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Status</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Created By</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Creation Date</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Email</th>
                          <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="py-8 px-3 text-center text-gray-500">
                              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((userItem, index) => (
                            <tr key={userItem.username} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="py-3 px-3 text-gray-800 font-medium whitespace-nowrap">{userItem.username}</td>
                              <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                                {userItem.first_name} {userItem.last_name}
                              </td>
                              <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{userItem.mobile_number || '-'}</td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  userItem.role === 'admin' || userItem.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {userItem.role || 'user'}
                                </span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  userItem.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {userItem.status || (userItem.is_active ? 'Active' : 'Inactive')}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{userItem.created_by || '-'}</td>
                              <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                                {userItem.creation_date ? (() => {
                                  try {
                                    return new Date(userItem.creation_date).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  } catch (e) {
                                    return userItem.creation_date
                                  }
                                })() : '-'}
                              </td>
                              <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{userItem.email || '-'}</td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openEditModal(userItem)}
                                    className="cursor-pointer font-medium"
                                    style={{ color: '#6B46C1' }}
                                  >
                                    Edit
                                  </button>
                                  {userItem.username !== 'adminkotak' && (
                                    <button
                                      onClick={() => openDeleteModal(userItem)}
                                      className="cursor-pointer font-medium"
                                    style={{ color: '#EF4444' }}
                                    >
                                      Deactivate
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {pagination.total_pages > 0 && (
                    <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm" style={{ color: '#6B7280' }}>
                          Showing {((pagination.current_page - 1) * pagination.page_size) + 1} to {Math.min(pagination.current_page * pagination.page_size, pagination.total_count)} of {pagination.total_count} users
                        </span>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm" style={{ color: '#6B7280' }}>Rows per page:</label>
                          <select
                            value={pagination.page_size}
                            onChange={(e) => handlePageSizeChange(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                            style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                          >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={!pagination.has_previous}
                          className="px-3 py-1 border rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: pagination.has_previous ? '#FFFFFF' : '#F9FAFB',
                            borderColor: '#D1D5DB',
                            color: pagination.has_previous ? '#1F2937' : '#9CA3AF'
                          }}
                        >
                          Previous
                        </button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                            let pageNum;
                            if (pagination.total_pages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.current_page <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.current_page >= pagination.total_pages - 2) {
                              pageNum = pagination.total_pages - 4 + i;
                            } else {
                              pageNum = pagination.current_page - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${
                                  pagination.current_page === pageNum ? 'text-white' : ''
                                }`}
                                style={{
                                  backgroundColor: pagination.current_page === pageNum ? '#EF4444' : '#FFFFFF',
                                  borderColor: '#D1D5DB',
                                  color: pagination.current_page === pageNum ? '#FFFFFF' : '#1F2937'
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={!pagination.has_next}
                          className="px-3 py-1 border rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: pagination.has_next ? '#FFFFFF' : '#F9FAFB',
                            borderColor: '#D1D5DB',
                            color: pagination.has_next ? '#1F2937' : '#9CA3AF'
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add User Modal - Removed, using separate screen now */}
      {false && showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    navigate('/admin/users')
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      navigate('/admin/users')
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-md border max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ borderColor: '#E5E7EB' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold mb-1 pb-2 border-b-2" style={{ color: '#1F2937', borderColor: '#EF4444' }}>Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    resetForm()
                  }}
                  style={{ color: '#6B7280' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg cursor-not-allowed"
                      style={{ backgroundColor: '#F9FAFB', borderColor: '#D1D5DB', color: '#6B7280' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Status</label>
                    <select
                      value={formData.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedUser(null)
                      resetForm()
                    }}
                    className="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
                    style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors cursor-pointer"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-md border max-w-md w-full p-6" style={{ borderColor: '#E5E7EB' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1F2937' }}>Deactivate User</h2>
            <p className="mb-6" style={{ color: '#6B7280' }}>
              Are you sure you want to deactivate user <strong style={{ color: '#1F2937' }}>{selectedUser.username}</strong>? This action will disable the user account.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 border rounded-lg transition-colors cursor-pointer"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-white rounded-lg transition-colors cursor-pointer"
                style={{ backgroundColor: '#EF4444' }}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement

