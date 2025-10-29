import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const StaffManagement = () => {
  const [searchParams] = useSearchParams()
  const selectedMetric = searchParams.get('metric') || 'overview'
  const [activeRegionMetric, setActiveRegionMetric] = useState(selectedMetric !== 'overview' ? selectedMetric : null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('efficiency')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1)
  const mainContentRef = useRef(null)
  const customerDetailsRef = useRef(null)
  
  const itemsPerPage = 10
  const customerItemsPerPage = 10

  // Handle main performance card click
  const handleMainCardClick = (metric) => {
    setActiveRegionMetric(metric)
    setSelectedRegion(null) // Clear any selected region
    setCurrentPage(1) // Reset to first page
  }

  // Handle region card click
  const handleRegionClick = (region) => {
    setSelectedRegion(region)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Clear region filter
  const clearRegionFilter = () => {
    setSelectedRegion(null)
    setCurrentPage(1)
  }

  // Handle customer count click
  const handleCustomerCountClick = (staff) => {
    setSelectedStaff(staff)
    setShowCustomerDetails(true)
    setCustomerCurrentPage(1) // Reset to first page
    
    // Scroll to customer details table after a short delay to ensure it's rendered
    setTimeout(() => {
      if (customerDetailsRef.current) {
        customerDetailsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }

  // Close customer details
  const closeCustomerDetails = () => {
    setShowCustomerDetails(false)
    setSelectedStaff(null)
    setCustomerCurrentPage(1) // Reset pagination
  }

  // Region-wise performance data
  const regionData = {
    allocation: [
      { region: 'North', value: 1245, count: 45, amount: '₹2.1Cr' },
      { region: 'South', value: 987, count: 38, amount: '₹1.8Cr' },
      { region: 'East', value: 1102, count: 42, amount: '₹1.9Cr' },
      { region: 'West', value: 892, count: 35, amount: '₹1.6Cr' },
      { region: 'Central', value: 1056, count: 40, amount: '₹1.7Cr' }
    ],
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

  // Reset selected region when metric changes (from URL)
  useEffect(() => {
    setActiveRegionMetric(selectedMetric !== 'overview' ? selectedMetric : null)
    setSelectedRegion(null)
    setCurrentPage(1)
  }, [selectedMetric])

  // Reset selected region when activeRegionMetric changes (from card click)
  useEffect(() => {
    setSelectedRegion(null)
    setCurrentPage(1)
  }, [activeRegionMetric])

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
    { id: 'EMP001', name: 'Ramesh Kumar', branch: 'Mumbai Central', center: 'Mumbai', loanType: 'Tractor', region: 'North', calls: 45, visits: 12, collected: 250000, efficiency: 92, escalations: 1, hierarchy: 'Supervisor', customers: 156, due: 3200000, overdue: 450000 },
    { id: 'EMP002', name: 'Ankit Sharma', branch: 'Bangalore Whitefield', center: 'Bangalore', loanType: 'Commercial Vehicle', region: 'South', calls: 38, visits: 8, collected: 180000, efficiency: 67, escalations: 3, hierarchy: 'Collection Officer', customers: 89, due: 2100000, overdue: 680000 },
    { id: 'EMP003', name: 'Priya Rao', branch: 'Chennai T. Nagar', center: 'Chennai', loanType: 'Construction Equipment', region: 'East', calls: 42, visits: 15, collected: 220000, efficiency: 88, escalations: 0, hierarchy: 'Senior Executive', customers: 134, due: 2800000, overdue: 320000 },
    { id: 'EMP004', name: 'Suresh Patel', branch: 'Pune IT Park', center: 'Pune', loanType: 'Tractor', region: 'West', calls: 35, visits: 6, collected: 120000, efficiency: 54, escalations: 5, hierarchy: 'Collection Officer', customers: 67, due: 1500000, overdue: 890000 },
    { id: 'EMP005', name: 'Meena Iyer', branch: 'Mumbai Central', center: 'Mumbai', loanType: 'Commercial Vehicle', region: 'Central', calls: 40, visits: 10, collected: 195000, efficiency: 80, escalations: 2, hierarchy: 'Executive', customers: 112, due: 2400000, overdue: 380000 },
    { id: 'EMP006', name: 'Rajesh Singh', branch: 'Delhi CP', center: 'Delhi', loanType: 'Tractor', region: 'North', calls: 48, visits: 14, collected: 280000, efficiency: 95, escalations: 0, hierarchy: 'Senior Executive', customers: 178, due: 3600000, overdue: 180000 },
    { id: 'EMP007', name: 'Sunita Verma', branch: 'Kolkata Salt Lake', center: 'Kolkata', loanType: 'Construction Equipment', region: 'East', calls: 32, visits: 7, collected: 150000, efficiency: 62, escalations: 4, hierarchy: 'Collection Officer', customers: 78, due: 1800000, overdue: 720000 },
    { id: 'EMP008', name: 'Vikram Joshi', branch: 'Ahmedabad CG Road', center: 'Ahmedabad', loanType: 'Commercial Vehicle', region: 'West', calls: 44, visits: 11, collected: 210000, efficiency: 85, escalations: 1, hierarchy: 'Executive', customers: 125, due: 2600000, overdue: 290000 },
    { id: 'EMP009', name: 'Deepa Nair', branch: 'Kochi Marine Drive', center: 'Kochi', loanType: 'Tractor', region: 'South', calls: 36, visits: 9, collected: 165000, efficiency: 72, escalations: 2, hierarchy: 'Collection Officer', customers: 95, due: 1900000, overdue: 420000 },
    { id: 'EMP010', name: 'Arjun Reddy', branch: 'Hyderabad HITEC', center: 'Hyderabad', loanType: 'Construction Equipment', region: 'South', calls: 41, visits: 13, collected: 235000, efficiency: 89, escalations: 1, hierarchy: 'Senior Executive', customers: 142, due: 3000000, overdue: 250000 },
    { id: 'EMP011', name: 'Kavita Desai', branch: 'Mumbai Central', center: 'Mumbai', loanType: 'Commercial Vehicle', region: 'West', calls: 29, visits: 5, collected: 95000, efficiency: 48, escalations: 6, hierarchy: 'Collection Officer', customers: 56, due: 1200000, overdue: 950000 },
    { id: 'EMP012', name: 'Rohit Agarwal', branch: 'Delhi CP', center: 'Delhi', loanType: 'Tractor', region: 'North', calls: 46, visits: 16, collected: 265000, efficiency: 91, escalations: 0, hierarchy: 'Executive', customers: 165, due: 3400000, overdue: 195000 }
  ]

  // Mock customer data for each staff member
  const customerData = {
    'EMP001': [
      { id: 'C001', name: 'Rajesh Kumar', phone: '9876543210', loanAmount: 500000, dueAmount: 150000, overdueAmount: 25000, status: 'Active', lastPayment: '2024-01-15', nextDue: '2024-02-15' },
      { id: 'C002', name: 'Priya Sharma', phone: '9876543211', loanAmount: 750000, dueAmount: 200000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-20', nextDue: '2024-02-20' },
      { id: 'C003', name: 'Amit Patel', phone: '9876543212', loanAmount: 300000, dueAmount: 75000, overdueAmount: 15000, status: 'Overdue', lastPayment: '2023-12-10', nextDue: '2024-01-10' },
      { id: 'C004', name: 'Sunita Verma', phone: '9876543213', loanAmount: 400000, dueAmount: 100000, overdueAmount: 20000, status: 'Active', lastPayment: '2024-01-18', nextDue: '2024-02-18' },
      { id: 'C005', name: 'Vikram Singh', phone: '9876543214', loanAmount: 600000, dueAmount: 180000, overdueAmount: 30000, status: 'Overdue', lastPayment: '2023-11-25', nextDue: '2023-12-25' },
      { id: 'C006', name: 'Meera Joshi', phone: '9876543215', loanAmount: 800000, dueAmount: 250000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-22', nextDue: '2024-02-22' },
      { id: 'C007', name: 'Ravi Kumar', phone: '9876543216', loanAmount: 350000, dueAmount: 90000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-01-12', nextDue: '2024-02-12' },
      { id: 'C008', name: 'Sneha Reddy', phone: '9876543217', loanAmount: 550000, dueAmount: 140000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-01-08', nextDue: '2024-02-08' },
      { id: 'C009', name: 'Kiran Desai', phone: '9876543218', loanAmount: 450000, dueAmount: 120000, overdueAmount: 35000, status: 'Overdue', lastPayment: '2023-10-15', nextDue: '2023-11-15' },
      { id: 'C010', name: 'Prakash Rao', phone: '9876543219', loanAmount: 320000, dueAmount: 80000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-25', nextDue: '2024-02-25' },
      { id: 'C011', name: 'Anita Iyer', phone: '9876543220', loanAmount: 680000, dueAmount: 180000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-01-14', nextDue: '2024-02-14' },
      { id: 'C012', name: 'Suresh Nair', phone: '9876543221', loanAmount: 420000, dueAmount: 110000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-19', nextDue: '2024-02-19' },
      { id: 'C013', name: 'Lakshmi Menon', phone: '9876543222', loanAmount: 580000, dueAmount: 150000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-05', nextDue: '2024-01-05' },
      { id: 'C014', name: 'Vijay Kumar', phone: '9876543223', loanAmount: 720000, dueAmount: 200000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-21', nextDue: '2024-02-21' },
      { id: 'C015', name: 'Geeta Sharma', phone: '9876543224', loanAmount: 380000, dueAmount: 95000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-16', nextDue: '2024-02-16' },
      { id: 'C016', name: 'Manoj Gupta', phone: '9876543225', loanAmount: 650000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-11', nextDue: '2024-02-11' }
    ],
    'EMP002': [
      { id: 'C004', name: 'Sunita Verma', phone: '9876543213', loanAmount: 400000, dueAmount: 100000, overdueAmount: 20000, status: 'Active', lastPayment: '2024-01-18', nextDue: '2024-02-18' },
      { id: 'C005', name: 'Vikram Singh', phone: '9876543214', loanAmount: 600000, dueAmount: 180000, overdueAmount: 30000, status: 'Overdue', lastPayment: '2023-11-25', nextDue: '2023-12-25' }
    ],
    'EMP003': [
      { id: 'C006', name: 'Meera Joshi', phone: '9876543215', loanAmount: 800000, dueAmount: 250000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-22', nextDue: '2024-02-22' },
      { id: 'C007', name: 'Ravi Kumar', phone: '9876543216', loanAmount: 350000, dueAmount: 90000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-01-12', nextDue: '2024-02-12' },
      { id: 'C008', name: 'Sneha Reddy', phone: '9876543217', loanAmount: 550000, dueAmount: 140000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-01-08', nextDue: '2024-02-08' }
    ],
    'EMP004': [
      { id: 'C009', name: 'Kiran Desai', phone: '9876543218', loanAmount: 450000, dueAmount: 120000, overdueAmount: 35000, status: 'Overdue', lastPayment: '2023-10-15', nextDue: '2023-11-15' },
      { id: 'C010', name: 'Prakash Rao', phone: '9876543219', loanAmount: 320000, dueAmount: 80000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-25', nextDue: '2024-02-25' }
    ],
    'EMP005': [
      { id: 'C011', name: 'Anita Iyer', phone: '9876543220', loanAmount: 680000, dueAmount: 180000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-01-14', nextDue: '2024-02-14' },
      { id: 'C012', name: 'Suresh Nair', phone: '9876543221', loanAmount: 420000, dueAmount: 110000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-19', nextDue: '2024-02-19' },
      { id: 'C013', name: 'Lakshmi Menon', phone: '9876543222', loanAmount: 580000, dueAmount: 150000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-05', nextDue: '2024-01-05' }
    ],
    'EMP006': [
      { id: 'C014', name: 'Vijay Kumar', phone: '9876543223', loanAmount: 720000, dueAmount: 200000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-21', nextDue: '2024-02-21' },
      { id: 'C015', name: 'Geeta Sharma', phone: '9876543224', loanAmount: 380000, dueAmount: 95000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-16', nextDue: '2024-02-16' },
      { id: 'C016', name: 'Manoj Gupta', phone: '9876543225', loanAmount: 650000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-11', nextDue: '2024-02-11' }
    ],
    'EMP008': [
      { id: 'C017', name: 'Rajesh Patel', phone: '9876543226', loanAmount: 520000, dueAmount: 130000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-01-17', nextDue: '2024-02-17' },
      { id: 'C018', name: 'Sunita Iyer', phone: '9876543227', loanAmount: 680000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-23', nextDue: '2024-02-23' },
      { id: 'C019', name: 'Amit Kumar', phone: '9876543228', loanAmount: 420000, dueAmount: 105000, overdueAmount: 25000, status: 'Overdue', lastPayment: '2023-12-20', nextDue: '2024-01-20' },
      { id: 'C020', name: 'Priya Reddy', phone: '9876543229', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-19', nextDue: '2024-02-19' },
      { id: 'C021', name: 'Vikram Sharma', phone: '9876543230', loanAmount: 750000, dueAmount: 190000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-24', nextDue: '2024-02-24' }
    ]
  }

  // Filter and sort staff data
  const filteredStaff = staffLeaderboardData.filter(staff => {
    // Apply search filter
    const matchesSearch = staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.center.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.customers.toString().includes(searchTerm) ||
      staff.due.toString().includes(searchTerm) ||
      staff.overdue.toString().includes(searchTerm)
    
    // Apply region filter if selected
    const matchesRegion = selectedRegion ? staff.region === selectedRegion : true
    
    // Apply metric-specific filter for inactive staff
    let matchesMetric = true
    if (activeRegionMetric === 'inactive') {
      matchesMetric = staff.efficiency === 0 // Assuming inactive staff have 0 efficiency
    }
    // For allocation, show all staff (no specific filtering)
    
    return matchesSearch && matchesRegion && matchesMetric
  }).sort((a, b) => {
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

  // Customer pagination
  const currentCustomers = selectedStaff ? customerData[selectedStaff.id] || [] : []
  const customerTotalPages = Math.ceil(currentCustomers.length / customerItemsPerPage)
  const customerStartIndex = (customerCurrentPage - 1) * customerItemsPerPage
  const paginatedCustomers = currentCustomers.slice(customerStartIndex, customerStartIndex + customerItemsPerPage)

  // Get metric title
  const getMetricTitle = (metric) => {
    switch (metric) {
      case 'allocation': return 'Allocation Summary by Region'
      case 'collection': return 'Collection Efficiency by Region'
      case 'ptp': return 'PTP Conversion Rate by Region'
      case 'visit': return 'Visit Compliance Rate by Region'
      case 'productivity': return 'Staff Productivity Index by Region'
      case 'inactive': return 'Inactive/Non-performing Staff by Region'
      default: return 'Staff Performance Overview'
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Staff Performance Overview</h3>
              
              <div className="grid grid-cols-5 gap-3">
                {/* Allocation Summary Card */}
                <div 
                  className={`bg-indigo-50 border border-indigo-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    activeRegionMetric === 'allocation' ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleMainCardClick('allocation')}
                >
                  <div className="text-indigo-600 text-xs">Allocation Summary</div>
                  <div className="text-lg font-bold text-indigo-900">1,245</div>
                </div>

                {/* Collection Efficiency Card */}
                <div 
                  className={`bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    activeRegionMetric === 'collection' ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleMainCardClick('collection')}
                >
                  <div className="text-blue-600 text-xs">Collection Efficiency (%)</div>
                  <div className="text-lg font-bold text-blue-900">86.4%</div>
                </div>

                {/* PTP Conversion Rate Card */}
                <div 
                  className={`bg-green-50 border border-green-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    activeRegionMetric === 'ptp' ? 'ring-2 ring-green-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleMainCardClick('ptp')}
                >
                  <div className="text-green-600 text-xs">PTP Conversion Rate (%)</div>
                  <div className="text-lg font-bold text-green-900">72.3%</div>
                </div>

                {/* Staff Productivity Index Card */}
                <div 
                  className={`bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    activeRegionMetric === 'productivity' ? 'ring-2 ring-orange-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleMainCardClick('productivity')}
                >
                  <div className="text-orange-600 text-xs">Staff Productivity Index</div>
                  <div className="text-lg font-bold text-orange-900">156</div>
                </div>

                {/* Inactive/Non-performing Staff Card */}
                <div 
                  className={`bg-red-50 border border-red-200 rounded-lg p-3 relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                    activeRegionMetric === 'inactive' ? 'ring-2 ring-red-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleMainCardClick('inactive')}
                >
                  <div className="text-red-600 text-xs">Inactive/Non-performing Staff</div>
                  <div className="text-lg font-bold text-red-900">3</div>
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</div>
                </div>
              </div>
            </div>

            {/* Region-wise Cards (Conditional Rendering) */}
            {activeRegionMetric && regionData[activeRegionMetric] && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{getMetricTitle(activeRegionMetric)}</h3>
                <div className="grid grid-cols-5 gap-3">
                  {regionData[activeRegionMetric]?.map((region, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedRegion === region.region ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      } ${
                        activeRegionMetric === 'allocation' ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' :
                        activeRegionMetric === 'collection' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                        activeRegionMetric === 'ptp' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                        activeRegionMetric === 'visit' ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' :
                        activeRegionMetric === 'productivity' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
                        activeRegionMetric === 'inactive' ? 'bg-red-50 border-red-200 hover:bg-red-100' :
                        'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleRegionClick(region.region)}
                    >
                      <div className={`text-xs ${
                        activeRegionMetric === 'allocation' ? 'text-indigo-600' :
                        activeRegionMetric === 'collection' ? 'text-blue-600' :
                        activeRegionMetric === 'ptp' ? 'text-green-600' :
                        activeRegionMetric === 'visit' ? 'text-purple-600' :
                        activeRegionMetric === 'productivity' ? 'text-orange-600' :
                        activeRegionMetric === 'inactive' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {region.region} Region
                      </div>
                      <div className={`text-lg font-bold ${
                        activeRegionMetric === 'allocation' ? 'text-indigo-900' :
                        activeRegionMetric === 'collection' ? 'text-blue-900' :
                        activeRegionMetric === 'ptp' ? 'text-green-900' :
                        activeRegionMetric === 'visit' ? 'text-purple-900' :
                        activeRegionMetric === 'productivity' ? 'text-orange-900' :
                        activeRegionMetric === 'inactive' ? 'text-red-900' :
                        'text-gray-900'
                      }`}>
                        {activeRegionMetric === 'inactive' ? region.value : 
                         activeRegionMetric === 'allocation' ? region.value.toLocaleString() :
                         `${region.value}${activeRegionMetric === 'productivity' ? '' : '%'}`}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Staff: {region.count} | {region.amount}
                      </div>
                      {selectedRegion === region.region && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Performance Leaderboard - Full Width */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Staff Performance Leaderboard</h2>
                  {selectedRegion && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                      <span className="text-sm text-blue-700">Filtered by: {selectedRegion} Region</span>
                      <button
                        onClick={clearRegionFilter}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                      >
                        ✕ Clear
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by ID, Name, Branch, Center, Loan Type, Customers, Due, Overdue..."
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
                    <option value="customers">Sort by Customers</option>
                    <option value="due">Sort by Due Amount</option>
                    <option value="overdue">Sort by Overdue Amount</option>
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
                <table className="w-full text-sm min-w-max">
                  <thead>
                    <tr className="text-gray-600 border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-3 font-semibold">Emp ID</th>
                      <th className="text-left py-4 px-3 font-semibold">Name</th>
                      <th className="text-left py-4 px-3 font-semibold">Hierarchy</th>
                      <th className="text-left py-4 px-3 font-semibold">Branch</th>
                      <th className="text-left py-4 px-3 font-semibold">Center</th>
                      <th className="text-left py-4 px-3 font-semibold">Loan Type</th>
                      <th className="text-left py-4 px-3 font-semibold">Region</th>
                      <th className="text-right py-4 px-3 font-semibold">Customers</th>
                      <th className="text-right py-4 px-3 font-semibold">Due</th>
                      <th className="text-right py-4 px-3 font-semibold">Overdue</th>
                      <th className="text-right py-4 px-3 font-semibold">Calls</th>
                      <th className="text-right py-4 px-3 font-semibold">Visits</th>
                      <th className="text-right py-4 px-3 font-semibold">Collected</th>
                      <th className="text-right py-4 px-3 font-semibold">Efficiency</th>
                      <th className="text-right py-4 px-3 font-semibold">Escalations</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {paginatedStaff.map((staff, index) => (
                      <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs text-left">{staff.id}</td>
                        <td className="py-3 px-3 font-medium text-left">{staff.name}</td>
                        <td className="py-3 px-3 text-left">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            staff.hierarchy === 'Supervisor' ? 'bg-purple-100 text-purple-800' :
                            staff.hierarchy === 'Senior Executive' ? 'bg-blue-100 text-blue-800' :
                            staff.hierarchy === 'Executive' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {staff.hierarchy}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-left">{staff.branch}</td>
                        <td className="py-3 px-3 text-left">{staff.center}</td>
                        <td className="py-3 px-3 text-left">
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            staff.loanType === 'Tractor' ? 'bg-orange-100 text-orange-800' :
                            staff.loanType === 'Commercial Vehicle' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {staff.loanType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-left">{staff.region}</td>
                        <td className="py-3 px-3 text-right font-medium">
                          <button 
                            onClick={() => handleCustomerCountClick(staff)}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            {staff.customers}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right font-medium">₹{(staff.due / 100000).toFixed(1)}L</td>
                        <td className="py-3 px-3 text-right font-medium">₹{(staff.overdue / 100000).toFixed(1)}L</td>
                        <td className="py-3 px-3 text-right">{staff.calls}</td>
                        <td className="py-3 px-3 text-right">{staff.visits}</td>
                        <td className="py-3 px-3 text-right font-medium">₹{(staff.collected / 100000).toFixed(1)}L</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-semibold ${
                            staff.efficiency >= 90 ? 'text-green-600' :
                            staff.efficiency >= 70 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {staff.efficiency}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
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
                  {selectedRegion ? (
                    <>
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} staff in {selectedRegion} Region
                    </>
                  ) : (
                    <>
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStaff.length)} of {filteredStaff.length} entries
                    </>
                  )}
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

            {/* Customer Details Table */}
            {showCustomerDetails && selectedStaff && (
              <div 
                ref={customerDetailsRef} 
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6"
                style={{
                  animation: 'fadeIn 0.3s ease-in-out'
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Customer Details - {selectedStaff.name} ({selectedStaff.id})
                  </h2>
                  <button
                    onClick={closeCustomerDetails}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-max">
                    <thead>
                      <tr className="text-gray-600 border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-4 px-3 font-semibold">Customer ID</th>
                        <th className="text-left py-4 px-3 font-semibold">Name</th>
                        <th className="text-left py-4 px-3 font-semibold">Phone</th>
                        <th className="text-right py-4 px-3 font-semibold">Loan Amount</th>
                        <th className="text-right py-4 px-3 font-semibold">Due Amount</th>
                        <th className="text-right py-4 px-3 font-semibold">Overdue Amount</th>
                        <th className="text-left py-4 px-3 font-semibold">Status</th>
                        <th className="text-left py-4 px-3 font-semibold">Last Payment</th>
                        <th className="text-left py-4 px-3 font-semibold">Next Due</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {paginatedCustomers.length > 0 ? (
                        paginatedCustomers.map((customer, index) => (
                          <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs text-left">{customer.id}</td>
                            <td className="py-3 px-3 font-medium text-left">{customer.name}</td>
                            <td className="py-3 px-3 text-left">{customer.phone}</td>
                            <td className="py-3 px-3 text-right font-medium">₹{(customer.loanAmount / 100000).toFixed(1)}L</td>
                            <td className="py-3 px-3 text-right font-medium">₹{(customer.dueAmount / 100000).toFixed(1)}L</td>
                            <td className="py-3 px-3 text-right font-medium">₹{(customer.overdueAmount / 100000).toFixed(1)}L</td>
                            <td className="py-3 px-3 text-left">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                customer.status === 'Active' ? 'bg-green-100 text-green-800' :
                                customer.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-left">{customer.lastPayment}</td>
                            <td className="py-3 px-3 text-left">{customer.nextDue}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="py-12 px-3 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-4xl mb-4">📋</div>
                              <div className="text-lg font-medium text-gray-600 mb-2">No Customer Data Available</div>
                              <div className="text-sm text-gray-500">
                                This staff member currently has no customers assigned.
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Customer Pagination */}
                {customerTotalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing {customerStartIndex + 1} to {Math.min(customerStartIndex + customerItemsPerPage, currentCustomers.length)} of {currentCustomers.length} customers
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCustomerCurrentPage(Math.max(1, customerCurrentPage - 1))}
                        disabled={customerCurrentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      {Array.from({ length: customerTotalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCustomerCurrentPage(page)}
                          className={`px-4 py-2 border rounded-lg text-sm transition-colors cursor-pointer ${
                            customerCurrentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCustomerCurrentPage(Math.min(customerTotalPages, customerCurrentPage + 1))}
                        disabled={customerCurrentPage === customerTotalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
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
    </>
  )
}

export default StaffManagement
