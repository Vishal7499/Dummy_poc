import React, { useState, useEffect, useRef } from 'react'
import { GoPin } from 'react-icons/go'
import { LuPinOff } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { dashboardApi, dashboardCollectionGraphApi } from '../utils/api'
import { formatIndianNumber } from '../utils/formatters'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('ftd')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [showAlerts, setShowAlerts] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [selectedStaffMetric, setSelectedStaffMetric] = useState(null)
  const [chartFilter, setChartFilter] = useState('ftd')
  const leaderboardTableRef = useRef(null)
  const [staffSearchTerm, setStaffSearchTerm] = useState('')
  const [staffSortBy, setStaffSortBy] = useState('efficiency')
  const [staffSortOrder, setStaffSortOrder] = useState('desc')
  const [staffCurrentPage, setStaffCurrentPage] = useState(1)
  const staffItemsPerPage = 10
  // Customer details state
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1)
  const customerItemsPerPage = 10
  const customerDetailsRef = useRef(null)
  // Filter states
  const [filterLoanType, setFilterLoanType] = useState('All Loans')
  const [filterDPD, setFilterDPD] = useState('All Buckets')
  const [filterGeography, setFilterGeography] = useState('All Regions')
  const [filterState, setFilterState] = useState('All States')
  const [filterDistrict, setFilterDistrict] = useState('All Districts')
  const [filterPICode, setFilterPICode] = useState('All PI Codes')
  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)
  const [collectionGraphData, setCollectionGraphData] = useState(null)
  const [collectionGraphLoading, setCollectionGraphLoading] = useState(false)
  const [collectionGraphError, setCollectionGraphError] = useState(null)
  // Initialize date filters - default to last 30 days
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
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
  const isFetchingRef = useRef(false)
  const filtersRef = useRef(null)

  // Fetch dashboard data from API when component mounts
  useEffect(() => {
    // Prevent duplicate API calls - check if already fetching or have data
    if (isFetchingRef.current || dashboardData) {
      return
    }

    if (!user?.accessToken) {
      // Wait for auth to load
      return
    }

    const fetchDashboardData = async () => {
      // Mark as fetching to prevent duplicate calls
      isFetchingRef.current = true

      try {
        setDashboardLoading(true)
        setDashboardError(null)
        const data = await dashboardApi(user.accessToken)
        setDashboardData(data)
        console.log('Dashboard data fetched:', data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setDashboardError(error.message || 'Failed to fetch dashboard data')
      } finally {
        setDashboardLoading(false)
        isFetchingRef.current = false
      }
    }

    fetchDashboardData()
  }, [user?.accessToken, dashboardData])

  // Fetch collection graph data using dynamic date filters
  useEffect(() => {
    if (!user?.accessToken || !fromDate || !toDate) {
      return
    }

    const fetchCollectionGraphData = async () => {
      try {
        setCollectionGraphLoading(true)
        setCollectionGraphError(null)
        
        console.log('Fetching collection graph data from:', fromDate, 'to:', toDate)
        
        const data = await dashboardCollectionGraphApi(user.accessToken, fromDate, toDate)
        setCollectionGraphData(data)
        console.log('Collection graph data fetched:', data)
        console.log('Collection graph data - from_date:', data?.from_date)
        console.log('Collection graph data - to_date:', data?.to_date)
        console.log('Collection graph data - day array:', data?.day)
        console.log('Collection graph data - day array length:', data?.day?.length)
        if (data?.day && data.day.length > 0) {
          console.log('Sample day data:', data.day[0])
          console.log('All dates in response:', data.day.map(d => d.date))
        }
      } catch (error) {
        console.error('Error fetching collection graph data:', error)
        setCollectionGraphError(error.message || 'Failed to fetch collection graph data')
      } finally {
        setCollectionGraphLoading(false)
      }
    }

    fetchCollectionGraphData()
  }, [user?.accessToken, fromDate, toDate])

  // Click outside handler for alerts dropdown, sidebar, and leaderboard table
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false)
      }
      // Close sidebar when clicking on main content
      if (mainContentRef.current && mainContentRef.current.contains(event.target) && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true)
      }
      // Close leaderboard table when clicking outside
      if (selectedStaffMetric && leaderboardTableRef.current && !leaderboardTableRef.current.contains(event.target)) {
        // Check if click is not on any of the staff monitoring cards
        const staffCards = document.querySelectorAll('[data-staff-card]')
        let clickedOnCard = false
        staffCards.forEach(card => {
          if (card.contains(event.target)) {
            clickedOnCard = true
          }
        })
        // Check if click is on filter elements (don't close table when using filters)
        const isFilterElement = filtersRef.current && filtersRef.current.contains(event.target)
        // Check if click is on customer table (don't close staff table when clicking customer table)
        const isCustomerTable = customerDetailsRef.current && customerDetailsRef.current.contains(event.target)
        if (!clickedOnCard && !isFilterElement && !isCustomerTable) {
          setSelectedStaffMetric(null)
        }
      }
      
      // Close customer table when clicking outside
      if (showCustomerDetails && customerDetailsRef.current && !customerDetailsRef.current.contains(event.target)) {
        // Check if click is on the customer count button in the staff table
        const isCustomerCountButton = event.target.closest('[data-customer-count-button]')
        // Check if click is on filter elements (don't close customer table when using filters)
        const isFilterElement = filtersRef.current && filtersRef.current.contains(event.target)
        // Check if click is on staff table (don't close customer table when clicking staff table)
        const isStaffTable = leaderboardTableRef.current && leaderboardTableRef.current.contains(event.target)
        if (!isCustomerCountButton && !isFilterElement && !isStaffTable) {
          setShowCustomerDetails(false)
          setSelectedStaff(null)
          setCustomerCurrentPage(1)
        }
      }
    }

    if (showAlerts || !isSidebarCollapsed || selectedStaffMetric || showCustomerDetails) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAlerts, isSidebarCollapsed, selectedStaffMetric, showCustomerDetails])

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

  // Enhanced staff data for leaderboard - matching StaffManagement format with district, state, and PI Code
  const staffLeaderboardBaseData = [
    { id: 'EMP001', name: 'Ramesh Kumar', hierarchy: 'Supervisor', piCode: 'PI001', center: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', loanType: 'Tractor', region: 'North', customers: 156, due: 3200000, overdue: 450000, calls: 45, visits: 12, collected: 2500000, efficiency: 92, escalations: 1 },
    { id: 'EMP002', name: 'Ankit Sharma', hierarchy: 'Collection Officer', piCode: 'PI002', center: 'Bangalore', district: 'Bangalore', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 89, due: 2100000, overdue: 680000, calls: 38, visits: 8, collected: 1800000, efficiency: 67, escalations: 3 },
    { id: 'EMP003', name: 'Priya Rao', hierarchy: 'Senior Executive', piCode: 'PI003', center: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', loanType: 'Construction Equipment', region: 'East', customers: 134, due: 2800000, overdue: 320000, calls: 42, visits: 15, collected: 2200000, efficiency: 88, escalations: 0 },
    { id: 'EMP004', name: 'Suresh Patel', hierarchy: 'Collection Officer', piCode: 'PI004', center: 'Pune', district: 'Pune', state: 'Maharashtra', loanType: 'Tractor', region: 'West', customers: 67, due: 1500000, overdue: 890000, calls: 35, visits: 6, collected: 1200000, efficiency: 54, escalations: 5 },
    { id: 'EMP005', name: 'Meena Iyer', hierarchy: 'Executive', piCode: 'PI005', center: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', loanType: 'Commercial Vehicle', region: 'Central', customers: 112, due: 2400000, overdue: 380000, calls: 40, visits: 10, collected: 1950000, efficiency: 80, escalations: 2 },
    { id: 'EMP006', name: 'Rajesh Singh', hierarchy: 'Senior Executive', piCode: 'PI006', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 178, due: 3600000, overdue: 180000, calls: 48, visits: 14, collected: 2800000, efficiency: 95, escalations: 0 },
    { id: 'EMP007', name: 'Sunita Verma', hierarchy: 'Collection Officer', piCode: 'PI007', center: 'Kolkata', district: 'Kolkata', state: 'West Bengal', loanType: 'Construction Equipment', region: 'East', customers: 78, due: 1800000, overdue: 720000, calls: 32, visits: 7, collected: 1500000, efficiency: 62, escalations: 4 },
    { id: 'EMP008', name: 'Vikram Joshi', hierarchy: 'Executive', piCode: 'PI008', center: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', loanType: 'Commercial Vehicle', region: 'West', customers: 125, due: 2600000, overdue: 290000, calls: 44, visits: 11, collected: 2100000, efficiency: 85, escalations: 1 },
    { id: 'EMP009', name: 'Deepa Nair', hierarchy: 'Collection Officer', piCode: 'PI009', center: 'Kochi', district: 'Kochi', state: 'Kerala', loanType: 'Tractor', region: 'South', customers: 95, due: 1900000, overdue: 420000, calls: 36, visits: 9, collected: 1650000, efficiency: 72, escalations: 2 },
    { id: 'EMP010', name: 'Arjun Reddy', hierarchy: 'Senior Executive', piCode: 'PI010', center: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', loanType: 'Construction Equipment', region: 'South', customers: 142, due: 3000000, overdue: 250000, calls: 41, visits: 13, collected: 2350000, efficiency: 89, escalations: 1 },
    { id: 'EMP011', name: 'Kavita Desai', hierarchy: 'Collection Officer', piCode: 'PI011', center: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', loanType: 'Commercial Vehicle', region: 'West', customers: 56, due: 1200000, overdue: 950000, calls: 29, visits: 5, collected: 950000, efficiency: 48, escalations: 6 },
    { id: 'EMP012', name: 'Rohit Agarwal', hierarchy: 'Executive', piCode: 'PI012', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 165, due: 3400000, overdue: 195000, calls: 46, visits: 16, collected: 2650000, efficiency: 91, escalations: 0 }
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
      { id: 'C017', name: 'Ramesh Patel', phone: '9876543226', loanAmount: 520000, dueAmount: 130000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-01-17', nextDue: '2024-02-17' },
      { id: 'C018', name: 'Sunita Iyer', phone: '9876543227', loanAmount: 680000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-23', nextDue: '2024-02-23' },
      { id: 'C019', name: 'Amit Kumar', phone: '9876543228', loanAmount: 420000, dueAmount: 105000, overdueAmount: 25000, status: 'Overdue', lastPayment: '2023-12-20', nextDue: '2024-01-20' }
    ],
    'EMP003': [
      { id: 'C020', name: 'Priya Reddy', phone: '9876543229', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-19', nextDue: '2024-02-19' },
      { id: 'C021', name: 'Vikram Sharma', phone: '9876543230', loanAmount: 750000, dueAmount: 190000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-24', nextDue: '2024-02-24' },
      { id: 'C022', name: 'Kavita Nair', phone: '9876543231', loanAmount: 480000, dueAmount: 120000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-01-13', nextDue: '2024-02-13' }
    ],
    'EMP004': [
      { id: 'C023', name: 'Rohit Desai', phone: '9876543232', loanAmount: 350000, dueAmount: 90000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-15', nextDue: '2024-01-15' },
      { id: 'C024', name: 'Anjali Mehta', phone: '9876543233', loanAmount: 620000, dueAmount: 155000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-26', nextDue: '2024-02-26' }
    ],
    'EMP005': [
      { id: 'C025', name: 'Suresh Rao', phone: '9876543234', loanAmount: 540000, dueAmount: 135000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-01-10', nextDue: '2024-02-10' },
      { id: 'C026', name: 'Deepa Iyer', phone: '9876543235', loanAmount: 710000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-27', nextDue: '2024-02-27' },
      { id: 'C027', name: 'Manish Gupta', phone: '9876543236', loanAmount: 430000, dueAmount: 110000, overdueAmount: 15000, status: 'Overdue', lastPayment: '2023-12-18', nextDue: '2024-01-18' }
    ],
    'EMP006': [
      { id: 'C028', name: 'Rajesh Verma', phone: '9876543237', loanAmount: 590000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-28', nextDue: '2024-02-28' },
      { id: 'C029', name: 'Priya Joshi', phone: '9876543238', loanAmount: 760000, dueAmount: 190000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-29', nextDue: '2024-02-29' },
      { id: 'C030', name: 'Amit Singh', phone: '9876543239', loanAmount: 440000, dueAmount: 110000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-01-09', nextDue: '2024-02-09' }
    ],
    'EMP007': [
      { id: 'C031', name: 'Sunita Patel', phone: '9876543240', loanAmount: 370000, dueAmount: 95000, overdueAmount: 25000, status: 'Overdue', lastPayment: '2023-12-12', nextDue: '2024-01-12' },
      { id: 'C032', name: 'Vikram Nair', phone: '9876543241', loanAmount: 630000, dueAmount: 160000, overdueAmount: 0, status: 'Active', lastPayment: '2024-01-30', nextDue: '2024-02-29' }
    ],
    'EMP008': [
      { id: 'C033', name: 'Kavita Reddy', phone: '9876543242', loanAmount: 550000, dueAmount: 140000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-01-31', nextDue: '2024-02-28' },
      { id: 'C034', name: 'Rohit Sharma', phone: '9876543243', loanAmount: 720000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-01', nextDue: '2024-03-01' },
      { id: 'C035', name: 'Anjali Desai', phone: '9876543244', loanAmount: 460000, dueAmount: 115000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-22', nextDue: '2024-01-22' }
    ],
    'EMP009': [
      { id: 'C036', name: 'Suresh Iyer', phone: '9876543245', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-02', nextDue: '2024-03-02' },
      { id: 'C037', name: 'Deepa Rao', phone: '9876543246', loanAmount: 690000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-03', nextDue: '2024-03-03' }
    ],
    'EMP010': [
      { id: 'C038', name: 'Manish Verma', phone: '9876543247', loanAmount: 510000, dueAmount: 130000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-02-04', nextDue: '2024-03-04' },
      { id: 'C039', name: 'Rajesh Joshi', phone: '9876543248', loanAmount: 740000, dueAmount: 185000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-05', nextDue: '2024-03-05' },
      { id: 'C040', name: 'Priya Singh', phone: '9876543249', loanAmount: 470000, dueAmount: 120000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-02-06', nextDue: '2024-03-06' }
    ],
    'EMP011': [
      { id: 'C041', name: 'Amit Patel', phone: '9876543250', loanAmount: 380000, dueAmount: 95000, overdueAmount: 30000, status: 'Overdue', lastPayment: '2023-12-25', nextDue: '2024-01-25' },
      { id: 'C042', name: 'Sunita Nair', phone: '9876543251', loanAmount: 560000, dueAmount: 140000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-07', nextDue: '2024-03-07' }
    ],
    'EMP012': [
      { id: 'C043', name: 'Vikram Reddy', phone: '9876543252', loanAmount: 600000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-08', nextDue: '2024-03-08' },
      { id: 'C044', name: 'Kavita Sharma', phone: '9876543253', loanAmount: 780000, dueAmount: 195000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-09', nextDue: '2024-03-09' },
      { id: 'C045', name: 'Rohit Desai', phone: '9876543254', loanAmount: 490000, dueAmount: 125000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-02-10', nextDue: '2024-03-10' }
    ]
  }

  // Filter and sort staff data based on search, metric, and filters
  const getFilteredStaffData = (metric) => {
    let filtered = staffLeaderboardBaseData.filter(staff => {
      // Apply search filter
      const matchesSearch = staff.id.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.piCode.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.center.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.district.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.state.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.loanType.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.region.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
        staff.customers.toString().includes(staffSearchTerm) ||
        staff.due.toString().includes(staffSearchTerm) ||
        staff.overdue.toString().includes(staffSearchTerm)
      
      // Apply loan type filter
      const matchesLoanType = filterLoanType === 'All Loans' || 
        (filterLoanType === 'Tractor Finance' && staff.loanType === 'Tractor') ||
        (filterLoanType === 'Commercial Vehicle' && staff.loanType === 'Commercial Vehicle') ||
        (filterLoanType === 'Construction Equipment' && staff.loanType === 'Construction Equipment')
      
      // Apply geography/region filter
      const matchesGeography = filterGeography === 'All Regions' || 
        staff.region === filterGeography
      
      // Apply state filter
      const matchesState = filterState === 'All States' || 
        staff.state === filterState
      
      // Apply district filter
      const matchesDistrict = filterDistrict === 'All Districts' || 
        staff.district === filterDistrict
      
      // Apply PI Code filter
      const matchesPICode = filterPICode === 'All PI Codes' || 
        staff.piCode === filterPICode
      
      // Apply metric-specific filter
      let matchesMetric = true
      if (metric === 'inactive') {
        matchesMetric = staff.efficiency < 50
      }
      
      return matchesSearch && matchesLoanType && matchesGeography && matchesState && matchesDistrict && matchesPICode && matchesMetric
    })

    // Sort based on selected metric and sort order
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch(metric) {
        case 'allocation':
          aValue = a.customers
          bValue = b.customers
          break
        case 'collection':
          aValue = a.efficiency
          bValue = b.efficiency
          break
        case 'ptp':
          // Using efficiency as proxy for PTP rate
          aValue = a.efficiency
          bValue = b.efficiency
          break
        case 'productivity':
          // Using calls + visits as productivity
          aValue = a.calls + a.visits
          bValue = b.calls + b.visits
          break
        default:
          aValue = a[staffSortBy] || a.efficiency
          bValue = b[staffSortBy] || b.efficiency
      }
      
      if (staffSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }

  const filteredStaffData = selectedStaffMetric ? getFilteredStaffData(selectedStaffMetric) : []
  const staffTotalPages = Math.ceil(filteredStaffData.length / staffItemsPerPage)
  const staffStartIndex = (staffCurrentPage - 1) * staffItemsPerPage
  const paginatedStaffData = filteredStaffData.slice(staffStartIndex, staffStartIndex + staffItemsPerPage)

  // Reset page when metric, search, or filters change
  useEffect(() => {
    setStaffCurrentPage(1)
  }, [selectedStaffMetric, staffSearchTerm, staffSortBy, staffSortOrder, filterLoanType, filterDPD, filterGeography, filterState, filterDistrict, filterPICode, fromDate, toDate])

  const handleStaffCardClick = (metric) => {
    if (selectedStaffMetric === metric) {
      setSelectedStaffMetric(null)
    } else {
      setSelectedStaffMetric(metric)
    }
  }

  // Handle customer count click
  const handleCustomerCountClick = (staff) => {
    setSelectedStaff(staff)
    setShowCustomerDetails(true)
    setCustomerCurrentPage(1)
    
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
    setCustomerCurrentPage(1)
  }

  // Reset all filters to default
  const resetFilters = () => {
    setFilterLoanType('All Loans')
    setFilterDPD('All Buckets')
    setFilterGeography('All Regions')
    setFilterState('All States')
    setFilterDistrict('All Districts')
    setFilterPICode('All PI Codes')
    const date = new Date()
    date.setDate(date.getDate() - 30)
    setFromDate(date.toISOString().split('T')[0])
    setToDate(new Date().toISOString().split('T')[0])
  }

  // Customer pagination
  const currentCustomers = selectedStaff ? customerData[selectedStaff.id] || [] : []
  const customerTotalPages = Math.ceil(currentCustomers.length / customerItemsPerPage)
  const customerStartIndex = (customerCurrentPage - 1) * customerItemsPerPage
  const paginatedCustomers = currentCustomers.slice(customerStartIndex, customerStartIndex + customerItemsPerPage)

  // Get card name based on selected metric
  const getCardName = (metric) => {
    const cardNames = {
      'allocation': 'Case Summary',
      'collection': 'Collection Efficiency (%)',
      'ptp': 'PTP Conversion Rate (%)',
      'productivity': 'Staff Productivity Index',
      'inactive': 'Inactive/Non-performing Staff'
    }
    return cardNames[metric] || 'Staff Performance Leaderboard'
  }


  const currentData = staffData[activeTab]

  // Transform API collection graph data to chart format
  const transformCollectionGraphData = () => {
    if (!collectionGraphData?.day || !Array.isArray(collectionGraphData.day) || collectionGraphData.day.length === 0) {
      console.log('No collection graph data available')
      return null
    }

    // Sort data by date to ensure chronological order
    const sortedData = [...collectionGraphData.day].sort((a, b) => {
      return new Date(a.date) - new Date(b.date)
    })

    console.log('Transforming collection graph data, total items:', sortedData.length)

    // Convert API data (collection_amount_cr in crores) to chart format (value in rupees)
    const transformedData = sortedData.map((item) => {
      const date = new Date(item.date)
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const dayName = dayNames[date.getDay()]
      
      // Convert crores to rupees (multiply by 10000000)
      const valueInRupees = (item.collection_amount_cr || 0) * 10000000
      
      // Format the label - show day name, date number and month (e.g., "Mon 1 Oct", "Tue 2 Oct")
      // For better readability, show: "1 Oct" or "Mon 1" based on data density
      const dateNumber = date.getDate()
      const monthName = monthNames[date.getMonth()]
      
      // Use compact format: "1 Oct" for clarity, or "Mon 1" if many data points
      const label = sortedData.length > 15 
        ? `${dateNumber} ${monthName}` 
        : `${dayName} ${dateNumber} ${monthName}`
      
      return {
        day: label, // Use formatted label with day name, date and month
        date: item.date, // Keep original date for reference
        value: valueInRupees,
        height: '60%' // Will be calculated based on max value
      }
    })

    // Calculate height percentages based on max value
    if (transformedData.length > 0) {
      const maxValue = Math.max(...transformedData.map(d => d.value), 1)
      transformedData.forEach(item => {
        item.height = `${Math.round((item.value / maxValue) * 100)}%`
      })
      console.log('Transformed data sample:', transformedData.slice(0, 3))
      console.log('Max value:', maxValue, 'rupees')
    }

    return transformedData
  }

  const apiFtdData = transformCollectionGraphData()

  // Chart data for different filter ranges (values in Rupees - will be formatted to Lacs/Crores in chart)
  const chartData = {
    ftd: {
      title: 'Collection Trend (For the Day)',
      data: apiFtdData || [
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

  // Helper function to render Product Summary table
  const renderProductSummaryTable = () => {
    const productData = [
      { product: 'TW', total: 9275, dtr: 6334, agtl: 740, tc: 1445, ncm: 414, acm: 26, tce: 782, cm: 38, rcm: 0 },
      { product: 'MSME', total: 1308, dtr: 194, agtl: 159, tc: 4, ncm: 921, acm: 79, tce: 0, cm: 8, rcm: 0 },
      { product: 'EL', total: 1231, dtr: 655, agtl: 189, tc: 2, ncm: 132, acm: 253, tce: 0, cm: 0, rcm: 0 },
      { product: 'ORL', total: 678, dtr: 9, agtl: 431, tc: 2, ncm: 280, acm: 7, tce: 0, cm: 11, rcm: 1 },
      { product: 'PL', total: 634, dtr: 292, agtl: 264, tc: 0, ncm: 0, acm: 28, tce: 0, cm: 49, rcm: 1 },
      { product: 'HL', total: 386, dtr: 259, agtl: 29, tc: 3, ncm: 61, acm: 28, tce: 0, cm: 6, rcm: 0 },
      { product: 'LAP', total: 333, dtr: 168, agtl: 38, tc: 1, ncm: 72, acm: 33, tce: 0, cm: 21, rcm: 0 },
      { product: 'AL', total: 77, dtr: 29, agtl: 11, tc: 0, ncm: 16, acm: 34, tce: 0, cm: 2, rcm: 0 },
      { product: 'CV', total: 10, dtr: 5, agtl: 0, tc: 0, ncm: 2, acm: 1, tce: 0, cm: 2, rcm: 0 },
      { product: 'CE', total: 4, dtr: 4, agtl: 0, tc: 0, ncm: 0, acm: 0, tce: 0, cm: 0, rcm: 0 }
    ]
    const totals = productData.reduce((acc, row) => ({
      total: acc.total + row.total,
      dtr: acc.dtr + row.dtr,
      agtl: acc.agtl + row.agtl,
      tc: acc.tc + row.tc,
      ncm: acc.ncm + row.ncm,
      acm: acc.acm + row.acm,
      tce: acc.tce + row.tce,
      cm: acc.cm + row.cm,
      rcm: acc.rcm + row.rcm
    }), { total: 0, dtr: 0, agtl: 0, tc: 0, ncm: 0, acm: 0, tce: 0, cm: 0, rcm: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Product Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">PRODUCT</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">DTR</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">AGTL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TC</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NCM</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">ACM</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TCE</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">CM</th>
                <th className="text-right py-2 px-2 font-semibold">RCM</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {productData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.product}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.dtr)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.agtl)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.tc)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.ncm)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.acm)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.tce)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.cm)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.rcm)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.dtr)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.agtl)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.tc)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.ncm)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.acm)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.tce)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.cm)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.rcm)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render Product Allocation Summary table
  const renderProductAllocationTable = () => {
    const allocationData = [
      { product: 'TW', total: 9275, npa: 5631, sma0: 2241, sma1: 892, sma2: 511 },
      { product: 'MSME', total: 1308, npa: 1187, sma0: 38, sma1: 22, sma2: 61 },
      { product: 'EL', total: 1231, npa: 1183, sma0: 22, sma1: 12, sma2: 14 },
      { product: 'ORL', total: 678, npa: 649, sma0: 12, sma1: 9, sma2: 8 },
      { product: 'PL', total: 634, npa: 266, sma0: 264, sma1: 53, sma2: 51 },
      { product: 'HL', total: 386, npa: 128, sma0: 87, sma1: 93, sma2: 78 },
      { product: 'LAP', total: 333, npa: 118, sma0: 96, sma1: 61, sma2: 58 },
      { product: 'AL', total: 77, npa: 28, sma0: 42, sma1: 4, sma2: 3 },
      { product: 'CV', total: 10, npa: 9, sma0: 1, sma1: 0, sma2: 0 },
      { product: 'CE', total: 4, npa: 4, sma0: 0, sma1: 0, sma2: 0 }
    ]
    const totals = allocationData.reduce((acc, row) => ({
      total: acc.total + row.total,
      npa: acc.npa + row.npa,
      sma0: acc.sma0 + row.sma0,
      sma1: acc.sma1 + row.sma1,
      sma2: acc.sma2 + row.sma2
    }), { total: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Product Allocation Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">PRODUCT</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NPA</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {allocationData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.product}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.npa)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma1)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.npa)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma0)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma1)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render NCM Allocation Summary table
  const renderNCMAllocationTable = () => {
    const ncmData = [
      { username: 'Francis', total: 1082, npa: 1034, sma0: 0, sma1: 4, sma2: 44 },
      { username: 'MATHEW', total: 432, npa: 432, sma0: 0, sma1: 0, sma2: 0 },
      { username: 'NAIMATULLAH', total: 280, npa: 271, sma0: 9, sma1: 0, sma2: 0 },
      { username: 'Swapnil', total: 104, npa: 62, sma0: 29, sma1: 4, sma2: 9 }
    ]
    const totals = ncmData.reduce((acc, row) => ({
      total: acc.total + row.total,
      npa: acc.npa + row.npa,
      sma0: acc.sma0 + row.sma0,
      sma1: acc.sma1 + row.sma1,
      sma2: acc.sma2 + row.sma2
    }), { total: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">NCM Allocation Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">Username</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NPA</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {ncmData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.username}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.npa)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma1)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.npa)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma0)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma1)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render RCM Allocation Summary table
  const renderRCMAllocationTable = () => {
    const rcmData = [
      { username: 'SATHEESH', total: 2, npa: 1, sma0: 0, sma1: 1, sma2: 0 }
    ]
    const totals = rcmData.reduce((acc, row) => ({
      total: acc.total + row.total,
      npa: acc.npa + row.npa,
      sma0: acc.sma0 + row.sma0,
      sma1: acc.sma1 + row.sma1,
      sma2: acc.sma2 + row.sma2
    }), { total: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">RCM Allocation Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">Username</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NPA</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rcmData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.username}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.npa)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma1)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.npa)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma0)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma1)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render ACM Allocation Summary table
  const renderACMAllocationTable = () => {
    const acmData = [
      { username: 'Kessavathamaraiselvan', total: 335, npa: 327, sma0: 3, sma1: 4, sma2: 1 },
      { username: 'Nikitha', total: 64, npa: 0, sma0: 64, sma1: 0, sma2: 0 },
      { username: 'Anand', total: 37, npa: 15, sma0: 17, sma1: 2, sma2: 3 },
      { username: 'NISANTH', total: 12, npa: 11, sma0: 0, sma1: 1, sma2: 0 },
      { username: 'Gousemohiddin', total: 11, npa: 11, sma0: 0, sma1: 0, sma2: 0 },
      { username: 'Arumugam', total: 6, npa: 6, sma0: 0, sma1: 0, sma2: 0 },
      { username: 'Gaurav Kumar', total: 6, npa: 2, sma0: 4, sma1: 0, sma2: 0 },
      { username: 'JOSEPH', total: 4, npa: 1, sma0: 1, sma1: 0, sma2: 2 },
      { username: 'Ashok', total: 4, npa: 3, sma0: 1, sma1: 0, sma2: 0 },
      { username: 'JOHN', total: 3, npa: 0, sma0: 3, sma1: 0, sma2: 0 }
    ]
    const totals = acmData.reduce((acc, row) => ({
      total: acc.total + row.total,
      npa: acc.npa + row.npa,
      sma0: acc.sma0 + row.sma0,
      sma1: acc.sma1 + row.sma1,
      sma2: acc.sma2 + row.sma2
    }), { total: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">ACM Allocation Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">Username</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NPA</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {acmData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.username}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.npa)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma1)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.npa)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma0)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma1)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render CM Allocation Summary table
  const renderCMAllocationTable = () => {
    const cmData = [
      { username: 'ALTHAF', total: 207, npa: 206, sma0: 0, sma1: 1, sma2: 0 },
      { username: 'Vishnu', total: 142, npa: 139, sma0: 0, sma1: 1, sma2: 2 },
      { username: 'Dipak', total: 83, npa: 10, sma0: 61, sma1: 9, sma2: 3 },
      { username: 'Varun', total: 63, npa: 8, sma0: 44, sma1: 5, sma2: 6 },
      { username: 'Girish', total: 60, npa: 31, sma0: 22, sma1: 3, sma2: 4 },
      { username: 'Akash', total: 44, npa: 2, sma0: 42, sma1: 0, sma2: 0 },
      { username: 'Manuprasad', total: 39, npa: 5, sma0: 24, sma1: 4, sma2: 6 },
      { username: 'Vinoth', total: 36, npa: 33, sma0: 0, sma1: 0, sma2: 3 },
      { username: 'SAI KUMAR', total: 33, npa: 15, sma0: 13, sma1: 4, sma2: 1 },
      { username: 'MANTHA', total: 31, npa: 7, sma0: 15, sma1: 5, sma2: 4 }
    ]
    const totals = cmData.reduce((acc, row) => ({
      total: acc.total + row.total,
      npa: acc.npa + row.npa,
      sma0: acc.sma0 + row.sma0,
      sma1: acc.sma1 + row.sma1,
      sma2: acc.sma2 + row.sma2
    }), { total: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">CM Allocation Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">Username</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NPA</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {cmData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.username}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.npa)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma1)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.npa)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma0)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma1)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render AGTL Allocation Summary table
  const renderAGTLAllocationTable = () => {
    const agtlData = [
      { username: 'NIKHIL', total: 279, npa: 270, sma0: 0, sma1: 4, sma2: 5 },
      { username: 'JOBY', total: 194, npa: 139, sma0: 29, sma1: 13, sma2: 13 },
      { username: 'N', total: 192, npa: 191, sma0: 0, sma1: 1, sma2: 0 },
      { username: 'A', total: 186, npa: 89, sma0: 48, sma1: 30, sma2: 19 },
      { username: 'SHINOJ', total: 184, npa: 184, sma0: 0, sma1: 0, sma2: 0 },
      { username: 'VINOD', total: 151, npa: 131, sma0: 7, sma1: 9, sma2: 4 },
      { username: 'NATARAJAN', total: 130, npa: 125, sma0: 0, sma1: 3, sma2: 2 },
      { username: 'MUMMADI', total: 111, npa: 99, sma0: 4, sma1: 2, sma2: 6 },
      { username: 'VENKATESH KUMAR', total: 110, npa: 109, sma0: 1, sma1: 0, sma2: 0 },
      { username: 'SANOOP', total: 97, npa: 97, sma0: 0, sma1: 0, sma2: 0 }
    ]
    const totals = agtlData.reduce((acc, row) => ({
      total: acc.total + row.total,
      npa: acc.npa + row.npa,
      sma0: acc.sma0 + row.sma0,
      sma1: acc.sma1 + row.sma1,
      sma2: acc.sma2 + row.sma2
    }), { total: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
          <h3 className="text-sm font-semibold">AGTL Allocation Summary</h3>
          <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-red-600 text-white sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold border-r border-red-500">Username</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">NPA</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold border-r border-red-500">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {agtlData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium border-r border-gray-200">{row.username}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.total)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.npa)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700 border-r border-gray-200">{formatIndianNumber(row.sma1)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2)}</td>
                </tr>
              ))}
              <tr className="bg-red-600 text-white font-semibold">
                <td className="py-2 px-2 border-r border-red-500">Totals</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.total)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.npa)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma0)}</td>
                <td className="py-2 px-2 text-right border-r border-red-500">{formatIndianNumber(totals.sma1)}</td>
                <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  console.log('dashboardData', dashboardData?.loan_data?.total_loans)

  return (
    <div className="h-screen font-['Montserrat'] flex" style={{background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'}}>
      <style>{`
        .card-with-wave {
          position: relative;
          overflow: hidden;
        }
        .card-with-wave.expanded {
          overflow: visible;
          z-index: 40;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .card-with-wave::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 15%;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .card-with-wave.expanded::after {
          height: 10%;
        }
        .card-with-wave-thin::after {
          height: 8%;
        }
        .card-with-wave-thin.expanded::after {
          height: 6%;
        }
        .card-wave-indigo::after { background-color: #003366; }
        .card-wave-blue::after { background-color: #2196F3; }
        .card-wave-green::after { background-color: #4CAF50; }
        .card-wave-orange::after { background-color: #F04E23; }
        .card-wave-red::after { background-color: #D32F2F; }
        .card-wave-purple::after { background-color: #1976D2; }
        .card-wave-gray::after { background-color: #333333; }
        .card-wave-staff::after { background-color: #DC2626; }
        .card-wave-engagement::after { background-color: #2196F3; }
        .card-wave-payment::after { background-color: #003366; }
      `}</style>
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
      
      <div ref={mainContentRef} className="flex flex-col overflow-hidden flex-1 relative">
        {/* Navbar */}
        <Navbar 
          onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          isSidebarCollapsed={isSidebarCollapsed}
          onBellClick={() => setShowAlerts(!showAlerts)}
        />

        {/* Loading Overlay */}
        {dashboardLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div 
              className="w-16 h-16 border-4 border-blue-600 animate-spin" 
              style={{
                borderRadius: '0',
                borderTopColor: '#2563eb',
                borderRightColor: '#2563eb',
                borderBottomColor: '#2563eb',
                borderLeftColor: '#2563eb'
              }}
            ></div>
          </div>
        )}

        {/* Error Message */}
        {dashboardError && !dashboardLoading && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Error Loading Dashboard</p>
                <p className="text-sm mt-1">{dashboardError}</p>
              </div>
              <button
                onClick={() => {
                  setDashboardError(null)
                  setDashboardData(null)
                  isFetchingRef.current = false
                  const fetchDashboardData = async () => {
                    if (!user?.accessToken) return
                    isFetchingRef.current = true
                    try {
                      setDashboardLoading(true)
                      setDashboardError(null)
                      const data = await dashboardApi(user.accessToken)
                      setDashboardData(data)
                    } catch (error) {
                      setDashboardError(error.message || 'Failed to fetch dashboard data')
                    } finally {
                      setDashboardLoading(false)
                      isFetchingRef.current = false
                    }
                  }
                  fetchDashboardData()
                }}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
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
          <div className="bg-gray-100 min-h-screen">
            <div className="flex gap-4 p-4">
              {/* Left Side - Filters and Delegation Tracking */}
              <div className="w-64 flex-shrink-0 space-y-4" ref={filtersRef}>
                {/* Section 1: Filters */}
                <div className="bg-gray-50 border-l-4 border-l-red-600 border-t border-r border-b border-gray-200 rounded-lg p-4 h-fit">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-red-600">Filters</h3>
                    <button
                      onClick={resetFilters}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer p-1 rounded"
                      title="Reset all filters"
                      aria-label="Reset filters"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type of Loan</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        value={filterLoanType}
                        onChange={(e) => setFilterLoanType(e.target.value)}
                      >
                        <option>All Loans</option>
                        <option>Tractor Finance</option>
                        <option>Commercial Vehicle</option>
                        <option>Construction Equipment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">DPD Buckets</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        value={filterDPD}
                        onChange={(e) => setFilterDPD(e.target.value)}
                      >
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
                      <input 
                        type="date" 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors" 
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors" 
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Geography</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        value={filterGeography}
                        onChange={(e) => setFilterGeography(e.target.value)}
                      >
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
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                      >
                        <option>All States</option>
                        <option>Maharashtra</option>
                        <option>Karnataka</option>
                        <option>Tamil Nadu</option>
                        <option>Gujarat</option>
                        <option>Delhi</option>
                        <option>West Bengal</option>
                        <option>Kerala</option>
                        <option>Telangana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                      >
                        <option>All Districts</option>
                        <option>Mumbai</option>
                        <option>Pune</option>
                        <option>Bangalore</option>
                        <option>Chennai</option>
                        <option>Delhi</option>
                        <option>Kolkata</option>
                        <option>Ahmedabad</option>
                        <option>Kochi</option>
                        <option>Hyderabad</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">PI Code</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                        value={filterPICode}
                        onChange={(e) => setFilterPICode(e.target.value)}
                      >
                        <option>All PI Codes</option>
                        <option>PI001</option>
                        <option>PI002</option>
                        <option>PI003</option>
                        <option>PI004</option>
                        <option>PI005</option>
                        <option>PI006</option>
                        <option>PI007</option>
                        <option>PI008</option>
                        <option>PI009</option>
                        <option>PI010</option>
                        <option>PI011</option>
                        <option>PI012</option>
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
                              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">

               <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                          <div className="text-green-800 text-xs font-semibold">Outstanding Value per Collector</div>
                          <div className="text-green-600 text-xs mt-1">Avg: ₹2.1Cr</div>
                          <div className="text-green-600 text-xs">Max: ₹3.2Cr</div>
                          </div>
                          </div>
            </div>

              {/* Right Side - Main Content */}
              <div className="flex-1 min-w-0">
                {/* Favorites Section */}
                {favoriteCards.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      ⭐ Favorites ({favoriteCards.length})
                    </h2>
                    <div className="grid grid-cols-5 gap-3">
                      {favoriteCards.map(cardId => {
                        const card = allCards.find(c => c.id === cardId)
                        if (!card) return null
                        
                        // Render different cards based on their ID
                        if (cardId === 'allocation') {
                          return (
                            <div key={cardId} className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg card-with-wave card-wave-staff">
                              <div className="text-xs text-gray-800 relative z-10">Allocation Summary</div>
                              <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>1,245</div>
                              {renderFavoritePin('allocation')}
                            </div>
                          )
                        } else if (cardId === 'collection') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg card-with-wave card-wave-staff">
                              <div className="text-xs text-gray-800 relative z-10">Collection Efficiency (%)</div>
                              <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>86.4%</div>
                              {renderFavoritePin('collection')}
                            </div>
                          )
                        } else if (cardId === 'ptp') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg card-with-wave card-wave-staff">
                              <div className="text-xs text-gray-800 relative z-10">PTP Conversion Rate (%)</div>
                              <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>72.3%</div>
                              {renderFavoritePin('ptp')}
                            </div>
                          )
                        } else if (cardId === 'productivity') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg card-with-wave card-wave-staff">
                              <div className="text-xs text-gray-800 relative z-10">Staff Productivity Index</div>
                              <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>156</div>
                              {renderFavoritePin('productivity')}
                            </div>
                          )
                        } else if (cardId === 'inactive') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg card-with-wave card-wave-staff">
                              <div className="text-xs text-gray-800 relative z-10">Inactive/Non-performing Staff</div>
                              <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>3</div>
                              {renderFavoritePin('inactive')}
                            </div>
                          )
                        } else if (cardId === 'whatsapp') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-engagement">
                              {renderFavoritePin('whatsapp')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">WhatsApp Engagements</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Messages Sent</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>1,245</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Delivered</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>1,180</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'aiCalls') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-engagement">
                              {renderFavoritePin('aiCalls')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">AI Calls</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Calls Triggered</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>2,100</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Answered</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>1,580</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'dialler') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-engagement">
                              {renderFavoritePin('dialler')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Dialler Calls</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Total Calls</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>1,850</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Successful Connects</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>1,340</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'fieldVisits') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-engagement">
                              {renderFavoritePin('fieldVisits')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Field Visits</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Planned Visits</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>156</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Completed Visits</span>
                                  <span className="font-semibold" style={{color: '#2196F3'}}>122</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'overdue') {
                          return (
                            <div key={cardId} className="bg-white  rounded-lg p-3 shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('overdue')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Overdue Accounts</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Customer Count</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>45</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Amount</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>₹1.25Cr</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'promised') {
                          return (
                            <div key={cardId} className="bg-white  rounded-lg p-3 shadow-lg relative col-span-2 card-with-wave card-wave-payment">
                              {renderFavoritePin('promised')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Promised to Pay</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex flex-row justify-between text-xs text-gray-800">
                                  <span># Todays PTP</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>23</span>
                                  <span># Future PTP</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>890</span>
                                </div>
                                <div className="flex flex-row justify-between text-xs text-gray-800">
                                  <span># Failed PTP</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>234</span>
                                  <span># Total PTP</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>1120</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'refused') {
                          return (
                            <div key={cardId} className="bg-white  rounded-lg p-3 shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('refused')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Refused to Pay</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span># Customers</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>67</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Pending Amount</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>₹34L</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'paid') {
                          return (
                            <div key={cardId} className="bg-white  rounded-lg p-3 shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('paid')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Already Paid</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span># Customers</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>189</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Collected Amount</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>₹56L</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'broken') {
                          return (
                            <div key={cardId} className="bg-white  rounded-lg p-3 shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('broken')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Broken Promises</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span># Customers</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>89</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Broken Amount</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>₹28L</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'wrong') {
                          return (
                            <div key={cardId} className="bg-white  rounded-lg p-3 shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('wrong')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Wrong Numbers / Unreachable</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Count of Invalid Contacts</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>156</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Status</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>Data Correction</span>
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
                <div className="mb-8 w-full">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Staff Monitoring</h2>
                  <div className="grid grid-cols-5 gap-3 relative w-full">
                    {/* Allocation Summary Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff ${expandedCard === 'allocation' ? 'expanded min-h-[170px] pb-4' : 'h-20'} ${selectedStaffMetric === 'allocation' ? 'ring-2 ring-red-600 shadow-lg' : ''}`}
                      onMouseEnter={() => setExpandedCard('allocation')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('allocation')
                      }}
                    >
                      {renderFavoritePin('allocation')}
                      {expandedCard === 'allocation' ? (
                        <div className="relative z-10 mb-2">
                          <div className="text-xs text-gray-800">Allocation Summary</div>
                          <div className="text-lg font-bold" style={{color: '#DC2626'}}>{formatIndianNumber(dashboardData?.loan_data?.total_loans)}</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Active Accounts:</span>
                              <span style={{color: '#DC2626'}}>{formatIndianNumber(dashboardData?.loan_data?.total_loans)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Total Staff:</span>
                              <span style={{color: '#DC2626'}}>{dashboardData?.loan_data?.unique_staff}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Per Staff Avg:</span>
                              <span style={{color: '#DC2626'}}>{dashboardData?.loan_data?.avg_loans_per_staff} %</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Outstanding Value:</span>
                              <span style={{color: '#DC2626'}}>{dashboardData?.loan_data?.total_tos_in_cr} Cr</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Unallocated Cases:</span>
                              <span style={{color: '#DC2626'}}>23</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-800 relative z-10">Case Summary</div>
                          <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>{formatIndianNumber(dashboardData?.loan_data?.total_loans)}</div>
                        </>
                      )}
                    </div>

                    {/* Collection Efficiency Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff ${expandedCard === 'collection' ? 'expanded min-h-[160px] pb-4' : 'h-20'} ${selectedStaffMetric === 'collection' ? 'ring-2 ring-red-600 shadow-lg' : ''}`}
                      onMouseEnter={() => setExpandedCard('collection')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('collection')
                      }}
                    >
                      {renderFavoritePin('collection')}
                      {expandedCard === 'collection' ? (
                        <div className="relative z-10 mb-2">
                          <div className="text-xs text-gray-800">Collection Efficiency (%)</div>
                          <div className="text-lg font-bold" style={{color: '#DC2626'}}>{dashboardData?.collection_data?.collection_percentage}%</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Amount Collected:</span>
                              <span style={{color: '#DC2626'}}>{dashboardData?.collection_data?.collection_amount_cr} Cr</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Total Due:</span>
                              <span style={{color: '#DC2626'}}>{dashboardData?.collection_data?.total_overdue_cr} Cr</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Difference:</span>
                              <span style={{color: '#DC2626'}}>{dashboardData?.collection_data?.collection_amount_cr - dashboardData?.collection_data?.total_overdue_cr} Cr</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-800 relative z-10">Collection Efficiency (%)</div>
                          <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>{dashboardData?.collection_data?.collection_percentage}%</div>
                        </>
                      )}
                    </div>

                    {/* PTP Conversion Rate Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff ${expandedCard === 'ptp' ? 'expanded min-h-[160px] pb-4' : 'h-20'} ${selectedStaffMetric === 'ptp' ? 'ring-2 ring-red-600 shadow-lg' : ''}`}
                      onMouseEnter={() => setExpandedCard('ptp')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('ptp')
                      }}
                    >
                      {renderFavoritePin('ptp')}
                      {expandedCard === 'ptp' ? (
                        <div className="relative z-10 mb-2">
                          <div className="text-xs text-gray-800">PTP Conversion Rate (%)</div>
                          <div className="text-lg font-bold" style={{color: '#DC2626'}}>72.3%</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>PTPs Fulfilled:</span>
                              <span style={{color: '#DC2626'}}>234</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Total PTPs:</span>
                              <span style={{color: '#DC2626'}}>324</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Pending:</span>
                              <span style={{color: '#DC2626'}}>90</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-800 relative z-10">PTP Conversion Rate (%)</div>
                          <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>72.3%</div>
                        </>
                      )}
                    </div>

                    {/* Staff Productivity Index Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff ${expandedCard === 'productivity' ? 'expanded min-h-[160px] pb-4' : 'h-20'} ${selectedStaffMetric === 'productivity' ? 'ring-2 ring-red-600 shadow-lg' : ''}`}
                      onMouseEnter={() => setExpandedCard('productivity')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('productivity')
                      }}
                    >
                      {renderFavoritePin('productivity')}
                      {expandedCard === 'productivity' ? (
                        <div className="relative z-10 mb-2">
                          <div className="text-xs text-gray-800">Staff Productivity Index</div>
                          <div className="text-lg font-bold" style={{color: '#DC2626'}}>156</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Total Calls:</span>
                              <span style={{color: '#DC2626'}}>1,245</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Total Visits:</span>
                              <span style={{color: '#DC2626'}}>89</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Weight:</span>
                              <span style={{color: '#DC2626'}}>1.2x</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-800 relative z-10">Staff Productivity Index</div>
                          <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>156</div>
                        </>
                      )}
                    </div>

                    {/* Inactive/Non-performing Staff Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 relative cursor-pointer transition-all duration-300 card-with-wave card-wave-staff ${expandedCard === 'inactive' ? 'expanded min-h-[190px] pb-4' : 'h-20'} ${selectedStaffMetric === 'inactive' ? 'ring-2 ring-red-600 shadow-lg' : ''}`}
                      onMouseEnter={() => setExpandedCard('inactive')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('inactive')
                      }}
                    >
                      {renderFavoritePin('inactive')}
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold z-20 shadow-sm">3</div>
                      {expandedCard === 'inactive' ? (
                        <div className="relative z-10 mb-2">
                          <div className="text-xs text-gray-800">Inactive/Non-performing Staff</div>
                          <div className="text-lg font-bold" style={{color: '#DC2626'}}>3</div>
                          <div className="text-xs text-gray-800">0 calls or 0 visits</div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Ramesh K.</span>
                              <span style={{color: '#DC2626'}}>(0 calls)</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Priya S.</span>
                              <span style={{color: '#DC2626'}}>(0 visits)</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-800">
                              <span>Ankit M.</span>
                              <span style={{color: '#DC2626'}}>(0 both)</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs text-gray-800 relative z-10">Inactive/Non-performing Staff</div>
                          <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>3</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Allocation Tables - Show when allocation card is clicked */}
                {selectedStaffMetric === 'allocation' && (
                  <div ref={leaderboardTableRef} className="mb-8 w-full space-y-6">
                    {/* Header with Title and Close Button */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Case Summary - Allocation Details</h2>
                      <button
                        onClick={() => setSelectedStaffMetric(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close allocation tables"
                      >
                        Close
                      </button>
                    </div>

                    {/* Grid of Tables - 2 columns on large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Product Summary Table */}
                      <div className="lg:col-span-2">
                        {renderProductSummaryTable()}
                      </div>
                      
                      {/* Product Allocation Summary Table */}
                      <div className="lg:col-span-2">
                        {renderProductAllocationTable()}
                      </div>
                      
                      {/* NCM Allocation Summary Table */}
                      <div>
                        {renderNCMAllocationTable()}
                      </div>
                      
                      {/* RCM Allocation Summary Table */}
                      <div>
                        {renderRCMAllocationTable()}
                      </div>
                      
                      {/* ACM Allocation Summary Table */}
                      <div>
                        {renderACMAllocationTable()}
                      </div>
                      
                      {/* CM Allocation Summary Table */}
                      <div>
                        {renderCMAllocationTable()}
                      </div>
                      
                      {/* AGTL Allocation Summary Table */}
                      <div className="lg:col-span-2">
                        {renderAGTLAllocationTable()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff Performance Leaderboard Table - Show for other metrics */}
                {selectedStaffMetric && selectedStaffMetric !== 'allocation' && (
                  <div ref={leaderboardTableRef} className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full" style={{ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                    {/* Header with Title and Close Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <h2 className="text-xl font-semibold text-gray-900">{getCardName(selectedStaffMetric)}</h2>
                      
                      {/* Search and Filter Controls */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Search by ID, Name, PI Code, Center, District, State, Loan Type, Customers, Due, Overdue..."
                          value={staffSearchTerm}
                          onChange={(e) => setStaffSearchTerm(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <select
                          value={staffSortBy}
                          onChange={(e) => setStaffSortBy(e.target.value)}
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
                          value={staffSortOrder}
                          onChange={(e) => setStaffSortOrder(e.target.value)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </select>
                        <button
                          onClick={() => setSelectedStaffMetric(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                          aria-label="Close leaderboard"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable Table Container - Horizontal Scroll Only */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ maxWidth: '100%' }}>
                      <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
                        <table className="w-full text-sm" style={{ tableLayout: 'auto', width: '100%' }}>
                          <thead>
                            <tr className="text-gray-600 border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Emp ID</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Name</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Hierarchy</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">PI Code</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Center</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">District</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">State</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Loan Type</th>
                              <th className="text-left py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Region</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Customers</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Due</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Overdue</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Calls</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Visits</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Collected</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Efficiency</th>
                              <th className="text-right py-4 px-3 font-semibold bg-gray-50 whitespace-nowrap">Escalations</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            {paginatedStaffData.length === 0 ? (
                              <tr>
                                <td colSpan="16" className="py-8 text-center text-gray-500">
                                  No staff data found
                                </td>
                              </tr>
                            ) : (
                              paginatedStaffData.map((staff) => (
                                <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-3 font-mono text-xs text-left whitespace-nowrap">{staff.id}</td>
                                  <td className="py-3 px-3 font-medium text-left whitespace-nowrap">{staff.name}</td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      staff.hierarchy === 'Supervisor' ? 'bg-purple-100 text-purple-800' :
                                      staff.hierarchy === 'Senior Executive' ? 'bg-blue-100 text-blue-800' :
                                      staff.hierarchy === 'Executive' ? 'bg-green-100 text-green-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {staff.hierarchy}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap font-mono text-xs">{staff.piCode}</td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap">{staff.center}</td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap">{staff.district}</td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap">{staff.state}</td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                                      staff.loanType === 'Tractor' ? 'bg-orange-100 text-orange-800' :
                                      staff.loanType === 'Commercial Vehicle' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {staff.loanType}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-left whitespace-nowrap">{staff.region}</td>
                                  <td className="py-3 px-3 text-right font-medium whitespace-nowrap">
                                    <button 
                                      data-customer-count-button
                                      onClick={() => handleCustomerCountClick(staff)}
                                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    >
                                      {staff.customers}
                                    </button>
                                  </td>
                                  <td className="py-3 px-3 text-right font-medium whitespace-nowrap">₹{(staff.due / 100000).toFixed(1)}L</td>
                                  <td className="py-3 px-3 text-right font-medium whitespace-nowrap">₹{(staff.overdue / 100000).toFixed(1)}L</td>
                                  <td className="py-3 px-3 text-right whitespace-nowrap">{staff.calls}</td>
                                  <td className="py-3 px-3 text-right whitespace-nowrap">{staff.visits}</td>
                                  <td className="py-3 px-3 text-right font-medium whitespace-nowrap">₹{(staff.collected / 100000).toFixed(1)}L</td>
                                  <td className="py-3 px-3 text-right whitespace-nowrap">
                                    <span className={`font-semibold ${
                                      staff.efficiency >= 90 ? 'text-green-600' :
                                      staff.efficiency >= 70 ? 'text-orange-600' :
                                      'text-red-600'
                                    }`}>
                                      {staff.efficiency}%
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      staff.escalations === 0 ? 'bg-green-100 text-green-800' :
                                      staff.escalations <= 2 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {staff.escalations}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {staffStartIndex + 1} to {Math.min(staffStartIndex + staffItemsPerPage, filteredStaffData.length)} of {filteredStaffData.length} entries
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setStaffCurrentPage(Math.max(1, staffCurrentPage - 1))}
                          disabled={staffCurrentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Previous
                        </button>
                        {Array.from({ length: staffTotalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setStaffCurrentPage(page)}
                            className={`px-4 py-2 border rounded-lg text-sm transition-colors cursor-pointer ${
                              staffCurrentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setStaffCurrentPage(Math.min(staffTotalPages, staffCurrentPage + 1))}
                          disabled={staffCurrentPage === staffTotalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Details Table */}
                {showCustomerDetails && selectedStaff && (
                  <div 
                    ref={customerDetailsRef} 
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6 w-full"
                    style={{
                      animation: 'fadeIn 0.3s ease-in-out',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      boxSizing: 'border-box'
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

                {/* Customer Engagement */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Engagement</h2>
                  <div className="grid grid-cols-4 gap-3">
                    <div 
                      className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('whatsapp')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">WhatsApp Engagements</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Messages Sent</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Delivered</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Read</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Responded</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('aiCalls')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">AI Calls</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Calls Triggered</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Answered</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Positive Response</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('dialler')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Dialler Calls</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Calls</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Successful Connects</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Follow-up Actions</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                    </div>
                  </div>

                    <div 
                      className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement"
                      onClick={() => navigate('/customer-engagement')}
                    >
                      {renderFavoritePin('fieldVisits')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Field Visits</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Planned Visits</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Completed Visits</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Geo-tagging Compliance</span>
                          <span className="font-semibold" style={{color: '#2196F3'}}>0</span>
                        </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Payment Intent & Behavior */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Intent & Behavior</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="group bg-white rounded-lg p-3 relative card-with-wave card-with-wave-thin card-wave-payment">
                      {renderFavoritePin('overdue')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Overdue Accounts</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Customer Count</span>
                          <span className="font-semibold" style={{color: '#003366'}}>45</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Amount</span>
                          <span className="font-semibold" style={{color: '#003366'}}>₹1.25Cr</span>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white rounded-lg p-3 relative card-with-wave card-with-wave-thin card-wave-payment">
                      {renderFavoritePin('promised')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Promised to Pay</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex flex-row justify-between text-xs text-gray-800">
                          <span># Todays PTP</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>

                          
                          <span># Future PTP</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        
                        </div>
                       <div className="flex flex-row justify-between text-xs text-gray-800">
                          <span># Failed PTP</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>

                          
                          <span># Total PTP</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white rounded-lg p-3 relative card-with-wave card-with-wave-thin card-wave-payment">
                      {renderFavoritePin('refused')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Refused to Pay</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span># Customers</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Pending Amount</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white rounded-lg p-3 relative card-with-wave card-with-wave-thin card-wave-payment">
                      {renderFavoritePin('paid')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Already Paid</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span># Customers</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Collected Amount</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white rounded-lg p-3 relative card-with-wave card-with-wave-thin card-wave-payment">
                      {renderFavoritePin('broken')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Broken Promises</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span># Customers</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Broken Amount</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                    </div>
                  </div>

                    <div className="group bg-white rounded-lg p-3 relative card-with-wave card-with-wave-thin card-wave-payment">
                      {renderFavoritePin('wrong')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Wrong Numbers / Unreachable</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Count of Invalid Contacts</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Status</span>
                          <span className="font-semibold" style={{color: '#003366'}}>Data Correction</span>
                        </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Charts and Right Panel Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {/* Left Side - Charts */}
                  <div className="col-span-2 space-y-4">
                     {/* Collection Trend Chart */}
                     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-1 relative">
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

                    
          </div>

                  {/* Right Side - Alerts and Actions */}
                  <div className="space-y-4">
                    {/* Section 5: Allocation Monitoring */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mt-3">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Allocation Monitoring</h3>
                      <div className="space-y-2">
                      
                       
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                          <div className="text-orange-800 text-xs font-semibold">Unallocated Cases</div>
                          <div className="text-orange-600 text-xs mt-1">Pending: 23</div>
                          <button className="mt-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs transition-colors cursor-pointer">
                            Auto Allocate
                          </button>
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
                             <span className="text-gray-700 text-[12px] font-medium">0-30 days (45%)</span>
                             <span className="text-gray-500 text-[12px]">17 cases</span>
                           </div>
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-orange-500 rounded"></div>
                             <span className="text-gray-700 text-[12px] font-medium">31-60 days (25%)</span>
                             <span className="text-gray-500 text-[12px]">10 cases</span>
                           </div>
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-blue-500 rounded"></div>
                             <span className="text-gray-700 text-[12px] font-medium">61-90 days (18%)</span>
                             <span className="text-gray-500 text-[12px]">7 cases</span>
                           </div>
                           <div className="flex items-center space-x-3">
                             <div className="w-4 h-4 bg-red-500 rounded"></div>
                             <span className="text-gray-700 text-[12px] font-medium">90+ days (12%)</span>
                             <span className="text-gray-500 text-[12px]">4 cases</span>
                  </div>
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