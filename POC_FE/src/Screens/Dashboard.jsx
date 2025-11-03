import React, { useState, useEffect, useRef } from 'react'
import { GoPin } from 'react-icons/go'
import { LuPinOff } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts'
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
  const [favoriteCards, setFavoriteCards] = useState(() => {
    try {
      const stored = localStorage.getItem('favoriteCards')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      return []
    }
  })
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

  // Chart data for different filter ranges (values in Rupees - will be formatted to Lacs/Crores in chart)
  const chartData = {
    ftd: {
      title: 'Collection Trend (For the Day)',
      data: [
        { day: 'Mon', value: 4500000, height: '60%' },  // 45 Lacs
        { day: 'Tue', value: 5200000, height: '70%' },  // 52 Lacs
        { day: 'Wed', value: 3800000, height: '50%' },  // 38 Lacs
        { day: 'Thu', value: 6800000, height: '90%' },  // 68 Lacs
        { day: 'Fri', value: 5500000, height: '75%' },  // 55 Lacs
        { day: 'Sat', value: 7200000, height: '95%' },  // 72 Lacs
        { day: 'Sun', value: 4800000, height: '65%' }   // 48 Lacs
      ]
    },
    wtd: {
      title: 'Collection Trend (Week Till Date)',
      data: [
        { day: 'Mon', value: 12000000, height: '65%' },  // 1.2 Cr
        { day: 'Tue', value: 14500000, height: '80%' },  // 1.45 Cr
        { day: 'Wed', value: 9800000, height: '55%' },   // 98 Lacs
        { day: 'Thu', value: 17800000, height: '95%' },  // 1.78 Cr
        { day: 'Fri', value: 15600000, height: '85%' },  // 1.56 Cr
        { day: 'Sat', value: 18900000, height: '100%' }, // 1.89 Cr
        { day: 'Sun', value: 13400000, height: '70%' }   // 1.34 Cr
      ]
    },
    mtd: {
      title: 'Collection Trend (Month Till Date)',
      data: [
        { day: '1', value: 4500000, height: '60%' },   // 45 Lacs
        { day: '2', value: 5200000, height: '70%' },   // 52 Lacs
        { day: '3', value: 3800000, height: '50%' },   // 38 Lacs
        { day: '4', value: 6800000, height: '90%' },   // 68 Lacs
        { day: '5', value: 5500000, height: '75%' },   // 55 Lacs
        { day: '6', value: 7200000, height: '95%' },   // 72 Lacs
        { day: '7', value: 4800000, height: '65%' },   // 48 Lacs
        { day: '8', value: 6100000, height: '80%' },   // 61 Lacs
        { day: '9', value: 4300000, height: '55%' },   // 43 Lacs
        { day: '10', value: 7900000, height: '100%' }, // 79 Lacs
        { day: '11', value: 5600000, height: '72%' },  // 56 Lacs
        { day: '12', value: 6700000, height: '85%' },  // 67 Lacs
        { day: '13', value: 4900000, height: '62%' },  // 49 Lacs
        { day: '14', value: 7300000, height: '92%' },  // 73 Lacs
        { day: '15', value: 5800000, height: '74%' },  // 58 Lacs
        { day: '16', value: 6400000, height: '82%' },  // 64 Lacs
        { day: '17', value: 4100000, height: '52%' },  // 41 Lacs
        { day: '18', value: 7600000, height: '96%' },  // 76 Lacs
        { day: '19', value: 5300000, height: '68%' },  // 53 Lacs
        { day: '20', value: 6900000, height: '88%' },  // 69 Lacs
        { day: '21', value: 4700000, height: '60%' },  // 47 Lacs
        { day: '22', value: 7100000, height: '90%' },  // 71 Lacs
        { day: '23', value: 5900000, height: '75%' },  // 59 Lacs
        { day: '24', value: 6500000, height: '83%' },  // 65 Lacs
        { day: '25', value: 4400000, height: '56%' },  // 44 Lacs
        { day: '26', value: 7800000, height: '98%' },  // 78 Lacs
        { day: '27', value: 5400000, height: '69%' },  // 54 Lacs
        { day: '28', value: 7000000, height: '89%' },  // 70 Lacs
        { day: '29', value: 4600000, height: '58%' },  // 46 Lacs
        { day: '30', value: 7400000, height: '94%' },  // 74 Lacs
        { day: '31', value: 5100000, height: '65%' }   // 51 Lacs
      ]
    },
    fy: {
      title: 'Collection Trend (Current Financial Year)',
      data: [
        { day: 'Apr', value: 120000000, height: '60%' },  // 12 Cr
        { day: 'May', value: 135000000, height: '70%' },  // 13.5 Cr
        { day: 'Jun', value: 98000000, height: '50%' },   // 9.8 Cr
        { day: 'Jul', value: 168000000, height: '90%' },  // 16.8 Cr
        { day: 'Aug', value: 145000000, height: '75%' },  // 14.5 Cr
        { day: 'Sep', value: 172000000, height: '95%' },  // 17.2 Cr
        { day: 'Oct', value: 148000000, height: '65%' },  // 14.8 Cr
        { day: 'Nov', value: 132000000, height: '68%' },  // 13.2 Cr
        { day: 'Dec', value: 158000000, height: '82%' },  // 15.8 Cr
        { day: 'Jan', value: 142000000, height: '73%' },  // 14.2 Cr
        { day: 'Feb', value: 116000000, height: '58%' },  // 11.6 Cr
        { day: 'Mar', value: 165000000, height: '85%' }   // 16.5 Cr
      ]
    },
    lfy: {
      title: 'Collection Trend (Last Financial Year)',
      data: [
        { day: 'Apr', value: 110000000, height: '55%' },  // 11 Cr
        { day: 'May', value: 125000000, height: '65%' },  // 12.5 Cr
        { day: 'Jun', value: 88000000, height: '45%' },   // 8.8 Cr
        { day: 'Jul', value: 158000000, height: '85%' },  // 15.8 Cr
        { day: 'Aug', value: 135000000, height: '70%' },  // 13.5 Cr
        { day: 'Sep', value: 162000000, height: '90%' },  // 16.2 Cr
        { day: 'Oct', value: 138000000, height: '60%' },  // 13.8 Cr
        { day: 'Nov', value: 122000000, height: '58%' },  // 12.2 Cr
        { day: 'Dec', value: 148000000, height: '78%' },  // 14.8 Cr
        { day: 'Jan', value: 132000000, height: '68%' },  // 13.2 Cr
        { day: 'Feb', value: 106000000, height: '48%' },  // 10.6 Cr
        { day: 'Mar', value: 155000000, height: '80%' }   // 15.5 Cr
      ]
    }
  }

  const currentChartData = chartData[chartFilter]

  // All available cards for favorites
  const allCards = [
    { id: 'allocation', name: 'Allocation Summary', category: 'Staff Monitoring' },
    { id: 'collection', name: 'Collection Efficiency (%)', category: 'Staff Monitoring' },
    { id: 'ptp', name: 'PTP Conversion Rate (%)', category: 'Staff Monitoring' },
    { id: 'productivity', name: 'Staff Productivity Index', category: 'Staff Monitoring' },
    { id: 'inactive', name: 'Inactive/Non-performing Staff', category: 'Staff Monitoring' },
    { id: 'whatsapp', name: 'WhatsApp Engagements', category: 'Customer Engagement' },
    { id: 'aiCalls', name: 'AI Calls', category: 'Customer Engagement' },
    { id: 'dialler', name: 'Dialler Calls', category: 'Customer Engagement' },
    { id: 'fieldVisits', name: 'Field Visits', category: 'Customer Engagement' },
    { id: 'overdue', name: 'Overdue Accounts', category: 'Payment Intent' },
    { id: 'promised', name: 'Promised to Pay', category: 'Payment Intent' },
    { id: 'refused', name: 'Refused to Pay', category: 'Payment Intent' },
    { id: 'paid', name: 'Already Paid', category: 'Payment Intent' },
    { id: 'broken', name: 'Broken Promises', category: 'Payment Intent' },
    { id: 'wrong', name: 'Wrong Numbers / Unreachable', category: 'Payment Intent' }
  ]

  // Handle favorite toggle
  const toggleFavorite = (cardId) => {
    setFavoriteCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  // Persist favorites across refreshes
  useEffect(() => {
    try {
      localStorage.setItem('favoriteCards', JSON.stringify(favoriteCards))
    } catch (e) {
      // ignore storage errors
    }
  }, [favoriteCards])

  const renderFavoritePin = (cardId) => {
    const isFav = favoriteCards.includes(cardId)
    return (
      <button
        type="button"
        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${isFav ? 'bg-yellow-400 text-yellow-800' : 'bg-gray-200 text-gray-600'} cursor-pointer shadow-sm z-[60] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity`}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(cardId) }}
        aria-label={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
        title={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
      >
        {isFav ? <LuPinOff size={14} /> : <GoPin size={14} />}
      </button>
    )
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

                

                {/* Section 7: Delegation Tracking */}
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
                {/* Favorites Section */}
                {favoriteCards.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      ⭐ Favorites ({favoriteCards.length})
                    </h2>
                    <div className="grid grid-cols-5 gap-3">
                      {favoriteCards.map(cardId => {
                        const card = allCards.find(c => c.id === cardId)
                        if (!card) return null
                        
                        // Render different cards based on their ID
                        if (cardId === 'allocation') {
                          return (
                            <div key={cardId} className="group bg-indigo-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg">
                              <div className="text-indigo-600 text-xs">Allocation Summary</div>
                              <div className="text-lg font-bold text-indigo-900">1,245</div>
                              {renderFavoritePin('allocation')}
                            </div>
                          )
                        } else if (cardId === 'collection') {
                          return (
                            <div key={cardId} className="group bg-blue-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg">
                              <div className="text-blue-600 text-xs">Collection Efficiency (%)</div>
                              <div className="text-lg font-bold text-blue-900">86.4%</div>
                              {renderFavoritePin('collection')}
                            </div>
                          )
                        } else if (cardId === 'ptp') {
                          return (
                            <div key={cardId} className="group bg-green-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg">
                              <div className="text-green-600 text-xs">PTP Conversion Rate (%)</div>
                              <div className="text-lg font-bold text-green-900">72.3%</div>
                              {renderFavoritePin('ptp')}
                            </div>
                          )
                        } else if (cardId === 'productivity') {
                          return (
                            <div key={cardId} className="group bg-orange-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg">
                              <div className="text-orange-600 text-xs">Staff Productivity Index</div>
                              <div className="text-lg font-bold text-orange-900">156</div>
                              {renderFavoritePin('productivity')}
                            </div>
                          )
                        } else if (cardId === 'inactive') {
                          return (
                            <div key={cardId} className="group bg-red-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg">
                              <div className="text-red-600 text-xs">Inactive/Non-performing Staff</div>
                              <div className="text-lg font-bold text-red-900">3</div>
                              {renderFavoritePin('inactive')}
                            </div>
                          )
                        } else if (cardId === 'whatsapp') {
                          return (
                            <div key={cardId} className="group bg-green-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-green-100 shadow-lg relative">
                              {renderFavoritePin('whatsapp')}
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
                              </div>
                            </div>
                          )
                        } else if (cardId === 'aiCalls') {
                          return (
                            <div key={cardId} className="group bg-blue-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-blue-100 shadow-lg relative">
                              {renderFavoritePin('aiCalls')}
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
                              </div>
                            </div>
                          )
                        } else if (cardId === 'dialler') {
                          return (
                            <div key={cardId} className="group bg-purple-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-purple-100 shadow-lg relative">
                              {renderFavoritePin('dialler')}
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
                              </div>
                            </div>
                          )
                        } else if (cardId === 'fieldVisits') {
                          return (
                            <div key={cardId} className="group bg-orange-50 border-2 border-yellow-400 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-orange-100 shadow-lg relative">
                              {renderFavoritePin('fieldVisits')}
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
                              </div>
                            </div>
                          )
                        } else if (cardId === 'overdue') {
                          return (
                            <div key={cardId} className="bg-red-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg relative">
                              {renderFavoritePin('overdue')}
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
                          )
                        } else if (cardId === 'promised') {
                          return (
                            <div key={cardId} className="bg-green-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg relative col-span-2">
                              {renderFavoritePin('promised')}
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
                          )
                        } else if (cardId === 'refused') {
                          return (
                            <div key={cardId} className="bg-orange-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg relative">
                              {renderFavoritePin('refused')}
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
                          )
                        } else if (cardId === 'paid') {
                          return (
                            <div key={cardId} className="bg-blue-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg relative">
                              {renderFavoritePin('paid')}
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
                          )
                        } else if (cardId === 'broken') {
                          return (
                            <div key={cardId} className="bg-purple-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg relative">
                              {renderFavoritePin('broken')}
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
                          )
                        } else if (cardId === 'wrong') {
                          return (
                            <div key={cardId} className="bg-gray-50 border-2 border-yellow-400 rounded-lg p-3 shadow-lg relative">
                              {renderFavoritePin('wrong')}
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
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                )}

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
                      {renderFavoritePin('allocation')}
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
                      {renderFavoritePin('collection')}
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
                      {renderFavoritePin('ptp')}
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
                      {renderFavoritePin('productivity')}
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
                      {renderFavoritePin('inactive')}
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
                      className="group bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-green-100 relative"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('whatsapp')}
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
                      className="group bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-blue-100 relative"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('aiCalls')}
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
                      className="group bg-purple-50 border border-purple-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-purple-100 relative"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('dialler')}
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
                      className="group bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-orange-100 relative"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('fieldVisits')}
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
                    <div className="group bg-red-50 border border-red-200 rounded-lg p-3 relative">
                      {renderFavoritePin('overdue')}
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

                    <div className="group bg-green-50 border border-green-200 rounded-lg p-3 relative">
                      {renderFavoritePin('promised')}
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

                    <div className="group bg-orange-50 border border-orange-200 rounded-lg p-3 relative">
                      {renderFavoritePin('refused')}
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

                    <div className="group bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
                      {renderFavoritePin('paid')}
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

                    <div className="group bg-purple-50 border border-purple-200 rounded-lg p-3 relative">
                      {renderFavoritePin('broken')}
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

                    <div className="group bg-gray-50 border border-gray-200 rounded-lg p-3 relative">
                      {renderFavoritePin('wrong')}
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
                     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-2 relative">
                       <div className="flex justify-between items-center mb-4">
                         <h3 className="text-sm font-semibold text-gray-900">{currentChartData.title}</h3>
                         <select 
                           value={chartFilter} 
                           onChange={(e) => setChartFilter(e.target.value)}
                           className="px-3 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                         >
                           <option value="ftd">For the Day (FTD)</option>
                           <option value="wtd">Week Till Date (WTD)</option>
                           <option value="mtd">Month Till Date (MTD)</option>
                           <option value="fy">Current Financial Year</option>
                           <option value="lfy">Last Financial Year</option>
                         </select>
                       </div>
                       
                       <div className="relative">
                         <Chart
                         options={{
                           chart: {
                             type: 'bar',
                             height: 350,
                             toolbar: { show: false },
                             animations: {
                               enabled: true,
                               easing: 'easeinout',
                               speed: 800
                             }
                           },
                           plotOptions: {
                             bar: {
                               borderRadius: 4,
                               columnWidth: currentChartData.data.length > 20 ? '60%' : currentChartData.data.length > 10 ? '70%' : '80%',
                               dataLabels: {
                                 position: 'top'
                               }
                             }
                           },
                           dataLabels: {
                             enabled: true,
                             offsetY: -20,
                             style: {
                               fontSize: '11px',
                               fontWeight: 600,
                               colors: ['#1e40af']
                             },
                             formatter: function (val) {
                               if (val >= 10000000) {
                                 return `₹${(val / 10000000).toFixed(2)}Cr`;
                               } else if (val >= 100000) {
                                 return `₹${(val / 100000).toFixed(2)}L`;
                               } else if (val >= 1000) {
                                 return `₹${(val / 1000).toFixed(1)}K`;
                               }
                               return `₹${val}`;
                             }
                           },
                           xaxis: {
                             categories: currentChartData.data.map(item => item.day),
                             labels: {
                               style: {
                                 fontSize: '11px',
                                 fontWeight: 500,
                                 colors: '#4b5563'
                               }
                             },
                             axisBorder: {
                               show: true,
                               color: '#e5e7eb'
                             },
                             axisTicks: {
                               show: true,
                               color: '#e5e7eb'
                             }
                           },
                           yaxis: {
                             title: {
                               text: 'Collection (₹)',
                               style: {
                                 fontSize: '11px',
                                 fontWeight: 600,
                                 color: '#4b5563'
                               }
                             },
                             labels: {
                               style: {
                                 fontSize: '11px',
                                 colors: '#6b7280'
                               },
                               formatter: function (val) {
                                 if (val >= 10000000) {
                                   return `₹${(val / 10000000).toFixed(2)}Cr`;
                                 } else if (val >= 100000) {
                                   return `₹${(val / 100000).toFixed(2)}L`;
                                 } else if (val >= 1000) {
                                   return `₹${(val / 1000).toFixed(1)}K`;
                                 }
                                 return `₹${val}`;
                               }
                             }
                           },
                           colors: ['#3b82f6'],
                           grid: {
                             borderColor: '#e5e7eb',
                             strokeDashArray: 3,
                             xaxis: {
                               lines: {
                                 show: false
                               }
                             },
                             yaxis: {
                               lines: {
                                 show: true
                               }
                             }
                           },
                           tooltip: {
                             theme: 'light',
                             y: {
                               formatter: function (val) {
                                 if (val >= 10000000) {
                                   return `₹${(val / 10000000).toFixed(2)} Cr (₹${val.toLocaleString('en-IN')})`;
                                 } else if (val >= 100000) {
                                   return `₹${(val / 100000).toFixed(2)} L (₹${val.toLocaleString('en-IN')})`;
                                 } else if (val >= 1000) {
                                   return `₹${(val / 1000).toFixed(1)} K (₹${val.toLocaleString('en-IN')})`;
                                 }
                                 return `₹${val.toLocaleString('en-IN')}`;
                               }
                             }
                           },
                           responsive: [{
                             breakpoint: 768,
                             options: {
                               chart: {
                                 height: 300
                               },
                               dataLabels: {
                                 fontSize: '9px'
                               }
                             }
                           }]
                         }}
                         series={[{
                           name: 'Collection',
                           data: currentChartData.data.map(item => item.value)
                         }]}
                         type="bar"
                         height={350}
                       />
                         <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                           📊 Live Chart
                         </div>
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