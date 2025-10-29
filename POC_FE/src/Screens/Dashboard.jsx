import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ftd')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [showAlerts, setShowAlerts] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [chartFilter, setChartFilter] = useState('ftd')
  const [hoveredBar, setHoveredBar] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const alertsRef = useRef(null)
  const mainContentRef = useRef(null)

  // Click outside handler for alerts dropdown and sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false)
      }
      // Close sidebar when clicking on main content
      if (mainContentRef.current && mainContentRef.current.contains(event.target) && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
      }
    }

    if (showAlerts || !isSidebarCollapsed) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAlerts, isSidebarCollapsed])

  // Mock data for demonstration
  const staffData = {
    ftd: {
      collectionEfficiency: 78.5,
      ptpConversion: 65.2,
      visitCompliance: 82.1,
      staffProductivity: 156,
      inactiveStaff: 3
    },
    wtd: {
      collectionEfficiency: 74.3,
      ptpConversion: 68.7,
      visitCompliance: 79.8,
      staffProductivity: 892,
      inactiveStaff: 5
    },
    mtd: {
      collectionEfficiency: 76.8,
      ptpConversion: 71.2,
      visitCompliance: 81.5,
      staffProductivity: 3245,
      inactiveStaff: 8
    }
  }

  const engagementData = {
    whatsapp: { reached: 1245, engaged: 892, rate: 71.6 },
    aiCalls: { total: 2100, connected: 1580, rate: 75.2 },
    diallerCalls: { total: 1850, successful: 1340, rate: 72.4 }
  }

  const paymentData = {
    topOverdue: { count: 45, amount: 1250000 },
    promisedToPay: { customers: 234, amount: 890000 },
    refusedToPay: { customers: 67, amount: 340000 },
    alreadyPaid: { customers: 189, amount: 560000 },
    brokenPromises: { customers: 89, amount: 280000 },
    wrongNumbers: { count: 156 }
  }

  const currentData = staffData[activeTab]

  // Chart data for different filter ranges
  const chartData = {
    ftd: {
      title: 'Collection Trend (For the Day)',
      data: [
        { day: 'Mon', value: 45, height: '60%' },
        { day: 'Tue', value: 52, height: '70%' },
        { day: 'Wed', value: 38, height: '50%' },
        { day: 'Thu', value: 68, height: '90%' },
        { day: 'Fri', value: 55, height: '75%' },
        { day: 'Sat', value: 72, height: '95%' },
        { day: 'Sun', value: 48, height: '65%' }
      ]
    },
    wtd: {
      title: 'Collection Trend (Week Till Date)',
      data: [
        { day: 'Mon', value: 120, height: '65%' },
        { day: 'Tue', value: 145, height: '80%' },
        { day: 'Wed', value: 98, height: '55%' },
        { day: 'Thu', value: 178, height: '95%' },
        { day: 'Fri', value: 156, height: '85%' },
        { day: 'Sat', value: 189, height: '100%' },
        { day: 'Sun', value: 134, height: '70%' }
      ]
    },
    mtd: {
      title: 'Collection Trend (Month Till Date)',
      data: [
        { day: '1', value: 45, height: '60%' },
        { day: '2', value: 52, height: '70%' },
        { day: '3', value: 38, height: '50%' },
        { day: '4', value: 68, height: '90%' },
        { day: '5', value: 55, height: '75%' },
        { day: '6', value: 72, height: '95%' },
        { day: '7', value: 48, height: '65%' },
        { day: '8', value: 61, height: '80%' },
        { day: '9', value: 43, height: '55%' },
        { day: '10', value: 79, height: '100%' },
        { day: '11', value: 56, height: '72%' },
        { day: '12', value: 67, height: '85%' },
        { day: '13', value: 49, height: '62%' },
        { day: '14', value: 73, height: '92%' },
        { day: '15', value: 58, height: '74%' },
        { day: '16', value: 64, height: '82%' },
        { day: '17', value: 41, height: '52%' },
        { day: '18', value: 76, height: '96%' },
        { day: '19', value: 53, height: '68%' },
        { day: '20', value: 69, height: '88%' },
        { day: '21', value: 47, height: '60%' },
        { day: '22', value: 71, height: '90%' },
        { day: '23', value: 59, height: '75%' },
        { day: '24', value: 65, height: '83%' },
        { day: '25', value: 44, height: '56%' },
        { day: '26', value: 78, height: '98%' },
        { day: '27', value: 54, height: '69%' },
        { day: '28', value: 70, height: '89%' },
        { day: '29', value: 46, height: '58%' },
        { day: '30', value: 74, height: '94%' },
        { day: '31', value: 51, height: '65%' }
      ]
    },
    fy: {
      title: 'Collection Trend (Current Financial Year)',
      data: [
        { day: 'Apr', value: 1200, height: '60%' },
        { day: 'May', value: 1350, height: '70%' },
        { day: 'Jun', value: 980, height: '50%' },
        { day: 'Jul', value: 1680, height: '90%' },
        { day: 'Aug', value: 1450, height: '75%' },
        { day: 'Sep', value: 1720, height: '95%' },
        { day: 'Oct', value: 1480, height: '65%' },
        { day: 'Nov', value: 1320, height: '68%' },
        { day: 'Dec', value: 1580, height: '82%' },
        { day: 'Jan', value: 1420, height: '73%' },
        { day: 'Feb', value: 1160, height: '58%' },
        { day: 'Mar', value: 1650, height: '85%' }
      ]
    },
    lfy: {
      title: 'Collection Trend (Last Financial Year)',
      data: [
        { day: 'Apr', value: 1100, height: '55%' },
        { day: 'May', value: 1250, height: '65%' },
        { day: 'Jun', value: 880, height: '45%' },
        { day: 'Jul', value: 1580, height: '85%' },
        { day: 'Aug', value: 1350, height: '70%' },
        { day: 'Sep', value: 1620, height: '90%' },
        { day: 'Oct', value: 1380, height: '60%' },
        { day: 'Nov', value: 1220, height: '58%' },
        { day: 'Dec', value: 1480, height: '78%' },
        { day: 'Jan', value: 1320, height: '68%' },
        { day: 'Feb', value: 1060, height: '48%' },
        { day: 'Mar', value: 1550, height: '80%' }
      ]
    }
  }

  const currentChartData = chartData[chartFilter]

  // Handle bar hover for tooltip
  const handleBarHover = (item, index, event) => {
    setHoveredBar({ item, index })
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleBarLeave = () => {
    setHoveredBar(null)
  }

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
          onBellClick={() => setShowAlerts(!showAlerts)}
        />
        
        {/* Live Alerts Dropdown */}
        {showAlerts && (
          <div ref={alertsRef} className="absolute top-16 right-4 z-50 w-78 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Live Alerts</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="text-orange-800 text-xs">PTP missed - Customer #C-10234 (₹45,000)</div>
                <div className="text-orange-600 text-xs mt-1">10:12</div>
                <button className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition-colors cursor-pointer">
                  View
                </button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-800 text-xs">Escalation breach - Account #A-557 (DPD 95)</div>
                <div className="text-red-600 text-xs mt-1">09:40</div>
                <button className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors cursor-pointer">
                  View
                </button>
            </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-blue-800 text-xs">Unallocated cases &gt; threshold: 23</div>
                <div className="text-blue-600 text-xs mt-1">08:20</div>
                <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors cursor-pointer">
                  View
              </button>
            </div>
          </div>
        </div>
        )}
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          {/* Collection Dashboard Content */}
          <div className="bg-white min-h-screen">
            <div className="flex gap-4 p-4">
              {/* Left Side - Filters and Delegation Tracking */}
              <div className="w-64 space-y-4">
                {/* Section 1: Filters */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Filters</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type of Loan</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-xs">
                        <option>All Loans</option>
                        <option>Tractor Finance</option>
                        <option>Commercial Vehicle</option>
                        <option>Construction Equipment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">DPD Buckets</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-xs">
                        <option>All Buckets</option>
                        <option>0-30 Days</option>
                        <option>31-60 Days</option>
                        <option>61-90 Days</option>
                        <option>91-180 Days</option>
                        <option>180+ Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                      <input type="date" className="w-full p-2 border border-gray-300 rounded text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                      <input type="date" className="w-full p-2 border border-gray-300 rounded text-xs" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Geography</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-xs">
                        <option>All Regions</option>
                        <option>North</option>
                        <option>South</option>
                        <option>East</option>
                        <option>West</option>
                        <option>Central</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-xs">
                        <option>All States</option>
                        <option>Maharashtra</option>
                        <option>Karnataka</option>
                        <option>Tamil Nadu</option>
                        <option>Gujarat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-xs">
                        <option>All Districts</option>
                        <option>Mumbai</option>
                        <option>Pune</option>
                        <option>Bangalore</option>
                        <option>Chennai</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-xs">
                        <option>All Branches</option>
                        <option>Mumbai Central</option>
                        <option>Pune IT Park</option>
                        <option>Bangalore Whitefield</option>
                        <option>Chennai T. Nagar</option>
                      </select>
                    </div>
            </div>
          </div>

                {/* Section 6: Delegation Tracking */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Delegation Tracking</h3>
                  <div className="space-y-2">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                      <div className="text-purple-800 text-xs font-semibold">Delegation Summary</div>
                      <div className="text-purple-600 text-xs mt-1">Active Delegations: 12</div>
                      <div className="text-purple-600 text-xs">Completed: 8</div>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                      <div className="text-indigo-800 text-xs font-semibold">Delegation Types</div>
                      <div className="text-indigo-600 text-xs mt-1">Leave: 5 | Overload: 4</div>
                      <div className="text-indigo-600 text-xs">Escalation: 2 | Special: 1</div>
                  </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <div className="text-red-800 text-xs font-semibold">Re-delegation Alerts</div>
                      <div className="text-red-600 text-xs mt-1">Overdue: 3</div>
                      <button className="mt-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors cursor-pointer">
                        View Details
                      </button>
                  </div>
                </div>
              </div>
            </div>

              {/* Right Side - Main Content */}
              <div className="flex-1">
                {/* Staff Monitoring (Summary) */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Staff Monitoring (Summary)</h2>
                  <div className="grid grid-cols-5 gap-3 relative">
                    {/* Allocation Summary Card */}
                    <div 
                      className="group bg-indigo-50 border border-indigo-200 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative"
                      onMouseEnter={() => setExpandedCard('allocation')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={() => navigate('/staff?metric=allocation')}
                    >
                      <div className="text-indigo-600 text-xs">Allocation Summary</div>
                      <div className="text-lg font-bold text-indigo-900">1,245</div>
                      {expandedCard === 'allocation' && (
                        <div className="absolute top-0 left-0 right-0 bg-indigo-50 border border-indigo-200 rounded-lg p-3 z-50 shadow-lg">
                          <div className="text-indigo-600 text-xs">Allocation Summary</div>
                          <div className="text-lg font-bold text-indigo-900">1,245</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-indigo-700">
                              <span>Active Accounts:</span>
                              <span>1,245</span>
                            </div>
                            <div className="flex justify-between text-xs text-indigo-700">
                              <span>Per Staff Avg:</span>
                              <span>249</span>
                            </div>
                            <div className="flex justify-between text-xs text-indigo-700">
                              <span>Outstanding Value:</span>
                              <span>₹2.1Cr</span>
                            </div>
                            <div className="flex justify-between text-xs text-indigo-700">
                              <span>Unallocated Cases:</span>
                              <span>23</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Collection Efficiency Card */}
                    <div 
                      className="group bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative"
                      onMouseEnter={() => setExpandedCard('collection')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={() => navigate('/staff?metric=collection')}
                    >
                      <div className="text-blue-600 text-xs">Collection Efficiency (%)</div>
                      <div className="text-lg font-bold text-blue-900">86.4%</div>
                      {expandedCard === 'collection' && (
                        <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-3 z-50 shadow-lg">
                          <div className="text-blue-600 text-xs">Collection Efficiency (%)</div>
                          <div className="text-lg font-bold text-blue-900">86.4%</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-blue-700">
                              <span>Amount Collected:</span>
                              <span>₹2.45Cr</span>
                            </div>
                            <div className="flex justify-between text-xs text-blue-700">
                              <span>Total Due:</span>
                              <span>₹2.84Cr</span>
                            </div>
                            <div className="flex justify-between text-xs text-blue-700">
                              <span>Difference:</span>
                              <span>₹39L</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PTP Conversion Rate Card */}
                    <div 
                      className="group bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative"
                      onMouseEnter={() => setExpandedCard('ptp')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={() => navigate('/staff?metric=ptp')}
                    >
                      <div className="text-green-600 text-xs">PTP Conversion Rate (%)</div>
                      <div className="text-lg font-bold text-green-900">72.3%</div>
                      {expandedCard === 'ptp' && (
                        <div className="absolute top-0 left-0 right-0 bg-green-50 border border-green-200 rounded-lg p-3 z-50 shadow-lg">
                          <div className="text-green-600 text-xs">PTP Conversion Rate (%)</div>
                          <div className="text-lg font-bold text-green-900">72.3%</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-green-700">
                              <span>PTPs Fulfilled:</span>
                              <span>234</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-700">
                              <span>Total PTPs:</span>
                              <span>324</span>
                            </div>
                            <div className="flex justify-between text-xs text-green-700">
                              <span>Pending:</span>
                              <span>90</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Staff Productivity Index Card */}
                    <div 
                      className="group bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative"
                      onMouseEnter={() => setExpandedCard('productivity')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={() => navigate('/staff?metric=productivity')}
                    >
                      <div className="text-orange-600 text-xs">Staff Productivity Index</div>
                      <div className="text-lg font-bold text-orange-900">156</div>
                      {expandedCard === 'productivity' && (
                        <div className="absolute top-0 left-0 right-0 bg-orange-50 border border-orange-200 rounded-lg p-3 z-50 shadow-lg">
                          <div className="text-orange-600 text-xs">Staff Productivity Index</div>
                          <div className="text-lg font-bold text-orange-900">156</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-orange-700">
                              <span>Total Calls:</span>
                              <span>1,245</span>
                            </div>
                            <div className="flex justify-between text-xs text-orange-700">
                              <span>Total Visits:</span>
                              <span>89</span>
                            </div>
                            <div className="flex justify-between text-xs text-orange-700">
                              <span>Weight:</span>
                              <span>1.2x</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inactive/Non-performing Staff Card */}
                    <div 
                      className="group bg-red-50 border border-red-200 rounded-lg p-3 relative cursor-pointer transition-all duration-300 h-20"
                      onMouseEnter={() => setExpandedCard('inactive')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={() => navigate('/staff?metric=inactive')}
                    >
                      <div className="text-red-600 text-xs">Inactive/Non-performing Staff</div>
                      <div className="text-lg font-bold text-red-900">3</div>
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</div>
                      {expandedCard === 'inactive' && (
                        <div className="absolute top-0 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 z-50 shadow-lg">
                          <div className="text-red-600 text-xs">Inactive/Non-performing Staff</div>
                          <div className="text-lg font-bold text-red-900">3</div>
                          <div className="text-xs text-red-500">0 calls or 0 visits</div>
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-red-700">
                              <span>Ramesh K.</span>
                              <span>(0 calls)</span>
                            </div>
                            <div className="flex justify-between text-xs text-red-700">
                              <span>Priya S.</span>
                              <span>(0 visits)</span>
                            </div>
                            <div className="flex justify-between text-xs text-red-700">
                              <span>Ankit M.</span>
                              <span>(0 both)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Engagement */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Customer Engagement</h2>
                  <div className="grid grid-cols-4 gap-3">
                    <div 
                      className="bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-green-100"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      <h3 className="text-sm font-semibold text-green-800 mb-2">WhatsApp Engagements</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Messages Sent</span>
                          <span className="font-semibold text-green-800">1,245</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Delivered</span>
                          <span className="font-semibold text-green-800">1,180</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Read</span>
                          <span className="font-semibold text-green-800">892</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Responded</span>
                          <span className="font-semibold text-green-800">456</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-blue-100"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      <h3 className="text-sm font-semibold text-blue-800 mb-2">AI Calls</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Calls Triggered</span>
                          <span className="font-semibold text-blue-800">2,100</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Answered</span>
                          <span className="font-semibold text-blue-800">1,580</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Positive Response</span>
                          <span className="font-semibold text-blue-800">75.2%</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="bg-purple-50 border border-purple-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-purple-100"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      <h3 className="text-sm font-semibold text-purple-800 mb-2">Dialler Calls</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-600">Total Calls</span>
                          <span className="font-semibold text-purple-800">1,850</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-600">Successful Connects</span>
                          <span className="font-semibold text-purple-800">1,340</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-600">Follow-up Actions</span>
                          <span className="font-semibold text-purple-800">72.4%</span>
                        </div>
                    </div>
                  </div>

                    <div 
                      className="bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-orange-100"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      <h3 className="text-sm font-semibold text-orange-800 mb-2">Field Visits</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-600">Planned Visits</span>
                          <span className="font-semibold text-orange-800">156</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-600">Completed Visits</span>
                          <span className="font-semibold text-orange-800">122</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-600">Geo-tagging Compliance</span>
                          <span className="font-semibold text-orange-800">78.2%</span>
                        </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Payment Intent & Behavior */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Payment Intent & Behavior</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-red-800 mb-2">Overdue Accounts</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-red-600">Customer Count</span>
                          <span className="font-semibold text-red-800">45</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-red-600">Amount</span>
                          <span className="font-semibold text-red-800">₹1.25Cr</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-green-800 mb-2">Promised to Pay</h3>
                      <div className="space-y-1">
                        <div className="flex flex-row justify-between text-xs">
                          <span className="text-green-600"># Todays PTP</span>
                          <span className="font-semibold text-green-800">23</span>

                          
                          <span className="text-green-600"># Future PTP</span>
                          <span className="font-semibold text-green-800">890</span>
                        
                        </div>
                       <div className="flex flex-row justify-between text-xs">
                          <span className="text-green-600"># Failed PTP</span>
                          <span className="font-semibold text-green-800">234</span>

                          
                          <span className="text-green-600"># Total PTP</span>
                          <span className="font-semibold text-green-800">1120</span>
                        
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-orange-800 mb-2">Refused to Pay</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-600"># Customers</span>
                          <span className="font-semibold text-orange-800">67</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-orange-600">Pending Amount</span>
                          <span className="font-semibold text-orange-800">₹34L</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-blue-800 mb-2">Already Paid</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600"># Customers</span>
                          <span className="font-semibold text-blue-800">189</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Collected Amount</span>
                          <span className="font-semibold text-blue-800">₹56L</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-purple-800 mb-2">Broken Promises</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-600"># Customers</span>
                          <span className="font-semibold text-purple-800">89</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-600">Broken Amount</span>
                          <span className="font-semibold text-purple-800">₹28L</span>
                        </div>
                    </div>
                  </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">Wrong Numbers / Unreachable</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Count of Invalid Contacts</span>
                          <span className="font-semibold text-gray-800">156</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Status</span>
                          <span className="font-semibold text-gray-800">Data Correction</span>
                        </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Charts and Right Panel Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Left Side - Charts */}
                  <div className="col-span-2 space-y-4">
                     {/* Collection Trend Chart */}
                     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-2">
                       <div className="flex justify-between items-center mb-4">
                         <h3 className="text-sm font-semibold text-gray-900">{currentChartData.title}</h3>
                         <select 
                           value={chartFilter} 
                           onChange={(e) => setChartFilter(e.target.value)}
                           className="px-3 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                         >
                           <option value="ftd">For the Day (FTD)</option>
                           <option value="wtd">Week Till Date (WTD)</option>
                           <option value="mtd">Month Till Date (MTD)</option>
                           <option value="fy">Current Financial Year</option>
                           <option value="lfy">Last Financial Year</option>
                         </select>
                       </div>
                       <div className="h-56 bg-white rounded-lg border-2 mb-3 border-blue-200 relative chart-container">
                         {/* Dynamic Chart Data */}
                         <div className="absolute inset-0 p-4">
                           <div className="h-full flex items-end justify-between" style={{gap: currentChartData.data.length > 20 ? '2px' : currentChartData.data.length > 10 ? '3px' : '6px'}}>
                             {currentChartData.data.map((item, index) => (
                               <div 
                                 key={index} 
                                 className="bg-blue-500 rounded-t cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:shadow-lg" 
                                 style={{
                                   height: item.height,
                                   width: currentChartData.data.length > 20 ? '8px' : currentChartData.data.length > 10 ? '10px' : '16px',
                                   minWidth: '4px'
                                 }}
                                 onMouseEnter={(e) => handleBarHover(item, index, e)}
                                 onMouseLeave={handleBarLeave}
                               ></div>
                             ))}
                           </div>
                           <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1" style={{gap: currentChartData.data.length > 20 ? '2px' : currentChartData.data.length > 10 ? '3px' : '6px'}}>
                             {currentChartData.data.map((item, index) => (
                               <span 
                                 key={index} 
                                 className="text-center"
                                 style={{
                                   fontSize: currentChartData.data.length > 20 ? '9px' : '10px',
                                   width: currentChartData.data.length > 20 ? '8px' : currentChartData.data.length > 10 ? '10px' : '16px',
                                   minWidth: '4px'
                                 }}
                               >
                                 {item.day}
                               </span>
                             ))}
                           </div>
                         </div>
                         <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                           📊 Live Chart
                         </div>
                         
                         {/* Modern Tooltip */}
                         {hoveredBar && (
                           <div 
                             className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none"
                             style={{
                               left: tooltipPosition.x - 50,
                               top: tooltipPosition.y - 50,
                               transform: 'translateX(-50%)',
                               zIndex: 9999
                             }}
                           >
                             <div className="text-sm font-semibold mb-1">
                               {hoveredBar.item.day}
                             </div>
                             <div className="text-xs text-gray-300">
                               Collection: ₹{hoveredBar.item.value.toLocaleString()}
                             </div>
                             <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                           </div>
                         )}
                       </div>
                     </div>

                     {/* DPD Distribution Chart */}
                     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                       <h3 className="text-sm font-semibold text-gray-900 mb-3">DPD Distribution</h3>
                       <div className="flex items-center space-x-6">
                         <div className="relative">
                           <div className="h-40 w-40 bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                             <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center">
                               <div className="text-center">
                                 <div className="text-2xl font-bold text-gray-700">38</div>
                                 <div className="text-xs text-gray-500">Total Cases</div>
                               </div>
                             </div>
                           </div>
                           {/* Mock donut chart segments */}
                           <div className="absolute inset-0 rounded-full" style={{
                             background: `conic-gradient(
                               #10b981 0deg 162deg,
                               #f59e0b 162deg 252deg,
                               #3b82f6 252deg 324deg,
                               #ef4444 324deg 360deg
                             )`
                           }}></div>
                           <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                             <div className="text-center">
                               <div className="text-2xl font-bold text-gray-700">38</div>
                               <div className="text-xs text-gray-500">Total Cases</div>
                             </div>
                    </div>
                  </div>
                         <div className="space-y-3">
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-green-500 rounded"></div>
                             <span className="text-gray-700 text-sm font-medium">0-30 days (45%)</span>
                             <span className="text-gray-500 text-sm">17 cases</span>
                           </div>
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-orange-500 rounded"></div>
                             <span className="text-gray-700 text-sm font-medium">31-60 days (25%)</span>
                             <span className="text-gray-500 text-sm">10 cases</span>
                           </div>
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-blue-500 rounded"></div>
                             <span className="text-gray-700 text-sm font-medium">61-90 days (18%)</span>
                             <span className="text-gray-500 text-sm">7 cases</span>
                           </div>
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-red-500 rounded"></div>
                             <span className="text-gray-700 text-sm font-medium">90+ days (12%)</span>
                             <span className="text-gray-500 text-sm">4 cases</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

                  {/* Right Side - Alerts and Actions */}
                  <div className="space-y-4">
                    {/* Section 5: Allocation Monitoring */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Allocation Monitoring</h3>
                      <div className="space-y-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <div className="text-blue-800 text-xs font-semibold">Allocation Summary</div>
                          <div className="text-blue-600 text-xs mt-1">Active Accounts: 1,245</div>
                          <div className="text-blue-600 text-xs">Per Staff Avg: 249</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <div className="text-green-800 text-xs font-semibold">Outstanding Value per Collector</div>
                          <div className="text-green-600 text-xs mt-1">Avg: ₹2.1Cr</div>
                          <div className="text-green-600 text-xs">Max: ₹3.2Cr</div>
                          </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                          <div className="text-orange-800 text-xs font-semibold">Unallocated Cases</div>
                          <div className="text-orange-600 text-xs mt-1">Pending: 23</div>
                          <button className="mt-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs transition-colors cursor-pointer">
                            Auto Allocate
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}

export default Dashboard