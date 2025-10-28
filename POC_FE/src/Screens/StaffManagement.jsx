import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const StaffManagement = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('efficiency')
  const [sortOrder, setSortOrder] = useState('desc')
  const mainContentRef = useRef(null)
  
  const itemsPerPage = 10

  // Click outside handler to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close sidebar when clicking on main content
      if (mainContentRef.current && mainContentRef.current.contains(event.target) && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
      }
    }

    if (!isSidebarCollapsed) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSidebarCollapsed])

  // Enhanced staff data for leaderboard
  const staffLeaderboardData = [
    { id: 'EMP001', name: 'Ramesh Kumar', branch: 'Mumbai Central', center: 'Mumbai', loanType: 'Tractor', region: 'North', calls: 45, visits: 12, collected: 250000, efficiency: 92, escalations: 1, hierarchy: 'Supervisor' },
    { id: 'EMP002', name: 'Ankit Sharma', branch: 'Bangalore Whitefield', center: 'Bangalore', loanType: 'Commercial Vehicle', region: 'South', calls: 38, visits: 8, collected: 180000, efficiency: 67, escalations: 3, hierarchy: 'Collection Officer' },
    { id: 'EMP003', name: 'Priya Rao', branch: 'Chennai T. Nagar', center: 'Chennai', loanType: 'Construction Equipment', region: 'East', calls: 42, visits: 15, collected: 220000, efficiency: 88, escalations: 0, hierarchy: 'Senior Executive' },
    { id: 'EMP004', name: 'Suresh Patel', branch: 'Pune IT Park', center: 'Pune', loanType: 'Tractor', region: 'West', calls: 35, visits: 6, collected: 120000, efficiency: 54, escalations: 5, hierarchy: 'Collection Officer' },
    { id: 'EMP005', name: 'Meena Iyer', branch: 'Mumbai Central', center: 'Mumbai', loanType: 'Commercial Vehicle', region: 'Central', calls: 40, visits: 10, collected: 195000, efficiency: 80, escalations: 2, hierarchy: 'Executive' },
    { id: 'EMP006', name: 'Rajesh Singh', branch: 'Delhi CP', center: 'Delhi', loanType: 'Tractor', region: 'North', calls: 48, visits: 14, collected: 280000, efficiency: 95, escalations: 0, hierarchy: 'Senior Executive' },
    { id: 'EMP007', name: 'Sunita Verma', branch: 'Kolkata Salt Lake', center: 'Kolkata', loanType: 'Construction Equipment', region: 'East', calls: 32, visits: 7, collected: 150000, efficiency: 62, escalations: 4, hierarchy: 'Collection Officer' },
    { id: 'EMP008', name: 'Vikram Joshi', branch: 'Ahmedabad CG Road', center: 'Ahmedabad', loanType: 'Commercial Vehicle', region: 'West', calls: 44, visits: 11, collected: 210000, efficiency: 85, escalations: 1, hierarchy: 'Executive' },
    { id: 'EMP009', name: 'Deepa Nair', branch: 'Kochi Marine Drive', center: 'Kochi', loanType: 'Tractor', region: 'South', calls: 36, visits: 9, collected: 165000, efficiency: 72, escalations: 2, hierarchy: 'Collection Officer' },
    { id: 'EMP010', name: 'Arjun Reddy', branch: 'Hyderabad HITEC', center: 'Hyderabad', loanType: 'Construction Equipment', region: 'South', calls: 41, visits: 13, collected: 235000, efficiency: 89, escalations: 1, hierarchy: 'Senior Executive' },
    { id: 'EMP011', name: 'Kavita Desai', branch: 'Mumbai Central', center: 'Mumbai', loanType: 'Commercial Vehicle', region: 'West', calls: 29, visits: 5, collected: 95000, efficiency: 48, escalations: 6, hierarchy: 'Collection Officer' },
    { id: 'EMP012', name: 'Rohit Agarwal', branch: 'Delhi CP', center: 'Delhi', loanType: 'Tractor', region: 'North', calls: 46, visits: 16, collected: 265000, efficiency: 91, escalations: 0, hierarchy: 'Executive' }
  ]

  // Filter and sort staff data
  const filteredStaff = staffLeaderboardData.filter(staff => 
    staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.center.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.region.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="h-screen font-['Montserrat'] flex" style={{background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'}}>
      {/* Sidebar - Small when closed, overlay when open */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-0 overflow-hidden'}`}>
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          setIsMobileOpen={setIsMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>
      
      {/* Overlay Sidebar when expanded */}
      {!isSidebarCollapsed && (
        <div className="fixed inset-y-0 left-0 z-50 w-68 bg-white border-r border-gray-200 shadow-lg">
          <Sidebar 
            isMobileOpen={isMobileSidebarOpen} 
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>
      )}
      
      <div ref={mainContentRef} className="flex flex-col overflow-hidden flex-1">
        {/* Navbar */}
        <Navbar 
          onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="bg-white min-h-screen p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor staff performance across all regions</p>
            </div>

            {/* Staff Performance Leaderboard - Full Width */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Staff Performance Leaderboard</h2>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by ID, Name, Branch, Center, Loan Type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="efficiency">Sort by Efficiency</option>
                    <option value="collected">Sort by Collected Amount</option>
                    <option value="calls">Sort by Calls</option>
                    <option value="visits">Sort by Visits</option>
                    <option value="name">Sort by Name</option>
                    <option value="hierarchy">Sort by Hierarchy</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-3 font-semibold">Emp ID</th>
                      <th className="text-left py-4 px-3 font-semibold">Name</th>
                      <th className="text-left py-4 px-3 font-semibold">Hierarchy</th>
                      <th className="text-left py-4 px-3 font-semibold">Branch</th>
                      <th className="text-left py-4 px-3 font-semibold">Center</th>
                      <th className="text-left py-4 px-3 font-semibold">Loan Type</th>
                      <th className="text-left py-4 px-3 font-semibold">Region</th>
                      <th className="text-left py-4 px-3 font-semibold">Calls</th>
                      <th className="text-left py-4 px-3 font-semibold">Visits</th>
                      <th className="text-left py-4 px-3 font-semibold">Collected</th>
                      <th className="text-left py-4 px-3 font-semibold">Efficiency</th>
                      <th className="text-left py-4 px-3 font-semibold">Escalations</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {paginatedStaff.map((staff, index) => (
                      <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs">{staff.id}</td>
                        <td className="py-3 px-3 font-medium">{staff.name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            staff.hierarchy === 'Supervisor' ? 'bg-purple-100 text-purple-800' :
                            staff.hierarchy === 'Senior Executive' ? 'bg-blue-100 text-blue-800' :
                            staff.hierarchy === 'Executive' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {staff.hierarchy}
                          </span>
                        </td>
                        <td className="py-3 px-3">{staff.branch}</td>
                        <td className="py-3 px-3">{staff.center}</td>
                        <td className="py-3 px-3">
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            staff.loanType === 'Tractor' ? 'bg-orange-100 text-orange-800' :
                            staff.loanType === 'Commercial Vehicle' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {staff.loanType}
                          </span>
                        </td>
                        <td className="py-3 px-3">{staff.region}</td>
                        <td className="py-3 px-3">{staff.calls}</td>
                        <td className="py-3 px-3">{staff.visits}</td>
                        <td className="py-3 px-3 font-medium">₹{(staff.collected / 100000).toFixed(1)}L</td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${
                            staff.efficiency >= 90 ? 'text-green-600' :
                            staff.efficiency >= 70 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {staff.efficiency}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            staff.escalations === 0 ? 'bg-green-100 text-green-800' :
                            staff.escalations <= 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {staff.escalations}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StaffManagement
