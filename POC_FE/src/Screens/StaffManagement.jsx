import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const StaffManagement = () => {
  const [searchParams] = useSearchParams()
  const selectedMetric = searchParams.get('metric') || 'overview'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('efficiency')
  const [sortOrder, setSortOrder] = useState('desc')
  const mainContentRef = useRef(null)
  
  const itemsPerPage = 10

  // Region-wise performance data
  const regionData = {
    collection: [
      { region: 'North', value: 89.2, count: 45, amount: '₹2.1Cr' },
      { region: 'South', value: 85.7, count: 38, amount: '₹1.8Cr' },
      { region: 'East', value: 82.3, count: 42, amount: '₹1.9Cr' },
      { region: 'West', value: 87.1, count: 35, amount: '₹1.6Cr' },
      { region: 'Central', value: 84.5, count: 40, amount: '₹1.7Cr' }
    ],
    ptp: [
      { region: 'North', value: 75.8, count: 234, amount: '₹89L' },
      { region: 'South', value: 71.2, count: 198, amount: '₹76L' },
      { region: 'East', value: 68.9, count: 156, amount: '₹62L' },
      { region: 'West', value: 73.4, count: 189, amount: '₹71L' },
      { region: 'Central', value: 70.6, count: 167, amount: '₹64L' }
    ],
    visit: [
      { region: 'North', value: 81.5, count: 156, amount: '89%' },
      { region: 'South', value: 76.2, count: 134, amount: '82%' },
      { region: 'East', value: 79.8, count: 142, amount: '85%' },
      { region: 'West', value: 77.9, count: 128, amount: '83%' },
      { region: 'Central', value: 75.4, count: 119, amount: '80%' }
    ],
    productivity: [
      { region: 'North', value: 168, count: 45, amount: 'High' },
      { region: 'South', value: 152, count: 38, amount: 'Medium' },
      { region: 'East', value: 145, count: 42, amount: 'Medium' },
      { region: 'West', value: 161, count: 35, amount: 'High' },
      { region: 'Central', value: 148, count: 40, amount: 'Medium' }
    ],
    inactive: [
      { region: 'North', value: 2, count: 45, amount: 'Low' },
      { region: 'South', value: 4, count: 38, amount: 'Medium' },
      { region: 'East', value: 3, count: 42, amount: 'Low' },
      { region: 'West', value: 5, count: 35, amount: 'High' },
      { region: 'Central', value: 3, count: 40, amount: 'Low' }
    ]
  }

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
         

            {/* Staff Performance Cards */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedMetric === 'overview' ? 'Staff Performance Overview' : 
                 selectedMetric === 'collection' ? 'Collection Efficiency by Region' :
                 selectedMetric === 'ptp' ? 'PTP Conversion Rate by Region' :
                 selectedMetric === 'visit' ? 'Visit Compliance Rate by Region' :
                 selectedMetric === 'productivity' ? 'Staff Productivity Index by Region' :
                 selectedMetric === 'inactive' ? 'Inactive/Non-performing Staff by Region' :
                 'Staff Performance Overview'}
              </h3>
              
              {selectedMetric === 'overview' ? (
                <div className="grid grid-cols-5 gap-3">
                  {/* Collection Efficiency Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-blue-600 text-xs">Collection Efficiency (%)</div>
                    <div className="text-lg font-bold text-blue-900">86.4%</div>
                  </div>

                  {/* PTP Conversion Rate Card */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-600 text-xs">PTP Conversion Rate (%)</div>
                    <div className="text-lg font-bold text-green-900">72.3%</div>
                  </div>

                  {/* Visit Compliance Rate Card */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-purple-600 text-xs">Visit Compliance Rate (%)</div>
                    <div className="text-lg font-bold text-purple-900">78.5%</div>
                  </div>

                  {/* Staff Productivity Index Card */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-orange-600 text-xs">Staff Productivity Index</div>
                    <div className="text-lg font-bold text-orange-900">156</div>
                  </div>

                  {/* Inactive/Non-performing Staff Card */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 relative">
                    <div className="text-red-600 text-xs">Inactive/Non-performing Staff</div>
                    <div className="text-lg font-bold text-red-900">3</div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {regionData[selectedMetric]?.map((region, index) => (
                    <div key={index} className={`border rounded-lg p-3 ${
                      selectedMetric === 'collection' ? 'bg-blue-50 border-blue-200' :
                      selectedMetric === 'ptp' ? 'bg-green-50 border-green-200' :
                      selectedMetric === 'visit' ? 'bg-purple-50 border-purple-200' :
                      selectedMetric === 'productivity' ? 'bg-orange-50 border-orange-200' :
                      selectedMetric === 'inactive' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`text-xs ${
                        selectedMetric === 'collection' ? 'text-blue-600' :
                        selectedMetric === 'ptp' ? 'text-green-600' :
                        selectedMetric === 'visit' ? 'text-purple-600' :
                        selectedMetric === 'productivity' ? 'text-orange-600' :
                        selectedMetric === 'inactive' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {region.region} Region
                      </div>
                      <div className={`text-lg font-bold ${
                        selectedMetric === 'collection' ? 'text-blue-900' :
                        selectedMetric === 'ptp' ? 'text-green-900' :
                        selectedMetric === 'visit' ? 'text-purple-900' :
                        selectedMetric === 'productivity' ? 'text-orange-900' :
                        selectedMetric === 'inactive' ? 'text-red-900' :
                        'text-gray-900'
                      }`}>
                        {selectedMetric === 'inactive' ? region.value : `${region.value}${selectedMetric === 'productivity' ? '' : '%'}`}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Staff: {region.count} | {region.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
