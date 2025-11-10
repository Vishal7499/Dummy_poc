import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { adminCreateUser } from '../utils/api'

const AddUser = () => {
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await adminCreateUser(formData)
      setSuccess('User created successfully!')
      setTimeout(() => {
        navigate('/admin/users')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

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
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="mb-4 flex items-center"
                  style={{ color: '#6B7280' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Users
                </button>
                <h1 className="text-3xl font-bold mb-1 pb-2 border-b-2" style={{ color: '#1F2937', borderColor: '#EF4444' }}>Add New User</h1>
                <p className="mt-2" style={{ color: '#6B7280' }}>Create a new user account with appropriate permissions</p>
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

              {/* Form */}
              <div className="bg-white rounded-xl shadow-md border p-6" style={{ borderColor: '#E5E7EB' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                        Username <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                        Password <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                        placeholder="Enter password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Mobile Number</label>
                      <input
                        type="tel"
                        value={formData.mobile_number}
                        onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>Status</label>
                      <select
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      onClick={() => navigate('/admin/users')}
                      className="px-6 py-2 border rounded-lg transition-colors cursor-pointer"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', color: '#1F2937' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AddUser





