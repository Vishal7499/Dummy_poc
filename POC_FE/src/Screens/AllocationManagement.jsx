import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'

const AllocationManagement = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedCollector, setSelectedCollector] = useState('')

  const allocations = [
    { id: 1, branch: 'Mumbai Branch', collector: 'John Doe', clients: 150, amount: 2500000, status: 'Active' },
    { id: 2, branch: 'Delhi Branch', collector: 'Jane Smith', clients: 200, amount: 3500000, status: 'Active' },
    { id: 3, branch: 'Bangalore Branch', collector: 'Robert Wilson', clients: 120, amount: 1800000, status: 'Active' },
    { id: 4, branch: 'Chennai Branch', collector: 'Emily Davis', clients: 100, amount: 1500000, status: 'Pending' }
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
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Allocation Management</h1>
                <p className="text-gray-600 mt-2">Manage client allocations to field collectors</p>
              </div>

              <div className="mb-6 flex space-x-4">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Branch</option>
                  <option value="mumbai">Mumbai Branch</option>
                  <option value="delhi">Delhi Branch</option>
                  <option value="bangalore">Bangalore Branch</option>
                </select>
                <select
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Field Collector</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                  <option value="robert">Robert Wilson</option>
                </select>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Filter
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Collector</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allocations.map((allocation) => (
                      <tr key={allocation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{allocation.branch}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{allocation.collector}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.clients}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{allocation.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            allocation.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {allocation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
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

export default AllocationManagement








