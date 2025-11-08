import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'

const BranchManagement = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  const branches = [
    { id: 1, name: 'Mumbai Branch', code: 'MUM001', address: 'Mumbai, Maharashtra', status: 'Active', users: 25 },
    { id: 2, name: 'Delhi Branch', code: 'DEL001', address: 'New Delhi, Delhi', status: 'Active', users: 30 },
    { id: 3, name: 'Bangalore Branch', code: 'BLR001', address: 'Bangalore, Karnataka', status: 'Active', users: 20 },
    { id: 4, name: 'Chennai Branch', code: 'CHE001', address: 'Chennai, Tamil Nadu', status: 'Active', users: 18 },
    { id: 5, name: 'Kolkata Branch', code: 'KOL001', address: 'Kolkata, West Bengal', status: 'Inactive', users: 15 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} transition-all duration-300 fixed lg:static inset-y-0 left-0 z-50`}>
          <AdminSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
                  <p className="text-gray-600 mt-2">Manage branch locations and assignments</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                  Add Branch
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {branches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{branch.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{branch.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{branch.users}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            branch.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {branch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
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
  )
}

export default BranchManagement



