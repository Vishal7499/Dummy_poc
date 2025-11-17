import React, { useState, useEffect, useRef } from 'react'
import { GoPin } from 'react-icons/go'
import { LuPinOff } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts'
import * as XLSX from 'xlsx'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { dashboardApi, dashboardCollectionGraphApi, dashboardDepositionApi, dashboardDataApi, dashboardCollectionDataApi } from '../utils/api'
import { formatIndianNumber } from '../utils/formatters'
import tractorFinanceImage from '../assets/Images/tractor_finance.png'
import commercialVehicleImage from '../assets/Images/commercial_vehicle.png'
import constructionEquipmentImage from '../assets/Images/construction_equipment.png'
import homeLoanImage from '../assets/Images/home_loan.jpg'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('ftd')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [showAlerts, setShowAlerts] = useState(false)
  const [expandedCard, setExpandedCard] = useState(null)
  const [selectedStaffMetric, setSelectedStaffMetric] = useState(null)
  const [selectedCaseMetric, setSelectedCaseMetric] = useState(null)
  const [selectedRollMetric, setSelectedRollMetric] = useState(null) // Track selected roll metric (rollForward, rollbackReport)
  const [selectedLoanType, setSelectedLoanType] = useState(null) // Track selected loan type for Case Summary
  const [chartFilter, setChartFilter] = useState('ftd')
  const [rollRateAnalysisTab, setRollRateAnalysisTab] = useState('customerNumbers') // Track active tab in Roll Rate Analysis: 'customerNumbers', 'customerOutstanding', 'trendAnalysis'
  const leaderboardTableRef = useRef(null)
  const rollForwardRef = useRef(null)
  // Roll Forward expanded rows state
  const [expandedZones, setExpandedZones] = useState(new Set())
  const [expandedStates, setExpandedStates] = useState(new Set())
  const [selectedDate, setSelectedDate] = useState("01-10-2025");

  // Hierarchy drill-down state
  const [hierarchyPath, setHierarchyPath] = useState([]) // Array to track hierarchy path: [{level, id, name}, ...]
  const [currentHierarchyLevel, setCurrentHierarchyLevel] = useState(null) // Current hierarchy level being viewed
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
  // Customer Engagement state
  const [selectedEngagementCard, setSelectedEngagementCard] = useState(null)
  const engagementSectionRef = useRef(null)
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
  const [depositionData, setDepositionData] = useState(null)
  const [depositionLoading, setDepositionLoading] = useState(false)
  const [depositionError, setDepositionError] = useState(null)
  const [depositionCurrentPage, setDepositionCurrentPage] = useState(1)
  const [depositionPageSize] = useState(10)
  // Vertical summary data state
  const [verticalSummaryData, setVerticalSummaryData] = useState(null)
  const [verticalAllocationData, setVerticalAllocationData] = useState(null)
  const [verticalDataLoading, setVerticalDataLoading] = useState(false)
  const [verticalDataError, setVerticalDataError] = useState(null)
  // Additional table data states
  const [acmData, setAcmData] = useState(null)
  const [allocationAdminData, setAllocationAdminData] = useState(null)
  const [boData, setBoData] = useState(null)
  const [clmData, setClmData] = useState(null)
  const [dtrData, setDtrData] = useState(null)
  const [ncmData, setNcmData] = useState(null)
  const [rcmData, setRcmData] = useState(null)
  const [tcmData, setTcmData] = useState(null)
  // Pagination state for all tables
  const [productSummaryPage, setProductSummaryPage] = useState(1)
  const [productAllocationPage, setProductAllocationPage] = useState(1)
  const [ncmAllocationPage, setNCMAllocationPage] = useState(1)
  const [rcmAllocationPage, setRCMAllocationPage] = useState(1)
  const [acmAllocationPage, setACMAllocationPage] = useState(1)
  const [allocationAdminPage, setAllocationAdminPage] = useState(1)
  const [boPage, setBoPage] = useState(1)
  const [clmPage, setClmPage] = useState(1)
  const [dtrPage, setDtrPage] = useState(1)
  const [tcmPage, setTcmPage] = useState(1)
  const [stateWisePage, setStateWisePage] = useState(1)
  const [regionWisePage, setRegionWisePage] = useState(1)
  const [bucketWisePage, setBucketWisePage] = useState(1)
  // Collection summary data state
  const [stateWiseData, setStateWiseData] = useState(null)
  const [regionWiseData, setRegionWiseData] = useState(null)
  const [bucketWiseData, setBucketWiseData] = useState(null)
  const [collectionDataLoading, setCollectionDataLoading] = useState(false)
  const [collectionDataError, setCollectionDataError] = useState(null)
  const itemsPerPage = 10
  // Initialize date filters - default to last 30 days
  const getDefaultFromDate = () => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  }
  const getDefaultToDate = () => {
    return new Date().toISOString().split('T')[0]
  }
  const [fromDate, setFromDate] = useState(() => getDefaultFromDate())
  const [toDate, setToDate] = useState(() => getDefaultToDate())
  
  // Helper to check if dates are at default values
  const isFromDateDefault = () => {
    const defaultFrom = getDefaultFromDate()
    return fromDate === defaultFrom
  }
  const isToDateDefault = () => {
    const defaultTo = getDefaultToDate()
    return toDate === defaultTo
  }
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
    if (!user?.accessToken) {
      return
    }

    const fetchCollectionGraphData = async () => {
      try {
        setCollectionGraphLoading(true)
        setCollectionGraphError(null)
        
        const defaultFromDate = fromDate || '2025-01-01'
        const defaultToDate = toDate || '2025-12-30'
        
        console.log('Fetching collection graph data from:', defaultFromDate, 'to:', defaultToDate)
        
        const data = await dashboardCollectionGraphApi(user.accessToken, defaultFromDate, defaultToDate)
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

  // Fetch vertical summary data from dashboarddata API when Case Summary card is clicked
  useEffect(() => {
    if (selectedStaffMetric !== 'allocation') {
      return
    }

    if (!user?.accessToken) {
      return
    }

    const fetchVerticalSummaryData = async () => {
      try {
        setVerticalDataLoading(true)
        setVerticalDataError(null)
        
        const defaultFromDate = fromDate || '2025-01-01'
        const defaultToDate = toDate || '2025-12-30'
        
        console.log('Fetching vertical summary data from dashboarddata API from:', defaultFromDate, 'to:', defaultToDate)
        
        const data = await dashboardDataApi(user.accessToken, 'ALL', defaultFromDate, defaultToDate)
        console.log('Vertical summary data fetched:', data)
        
        // Extract and transform the data
        if (data && data['vertical summary']) {
          const transformedSummary = data['vertical summary']
            .filter(item => {
              // Filter out "Totals" row as we calculate it ourselves
              const vertical = item.VERTICAL || item.vertical || ''
              return vertical && vertical.toLowerCase() !== 'totals'
            })
            .map(item => ({
              product: item.VERTICAL || item.vertical || '',
              total: item.TOTAL || item.total || 0,
              good: item.GOOD || item.good || 0,
              npa: item.NPA || item.npa || 0,
              sma0: item.SMA0 || item.sma0 || 0,
              sma1: item.SMA1 || item.sma1 || 0,
              sma2: item.SMA2 || item.sma2 || 0
            }))
          setVerticalSummaryData(transformedSummary)
        }
        
        if (data && data['vertical allocation summary']) {
          const transformedAllocation = data['vertical allocation summary']
            .filter(item => {
              // Filter out "Totals" row as we calculate it ourselves
              const vertical = item.VERTICAL || item.vertical || ''
              return vertical && vertical.toLowerCase() !== 'totals'
            })
            .map(item => ({
              product: item.VERTICAL || item.vertical || '',
              total: item.TOTAL || item.total || 0,
              good: item.GOOD || item.good || 0,
              npa: item.NPA || item.npa || 0,
              sma0: item.SMA0 || item.sma0 || 0,
              sma1: item.SMA1 || item.sma1 || 0,
              sma2: item.SMA2 || item.sma2 || 0
            }))
          setVerticalAllocationData(transformedAllocation)
        }

        // Transform and store data for individual tables
        const transformTableData = (tableData) => {
          if (!tableData) return null
          return tableData
            .filter(item => {
              const vertical = item.VERTICAL || item.vertical || ''
              return vertical && vertical.toLowerCase() !== 'totals'
            })
            .map(item => ({
              product: item.VERTICAL || item.vertical || '',
              total: item.TOTAL || item.total || 0,
              good: item.GOOD || item.good || 0,
              npa: item.NPA || item.npa || 0,
              sma0: item.SMA0 || item.sma0 || 0,
              sma1: item.SMA1 || item.sma1 || 0,
              sma2: item.SMA2 || item.sma2 || 0
            }))
        }

        // Set data for each table
        if (data && data.ACM) setAcmData(transformTableData(data.ACM))
        if (data && data.ALLOCATION_ADMIN) setAllocationAdminData(transformTableData(data.ALLOCATION_ADMIN))
        if (data && data.BO) setBoData(transformTableData(data.BO))
        if (data && data.CLM) setClmData(transformTableData(data.CLM))
        if (data && data.DTR) setDtrData(transformTableData(data.DTR))
        if (data && data.NCM) setNcmData(transformTableData(data.NCM))
        if (data && data.RCM) setRcmData(transformTableData(data.RCM))
        if (data && data.TCM) setTcmData(transformTableData(data.TCM))
      } catch (error) {
        console.error('Error fetching vertical summary data:', error)
        setVerticalDataError(error.message || 'Failed to fetch vertical summary data')
      } finally {
        setVerticalDataLoading(false)
      }
    }

    fetchVerticalSummaryData()
  }, [selectedStaffMetric, user?.accessToken, fromDate, toDate])

  // Fetch collection summary data from dashboardcollectiondata API when Collection Efficiency card is clicked
  useEffect(() => {
    if (selectedStaffMetric !== 'collection') {
      return
    }

    if (!user?.accessToken) {
      return
    }

    const fetchCollectionData = async () => {
      try {
        setCollectionDataLoading(true)
        setCollectionDataError(null)
        
        const defaultFromDate = fromDate || '2025-01-01'
        const defaultToDate = toDate || '2025-12-30'
        
        console.log('Fetching collection summary data from:', defaultFromDate, 'to:', defaultToDate)
        
        const data = await dashboardCollectionDataApi(user.accessToken, 'ALL', defaultFromDate, defaultToDate)
        console.log('Collection summary data fetched:', data)
        
        // Extract and transform the data
        if (data && data['collection state wise summary']) {
          const transformedStateData = data['collection state wise summary']
            .filter(item => {
              // Filter out "Totals" row as we calculate it ourselves
              const state = item.STATE || item.state || ''
              return state && state.toLowerCase() !== 'totals'
            })
            .map(item => ({
              state: item.STATE || item.state || '',
              totalCases: item.TotalCases || item.totalCases || 0,
              outstandingBalance: item['Outstanding Balance (in Cr.)'] || item['Outstanding Balance (in Cr.)'] || item.outstandingBalance || 0,
              resolutionCount: item['Resolution Count'] || item.resolutionCount || item['Resolution Count'] || 0,
              resolutionCountPercent: item['Resolution Count%'] || item['Resolution Count%'] || item.resolutionCountPercent || 0,
              resolutionAmount: item['Resolution Amount'] || item.resolutionAmount || item['Resolution Amount'] || 0,
              resolutionAmountPercent: item['Resolution Amount %'] || item['Resolution Amount %'] || item.resolutionAmountPercent || 0
            }))
          setStateWiseData(transformedStateData)
        }
        
        if (data && data['collection location wise summary']) {
          const transformedRegionData = data['collection location wise summary']
            .filter(item => {
              // Filter out "Totals" row as we calculate it ourselves
              const location = item.LOCATION || item.location || ''
              return location && location.toLowerCase() !== 'totals'
            })
            .map(item => ({
              region: item.LOCATION || item.location || '',
              cases: item.Cases || item.cases || 0,
              outstandingBalance: item['Outstanding balance'] || item.outstandingBalance || 0,
              resolutionCount: item['Resolution count'] || item.resolutionCount || 0,
              resolutionCountPercent: item['Resolution Count%'] || item.resolutionCountPercent || 0,
              resolutionAmount: item['Resolution amount'] || item.resolutionAmount || 0,
              resolutionAmountPercent: item['Resolution Amount%'] || item.resolutionAmountPercent || 0
            }))
          setRegionWiseData(transformedRegionData)
        }
        
        if (data && data['collection bucket wise summary']) {
          const transformedBucketData = data['collection bucket wise summary']
            .filter(item => {
              // Filter out "Totals" row as we calculate it ourselves
              const bucket = item.BUCKET || item.bucket || ''
              return bucket && bucket.toLowerCase() !== 'totals'
            })
            .map(item => ({
              bucket: item.BUCKET || item.bucket || '',
              cases: item.Cases || item.cases || 0,
              outstandingBalance: item['Outstanding balance'] || item.outstandingBalance || 0,
              resolutionCount: item['Resolution count'] || item.resolutionCount || 0,
              resolutionCountPercent: item['Resolution Count%'] || item.resolutionCountPercent || 0,
              resolutionAmount: item['Resolution amount'] || item.resolutionAmount || 0,
              resolutionAmountPercent: item['Resolution Amount%'] || item.resolutionAmountPercent || 0
            }))
          setBucketWiseData(transformedBucketData)
        }
      } catch (error) {
        console.error('Error fetching collection summary data:', error)
        setCollectionDataError(error.message || 'Failed to fetch collection summary data')
      } finally {
        setCollectionDataLoading(false)
      }
    }

    fetchCollectionData()
  }, [selectedStaffMetric, fromDate, toDate, user?.accessToken])

  // Fetch deposition data
  useEffect(() => {
    if (!user?.accessToken) {
      return
    }

    const fetchDepositionData = async () => {
      try {
        setDepositionLoading(true)
        setDepositionError(null)
        
        const defaultFromDate = fromDate || '2025-01-01'
        const defaultToDate = toDate || '2025-12-30'
        
        console.log('Fetching deposition data from:', defaultFromDate, 'to:', defaultToDate, 'page:', depositionCurrentPage, 'page_size:', depositionPageSize)
        
        const data = await dashboardDepositionApi(user.accessToken, defaultFromDate, defaultToDate, depositionCurrentPage, depositionPageSize)
        setDepositionData(data)
        console.log('Deposition data fetched:', data)
      } catch (error) {
        console.error('Error fetching deposition data:', error)
        setDepositionError(error.message || 'Failed to fetch deposition data')
      } finally {
        setDepositionLoading(false)
      }
    }

    fetchDepositionData()
  }, [depositionCurrentPage, depositionPageSize, user?.accessToken, fromDate, toDate])

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
      if (selectedStaffMetric && leaderboardTableRef.current) {
        // Check if click is inside the leaderboard table ref
        const isInsideLeaderboardRef = leaderboardTableRef.current.contains(event.target)
        
        // For allocation and collection sections, never close if clicking inside the ref
        if ((selectedStaffMetric === 'allocation' || selectedStaffMetric === 'collection') && isInsideLeaderboardRef) {
          return // Don't close - user clicked inside the section
        }
        
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
        // Check if click is on table elements (tables, pagination, buttons inside tables)
        const isTableElement = event.target.closest('table') || 
                               event.target.closest('.table-scroll-container') ||
                               event.target.closest('button[title="Export to Excel"]') ||
                               event.target.closest('[class*="pagination"]') ||
                               event.target.closest('th') ||
                               event.target.closest('td') ||
                               event.target.closest('tr') ||
                               event.target.closest('tbody') ||
                               event.target.closest('thead') ||
                               event.target.closest('div[class*="grid"]') ||
                               event.target.closest('div[class*="space-y"]')
        
        // Only close if clicking outside the ref and not on cards, filters, or table elements
        if (!isInsideLeaderboardRef && !clickedOnCard && !isFilterElement && !isCustomerTable && !isTableElement) {
          setSelectedStaffMetric(null)
        }
      }
      
      // Close reposition section when clicking outside
      if (selectedCaseMetric === 'reposition' && leaderboardTableRef.current && !leaderboardTableRef.current.contains(event.target)) {
        // Check if click is on the reposition card
        const repositionCard = event.target.closest('[data-case-card="reposition"]')
        // Check if click is on filter elements
        const isFilterElement = filtersRef.current && filtersRef.current.contains(event.target)
        if (!repositionCard && !isFilterElement) {
          setSelectedCaseMetric(null)
        }
      }

      // Close deposition section when clicking outside
      if (selectedCaseMetric === 'deposition' && leaderboardTableRef.current && !leaderboardTableRef.current.contains(event.target)) {
        // Check if click is on the deposition card
        const depositionCard = event.target.closest('[data-case-card="deposition"]')
        // Check if click is on filter elements
        const isFilterElement = filtersRef.current && filtersRef.current.contains(event.target)
        if (!depositionCard && !isFilterElement) {
          setSelectedCaseMetric(null)
        }
      }

      // Close roll forward section when clicking outside
      if (selectedRollMetric === 'rollForward' && rollForwardRef.current && !rollForwardRef.current.contains(event.target)) {
        // Check if click is on the roll forward card
        const rollForwardCard = event.target.closest('[data-roll-card="rollForward"]')
        // Check if click is on filter elements
        const isFilterElement = filtersRef.current && filtersRef.current.contains(event.target)
        if (!rollForwardCard && !isFilterElement) {
          setSelectedRollMetric(null)
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
      
      // Close engagement section when clicking outside
      if (selectedEngagementCard && engagementSectionRef.current && !engagementSectionRef.current.contains(event.target)) {
        // Check if click is on engagement cards (don't close when clicking cards)
        const isEngagementCard = event.target.closest('[data-engagement-card]')
        if (!isEngagementCard) {
          setSelectedEngagementCard(null)
        }
      }
    }

    if (showAlerts || !isSidebarCollapsed || selectedStaffMetric || showCustomerDetails || selectedEngagementCard) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAlerts, isSidebarCollapsed, selectedStaffMetric, showCustomerDetails, selectedEngagementCard])

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

  // Customer Engagement detailed data
  const customerEngagementData = {
    totalEngagement: 764081,
    engagementBreakdown: {
      whatsapp: 349550,
      blaster: 217159,
      aiCalls: 196693,
      dialers: 679
    },
    customerMetrics: {
      totalCustomers: 27739,
      connectedCustomers: 23150,
      amountPromised: 39167071.00,
      amountCollected: 169887205.56
    },
    statusCards: {
      promisedToPay: { accounts: 1587, amount: 39167071.00 },
      refusedToPay: { accounts: 170 },
      alreadyPaid: { accounts: 636, amount: 6487485.00 },
      wrongNumber: { accounts: 1010 }
    },
    chartData: {
      dates: ['15-10-2025', '16-10-2025', '17-10-2025', '18-10-2025', '19-10-2025', '20-10-2025', '21-10-2025', '22-10-2025', '23-10-2025', '24-10-2025', '25-10-2025', '26-10-2025', '27-10-2025', '28-10-2025', '29-10-2025'],
      values: [3, 4, 2, 5, 0, 0, 0, 0, 0, 1, 0, 0, 8, 0, 0]
    }
  }

  // Chart configuration for Customer Engagement
  const engagementChartOptions = {
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false },
      animations: { enabled: false }
    },
    plotOptions: {
      bar: {
        columnWidth: '20px',
        borderRadius: 4,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: customerEngagementData.chartData.dates,
      labels: {
        style: {
          colors: '#407BFF',
          fontSize: '10px',
          fontWeight: 500
        },
        rotate: -45
      }
    },
    yaxis: {
      min: 0,
      max: 30,
      tickAmount: 6,
      labels: {
        style: {
          colors: '#407BFF',
          fontSize: '10px'
        }
      }
    },
    colors: ['#407BFF'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 3
    },
    tooltip: {
      enabled: false
    }
  }

  const engagementChartSeries = [{
    name: 'Engagement',
    data: customerEngagementData.chartData.values
  }]

  const paymentData = {
    topOverdue: { count: 45, amount: 1250000 },
    promisedToPay: { customers: 234, amount: 890000 },
    refusedToPay: { customers: 67, amount: 340000 },
    alreadyPaid: { customers: 189, amount: 560000 },
    brokenPromises: { customers: 89, amount: 280000 },
    wrongNumbers: { count: 156 }
  }

  // Enhanced staff data for leaderboard with hierarchical relationships
  // Hierarchy order: Supervisor (level 1) -> Senior Executive (level 2) -> Executive (level 3) -> Collection Officer (level 4)
  const staffLeaderboardBaseData = [
    // Supervisors (Top Level)
    { id: 'EMP001', name: 'Ramesh Kumar', hierarchy: 'Supervisor', hierarchyLevel: 1, parentId: null, piCode: 'PI001', center: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', loanType: 'Tractor', region: 'North', customers: 156, due: 3200000, overdue: 450000, calls: 45, visits: 12, collected: 2500000, efficiency: 92, escalations: 1 },
    { id: 'EMP006', name: 'Rajesh Singh', hierarchy: 'Supervisor', hierarchyLevel: 1, parentId: null, piCode: 'PI006', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 178, due: 3600000, overdue: 180000, calls: 48, visits: 14, collected: 2800000, efficiency: 95, escalations: 0 },
    
    // Senior Executives (Level 2 - report to Supervisors)
    { id: 'EMP003', name: 'Priya Rao', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP001', piCode: 'PI003', center: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', loanType: 'Construction Equipment', region: 'East', customers: 134, due: 2800000, overdue: 320000, calls: 42, visits: 15, collected: 2200000, efficiency: 88, escalations: 0 },
    { id: 'EMP010', name: 'Arjun Reddy', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP001', piCode: 'PI010', center: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', loanType: 'Construction Equipment', region: 'South', customers: 142, due: 3000000, overdue: 250000, calls: 41, visits: 13, collected: 2350000, efficiency: 89, escalations: 1 },
    { id: 'EMP013', name: 'Suresh Mehta', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP006', piCode: 'PI013', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 120, due: 2800000, overdue: 200000, calls: 43, visits: 13, collected: 2400000, efficiency: 87, escalations: 1 },
    
    // Executives (Level 3 - report to Senior Executives)
    { id: 'EMP005', name: 'Meena Iyer', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP003', piCode: 'PI005', center: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', loanType: 'Commercial Vehicle', region: 'Central', customers: 112, due: 2400000, overdue: 380000, calls: 40, visits: 10, collected: 1950000, efficiency: 80, escalations: 2 },
    { id: 'EMP008', name: 'Vikram Joshi', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP003', piCode: 'PI008', center: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', loanType: 'Commercial Vehicle', region: 'West', customers: 125, due: 2600000, overdue: 290000, calls: 44, visits: 11, collected: 2100000, efficiency: 85, escalations: 1 },
    { id: 'EMP012', name: 'Rohit Agarwal', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP010', piCode: 'PI012', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 165, due: 3400000, overdue: 195000, calls: 46, visits: 16, collected: 2650000, efficiency: 91, escalations: 0 },
    { id: 'EMP014', name: 'Neha Kapoor', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP010', piCode: 'PI014', center: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', loanType: 'Commercial Vehicle', region: 'South', customers: 98, due: 2200000, overdue: 320000, calls: 37, visits: 9, collected: 1800000, efficiency: 78, escalations: 2 },
    { id: 'EMP015', name: 'Amit Verma', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP013', piCode: 'PI015', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 110, due: 2500000, overdue: 280000, calls: 39, visits: 11, collected: 2000000, efficiency: 82, escalations: 1 },
    
    // Collection Officers (Level 4 - report to Executives)
    { id: 'EMP002', name: 'Ankit Sharma', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP005', piCode: 'PI002', center: 'Bangalore', district: 'Bangalore', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 89, due: 2100000, overdue: 680000, calls: 38, visits: 8, collected: 1800000, efficiency: 67, escalations: 3 },
    { id: 'EMP004', name: 'Suresh Patel', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP005', piCode: 'PI004', center: 'Pune', district: 'Pune', state: 'Maharashtra', loanType: 'Tractor', region: 'West', customers: 67, due: 1500000, overdue: 890000, calls: 35, visits: 6, collected: 1200000, efficiency: 54, escalations: 5 },
    { id: 'EMP007', name: 'Sunita Verma', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP008', piCode: 'PI007', center: 'Kolkata', district: 'Kolkata', state: 'West Bengal', loanType: 'Construction Equipment', region: 'East', customers: 78, due: 1800000, overdue: 720000, calls: 32, visits: 7, collected: 1500000, efficiency: 62, escalations: 4 },
    { id: 'EMP009', name: 'Deepa Nair', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP008', piCode: 'PI009', center: 'Kochi', district: 'Kochi', state: 'Kerala', loanType: 'Tractor', region: 'South', customers: 95, due: 1900000, overdue: 420000, calls: 36, visits: 9, collected: 1650000, efficiency: 72, escalations: 2 },
    { id: 'EMP011', name: 'Kavita Desai', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP012', piCode: 'PI011', center: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', loanType: 'Commercial Vehicle', region: 'West', customers: 56, due: 1200000, overdue: 950000, calls: 29, visits: 5, collected: 950000, efficiency: 48, escalations: 6 },
    { id: 'EMP016', name: 'Ravi Kumar', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP012', piCode: 'PI016', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 72, due: 1600000, overdue: 380000, calls: 33, visits: 8, collected: 1400000, efficiency: 65, escalations: 3 },
    { id: 'EMP017', name: 'Pooja Sharma', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP014', piCode: 'PI017', center: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', loanType: 'Commercial Vehicle', region: 'South', customers: 64, due: 1400000, overdue: 450000, calls: 31, visits: 7, collected: 1300000, efficiency: 58, escalations: 4 },
    { id: 'EMP018', name: 'Manoj Tiwari', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP014', piCode: 'PI018', center: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', loanType: 'Construction Equipment', region: 'South', customers: 81, due: 1700000, overdue: 350000, calls: 34, visits: 9, collected: 1550000, efficiency: 70, escalations: 2 },
    { id: 'EMP019', name: 'Anita Reddy', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP015', piCode: 'PI019', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Tractor', region: 'North', customers: 58, due: 1300000, overdue: 520000, calls: 30, visits: 6, collected: 1200000, efficiency: 55, escalations: 5 },
    { id: 'EMP020', name: 'Kiran Patel', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP015', piCode: 'PI020', center: 'Delhi', district: 'Delhi', state: 'Delhi', loanType: 'Commercial Vehicle', region: 'North', customers: 75, due: 1500000, overdue: 400000, calls: 32, visits: 8, collected: 1450000, efficiency: 68, escalations: 3 },
    
    // Additional Supervisors
    { id: 'EMP021', name: 'Vikram Malhotra', hierarchy: 'Supervisor', hierarchyLevel: 1, parentId: null, piCode: 'PI021', center: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 145, due: 3100000, overdue: 220000, calls: 47, visits: 13, collected: 2600000, efficiency: 90, escalations: 1 },
    { id: 'EMP022', name: 'Sunita Menon', hierarchy: 'Supervisor', hierarchyLevel: 1, parentId: null, piCode: 'PI022', center: 'Kolkata', district: 'Kolkata', state: 'West Bengal', loanType: 'Construction Equipment', region: 'East', customers: 132, due: 2900000, overdue: 380000, calls: 44, visits: 12, collected: 2300000, efficiency: 86, escalations: 2 },
    { id: 'EMP023', name: 'Rajesh Iyer', hierarchy: 'Supervisor', hierarchyLevel: 1, parentId: null, piCode: 'PI023', center: 'Pune', district: 'Pune', state: 'Maharashtra', loanType: 'Tractor', region: 'West', customers: 168, due: 3500000, overdue: 195000, calls: 49, visits: 15, collected: 2900000, efficiency: 93, escalations: 0 },
    
    // Additional Senior Executives
    { id: 'EMP024', name: 'Anjali Deshmukh', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP021', piCode: 'PI024', center: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 128, due: 2700000, overdue: 280000, calls: 41, visits: 12, collected: 2250000, efficiency: 85, escalations: 1 },
    { id: 'EMP025', name: 'Manoj Reddy', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP021', piCode: 'PI025', center: 'Mysore', district: 'Mysore', state: 'Karnataka', loanType: 'Tractor', region: 'South', customers: 115, due: 2600000, overdue: 310000, calls: 40, visits: 11, collected: 2150000, efficiency: 83, escalations: 2 },
    { id: 'EMP026', name: 'Kavita Banerjee', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP022', piCode: 'PI026', center: 'Kolkata', district: 'Kolkata', state: 'West Bengal', loanType: 'Construction Equipment', region: 'East', customers: 122, due: 2650000, overdue: 340000, calls: 39, visits: 10, collected: 2200000, efficiency: 81, escalations: 2 },
    { id: 'EMP027', name: 'Rohit Chatterjee', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP022', piCode: 'PI027', center: 'Howrah', district: 'Howrah', state: 'West Bengal', loanType: 'Commercial Vehicle', region: 'East', customers: 138, due: 2850000, overdue: 260000, calls: 42, visits: 13, collected: 2400000, efficiency: 87, escalations: 1 },
    { id: 'EMP028', name: 'Priya Kulkarni', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP023', piCode: 'PI028', center: 'Pune', district: 'Pune', state: 'Maharashtra', loanType: 'Tractor', region: 'West', customers: 142, due: 2950000, overdue: 240000, calls: 43, visits: 14, collected: 2500000, efficiency: 88, escalations: 1 },
    { id: 'EMP029', name: 'Amit Joshi', hierarchy: 'Senior Executive', hierarchyLevel: 2, parentId: 'EMP023', piCode: 'PI029', center: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', loanType: 'Construction Equipment', region: 'West', customers: 135, due: 2750000, overdue: 300000, calls: 41, visits: 12, collected: 2300000, efficiency: 84, escalations: 2 },
    
    // Additional Executives
    { id: 'EMP030', name: 'Deepa Shetty', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP024', piCode: 'PI030', center: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 105, due: 2300000, overdue: 350000, calls: 38, visits: 9, collected: 1900000, efficiency: 79, escalations: 2 },
    { id: 'EMP031', name: 'Suresh Gowda', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP024', piCode: 'PI031', center: 'Mangalore', district: 'Dakshina Kannada', state: 'Karnataka', loanType: 'Tractor', region: 'South', customers: 98, due: 2100000, overdue: 380000, calls: 36, visits: 8, collected: 1750000, efficiency: 76, escalations: 3 },
    { id: 'EMP032', name: 'Meera Rao', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP025', piCode: 'PI032', center: 'Mysore', district: 'Mysore', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 112, due: 2400000, overdue: 320000, calls: 39, visits: 10, collected: 2000000, efficiency: 81, escalations: 1 },
    { id: 'EMP033', name: 'Vikram Das', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP026', piCode: 'PI033', center: 'Kolkata', district: 'Kolkata', state: 'West Bengal', loanType: 'Construction Equipment', region: 'East', customers: 108, due: 2250000, overdue: 360000, calls: 37, visits: 9, collected: 1850000, efficiency: 77, escalations: 2 },
    { id: 'EMP034', name: 'Anita Sen', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP027', piCode: 'PI034', center: 'Howrah', district: 'Howrah', state: 'West Bengal', loanType: 'Commercial Vehicle', region: 'East', customers: 118, due: 2500000, overdue: 300000, calls: 40, visits: 11, collected: 2100000, efficiency: 82, escalations: 1 },
    { id: 'EMP035', name: 'Ravi Patil', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP028', piCode: 'PI035', center: 'Pune', district: 'Pune', state: 'Maharashtra', loanType: 'Tractor', region: 'West', customers: 125, due: 2600000, overdue: 280000, calls: 41, visits: 12, collected: 2200000, efficiency: 83, escalations: 1 },
    { id: 'EMP036', name: 'Kiran Shinde', hierarchy: 'Executive', hierarchyLevel: 3, parentId: 'EMP029', piCode: 'PI036', center: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', loanType: 'Construction Equipment', region: 'West', customers: 102, due: 2200000, overdue: 340000, calls: 38, visits: 9, collected: 1800000, efficiency: 78, escalations: 2 },
    
    // Additional Collection Officers
    { id: 'EMP037', name: 'Pooja Nair', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP030', piCode: 'PI037', center: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 68, due: 1450000, overdue: 480000, calls: 30, visits: 6, collected: 1250000, efficiency: 61, escalations: 4 },
    { id: 'EMP038', name: 'Rajesh Kamath', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP030', piCode: 'PI038', center: 'Bangalore', district: 'Bangalore Urban', state: 'Karnataka', loanType: 'Tractor', region: 'South', customers: 73, due: 1550000, overdue: 420000, calls: 32, visits: 7, collected: 1350000, efficiency: 64, escalations: 3 },
    { id: 'EMP039', name: 'Sunita Bhat', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP031', piCode: 'PI039', center: 'Mangalore', district: 'Dakshina Kannada', state: 'Karnataka', loanType: 'Commercial Vehicle', region: 'South', customers: 61, due: 1350000, overdue: 520000, calls: 28, visits: 5, collected: 1150000, efficiency: 57, escalations: 5 },
    { id: 'EMP040', name: 'Amit Pai', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP032', piCode: 'PI040', center: 'Mysore', district: 'Mysore', state: 'Karnataka', loanType: 'Tractor', region: 'South', customers: 79, due: 1650000, overdue: 380000, calls: 33, visits: 8, collected: 1450000, efficiency: 66, escalations: 3 },
    { id: 'EMP041', name: 'Priya Mukherjee', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP033', piCode: 'PI041', center: 'Kolkata', district: 'Kolkata', state: 'West Bengal', loanType: 'Construction Equipment', region: 'East', customers: 65, due: 1400000, overdue: 460000, calls: 29, visits: 6, collected: 1200000, efficiency: 59, escalations: 4 },
    { id: 'EMP042', name: 'Vikram Ghosh', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP034', piCode: 'PI042', center: 'Howrah', district: 'Howrah', state: 'West Bengal', loanType: 'Commercial Vehicle', region: 'East', customers: 71, due: 1500000, overdue: 410000, calls: 31, visits: 7, collected: 1300000, efficiency: 63, escalations: 3 },
    { id: 'EMP043', name: 'Kavita Thakur', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP035', piCode: 'PI043', center: 'Pune', district: 'Pune', state: 'Maharashtra', loanType: 'Tractor', region: 'West', customers: 77, due: 1600000, overdue: 370000, calls: 34, visits: 8, collected: 1400000, efficiency: 67, escalations: 2 },
    { id: 'EMP044', name: 'Rohit Jadhav', hierarchy: 'Collection Officer', hierarchyLevel: 4, parentId: 'EMP036', piCode: 'PI044', center: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', loanType: 'Construction Equipment', region: 'West', customers: 63, due: 1380000, overdue: 440000, calls: 30, visits: 6, collected: 1250000, efficiency: 60, escalations: 4 }
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
    ],
    'EMP013': [
      { id: 'C046', name: 'Rajesh Mehta', phone: '9876543255', loanAmount: 550000, dueAmount: 140000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-02-11', nextDue: '2024-03-11' },
      { id: 'C047', name: 'Sunita Kapoor', phone: '9876543256', loanAmount: 680000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-12', nextDue: '2024-03-12' },
      { id: 'C048', name: 'Amit Tiwari', phone: '9876543257', loanAmount: 420000, dueAmount: 105000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-28', nextDue: '2024-01-28' }
    ],
    'EMP014': [
      { id: 'C049', name: 'Priya Verma', phone: '9876543258', loanAmount: 590000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-13', nextDue: '2024-03-13' },
      { id: 'C050', name: 'Vikram Kapoor', phone: '9876543259', loanAmount: 720000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-14', nextDue: '2024-03-14' }
    ],
    'EMP015': [
      { id: 'C051', name: 'Kavita Tiwari', phone: '9876543260', loanAmount: 510000, dueAmount: 130000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-02-15', nextDue: '2024-03-15' },
      { id: 'C052', name: 'Rohit Mehta', phone: '9876543261', loanAmount: 650000, dueAmount: 165000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-16', nextDue: '2024-03-16' }
    ],
    'EMP016': [
      { id: 'C053', name: 'Anjali Kumar', phone: '9876543262', loanAmount: 480000, dueAmount: 120000, overdueAmount: 25000, status: 'Overdue', lastPayment: '2023-12-30', nextDue: '2024-01-30' },
      { id: 'C054', name: 'Suresh Verma', phone: '9876543263', loanAmount: 620000, dueAmount: 155000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-17', nextDue: '2024-03-17' }
    ],
    'EMP017': [
      { id: 'C055', name: 'Deepa Kapoor', phone: '9876543264', loanAmount: 450000, dueAmount: 115000, overdueAmount: 30000, status: 'Overdue', lastPayment: '2023-12-25', nextDue: '2024-01-25' },
      { id: 'C056', name: 'Manish Tiwari', phone: '9876543265', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-18', nextDue: '2024-03-18' }
    ],
    'EMP018': [
      { id: 'C057', name: 'Rajesh Verma', phone: '9876543266', loanAmount: 520000, dueAmount: 130000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-02-19', nextDue: '2024-03-19' },
      { id: 'C058', name: 'Sunita Mehta', phone: '9876543267', loanAmount: 690000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-20', nextDue: '2024-03-20' }
    ],
    'EMP019': [
      { id: 'C059', name: 'Amit Kapoor', phone: '9876543268', loanAmount: 470000, dueAmount: 120000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-22', nextDue: '2024-01-22' },
      { id: 'C060', name: 'Priya Tiwari', phone: '9876543269', loanAmount: 610000, dueAmount: 155000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-21', nextDue: '2024-03-21' }
    ],
    'EMP020': [
      { id: 'C061', name: 'Vikram Verma', phone: '9876543270', loanAmount: 540000, dueAmount: 135000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-02-22', nextDue: '2024-03-22' },
      { id: 'C062', name: 'Kavita Mehta', phone: '9876543271', loanAmount: 670000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-23', nextDue: '2024-03-23' }
    ],
    'EMP021': [
      { id: 'C063', name: 'Ramesh Gowda', phone: '9876543272', loanAmount: 560000, dueAmount: 140000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-02-24', nextDue: '2024-03-24' },
      { id: 'C064', name: 'Lakshmi Shetty', phone: '9876543273', loanAmount: 690000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-25', nextDue: '2024-03-25' },
      { id: 'C065', name: 'Suresh Kamath', phone: '9876543274', loanAmount: 510000, dueAmount: 130000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-30', nextDue: '2024-01-30' }
    ],
    'EMP022': [
      { id: 'C066', name: 'Priya Banerjee', phone: '9876543275', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-26', nextDue: '2024-03-26' },
      { id: 'C067', name: 'Amit Chatterjee', phone: '9876543276', loanAmount: 720000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-02-27', nextDue: '2024-03-27' }
    ],
    'EMP023': [
      { id: 'C068', name: 'Kavita Kulkarni', phone: '9876543277', loanAmount: 550000, dueAmount: 140000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-02-28', nextDue: '2024-03-28' },
      { id: 'C069', name: 'Rohit Joshi', phone: '9876543278', loanAmount: 680000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-01', nextDue: '2024-04-01' }
    ],
    'EMP024': [
      { id: 'C070', name: 'Deepa Deshmukh', phone: '9876543279', loanAmount: 590000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-02', nextDue: '2024-04-02' },
      { id: 'C071', name: 'Manish Reddy', phone: '9876543280', loanAmount: 710000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-03', nextDue: '2024-04-03' }
    ],
    'EMP025': [
      { id: 'C072', name: 'Anita Gowda', phone: '9876543281', loanAmount: 520000, dueAmount: 130000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-03-04', nextDue: '2024-04-04' },
      { id: 'C073', name: 'Vikram Rao', phone: '9876543282', loanAmount: 650000, dueAmount: 165000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-05', nextDue: '2024-04-05' }
    ],
    'EMP026': [
      { id: 'C074', name: 'Sunita Das', phone: '9876543283', loanAmount: 570000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-06', nextDue: '2024-04-06' },
      { id: 'C075', name: 'Rajesh Sen', phone: '9876543284', loanAmount: 700000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-07', nextDue: '2024-04-07' }
    ],
    'EMP027': [
      { id: 'C076', name: 'Priya Patil', phone: '9876543285', loanAmount: 540000, dueAmount: 135000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-03-08', nextDue: '2024-04-08' },
      { id: 'C077', name: 'Amit Shinde', phone: '9876543286', loanAmount: 670000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-09', nextDue: '2024-04-09' }
    ],
    'EMP028': [
      { id: 'C078', name: 'Kavita Nair', phone: '9876543287', loanAmount: 600000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-10', nextDue: '2024-04-10' },
      { id: 'C079', name: 'Rohit Kamath', phone: '9876543288', loanAmount: 730000, dueAmount: 185000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-11', nextDue: '2024-04-11' }
    ],
    'EMP029': [
      { id: 'C080', name: 'Deepa Bhat', phone: '9876543289', loanAmount: 530000, dueAmount: 135000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-28', nextDue: '2024-01-28' },
      { id: 'C081', name: 'Manish Pai', phone: '9876543290', loanAmount: 660000, dueAmount: 165000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-12', nextDue: '2024-04-12' }
    ],
    'EMP030': [
      { id: 'C082', name: 'Anita Mukherjee', phone: '9876543291', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-13', nextDue: '2024-04-13' },
      { id: 'C083', name: 'Vikram Ghosh', phone: '9876543292', loanAmount: 710000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-14', nextDue: '2024-04-14' }
    ],
    'EMP031': [
      { id: 'C084', name: 'Sunita Thakur', phone: '9876543293', loanAmount: 550000, dueAmount: 140000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-03-15', nextDue: '2024-04-15' },
      { id: 'C085', name: 'Rajesh Jadhav', phone: '9876543294', loanAmount: 680000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-16', nextDue: '2024-04-16' }
    ],
    'EMP032': [
      { id: 'C086', name: 'Priya Shetty', phone: '9876543295', loanAmount: 600000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-17', nextDue: '2024-04-17' },
      { id: 'C087', name: 'Amit Gowda', phone: '9876543296', loanAmount: 730000, dueAmount: 185000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-18', nextDue: '2024-04-18' }
    ],
    'EMP033': [
      { id: 'C088', name: 'Kavita Rao', phone: '9876543297', loanAmount: 560000, dueAmount: 140000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-03-19', nextDue: '2024-04-19' },
      { id: 'C089', name: 'Rohit Das', phone: '9876543298', loanAmount: 690000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-20', nextDue: '2024-04-20' }
    ],
    'EMP034': [
      { id: 'C090', name: 'Deepa Sen', phone: '9876543299', loanAmount: 610000, dueAmount: 155000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-21', nextDue: '2024-04-21' },
      { id: 'C091', name: 'Manish Patil', phone: '9876543300', loanAmount: 740000, dueAmount: 185000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-22', nextDue: '2024-04-22' }
    ],
    'EMP035': [
      { id: 'C092', name: 'Anita Shinde', phone: '9876543301', loanAmount: 570000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-23', nextDue: '2024-04-23' },
      { id: 'C093', name: 'Vikram Nair', phone: '9876543302', loanAmount: 700000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-24', nextDue: '2024-04-24' }
    ],
    'EMP036': [
      { id: 'C094', name: 'Sunita Kamath', phone: '9876543303', loanAmount: 590000, dueAmount: 150000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-25', nextDue: '2024-04-25' },
      { id: 'C095', name: 'Rajesh Bhat', phone: '9876543304', loanAmount: 720000, dueAmount: 180000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-26', nextDue: '2024-04-26' }
    ],
    'EMP037': [
      { id: 'C096', name: 'Priya Pai', phone: '9876543305', loanAmount: 480000, dueAmount: 120000, overdueAmount: 25000, status: 'Overdue', lastPayment: '2023-12-20', nextDue: '2024-01-20' },
      { id: 'C097', name: 'Amit Mukherjee', phone: '9876543306', loanAmount: 620000, dueAmount: 155000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-27', nextDue: '2024-04-27' }
    ],
    'EMP038': [
      { id: 'C098', name: 'Kavita Ghosh', phone: '9876543307', loanAmount: 510000, dueAmount: 130000, overdueAmount: 15000, status: 'Active', lastPayment: '2024-03-28', nextDue: '2024-04-28' },
      { id: 'C099', name: 'Rohit Thakur', phone: '9876543308', loanAmount: 640000, dueAmount: 160000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-29', nextDue: '2024-04-29' }
    ],
    'EMP039': [
      { id: 'C100', name: 'Deepa Jadhav', phone: '9876543309', loanAmount: 450000, dueAmount: 115000, overdueAmount: 30000, status: 'Overdue', lastPayment: '2023-12-15', nextDue: '2024-01-15' },
      { id: 'C101', name: 'Manish Shetty', phone: '9876543310', loanAmount: 580000, dueAmount: 145000, overdueAmount: 0, status: 'Active', lastPayment: '2024-03-30', nextDue: '2024-04-30' }
    ],
    'EMP040': [
      { id: 'C102', name: 'Anita Gowda', phone: '9876543311', loanAmount: 520000, dueAmount: 130000, overdueAmount: 5000, status: 'Active', lastPayment: '2024-03-31', nextDue: '2024-04-30' },
      { id: 'C103', name: 'Vikram Rao', phone: '9876543312', loanAmount: 650000, dueAmount: 165000, overdueAmount: 0, status: 'Active', lastPayment: '2024-04-01', nextDue: '2024-05-01' }
    ],
    'EMP041': [
      { id: 'C104', name: 'Sunita Das', phone: '9876543313', loanAmount: 490000, dueAmount: 125000, overdueAmount: 20000, status: 'Overdue', lastPayment: '2023-12-25', nextDue: '2024-01-25' },
      { id: 'C105', name: 'Rajesh Sen', phone: '9876543314', loanAmount: 630000, dueAmount: 160000, overdueAmount: 0, status: 'Active', lastPayment: '2024-04-02', nextDue: '2024-05-02' }
    ],
    'EMP042': [
      { id: 'C106', name: 'Priya Patil', phone: '9876543315', loanAmount: 540000, dueAmount: 135000, overdueAmount: 10000, status: 'Active', lastPayment: '2024-04-03', nextDue: '2024-05-03' },
      { id: 'C107', name: 'Amit Shinde', phone: '9876543316', loanAmount: 670000, dueAmount: 170000, overdueAmount: 0, status: 'Active', lastPayment: '2024-04-04', nextDue: '2024-05-04' }
    ],
    'EMP043': [
      { id: 'C108', name: 'Kavita Nair', phone: '9876543317', loanAmount: 560000, dueAmount: 140000, overdueAmount: 0, status: 'Active', lastPayment: '2024-04-05', nextDue: '2024-05-05' },
      { id: 'C109', name: 'Rohit Kamath', phone: '9876543318', loanAmount: 690000, dueAmount: 175000, overdueAmount: 0, status: 'Active', lastPayment: '2024-04-06', nextDue: '2024-05-06' }
    ],
    'EMP044': [
      { id: 'C110', name: 'Deepa Bhat', phone: '9876543319', loanAmount: 500000, dueAmount: 125000, overdueAmount: 22000, status: 'Overdue', lastPayment: '2023-12-18', nextDue: '2024-01-18' },
      { id: 'C111', name: 'Manish Pai', phone: '9876543320', loanAmount: 640000, dueAmount: 160000, overdueAmount: 0, status: 'Active', lastPayment: '2024-04-07', nextDue: '2024-05-07' }
    ]
  }

  // Filter and sort staff data based on search, metric, filters, and hierarchy
  const getFilteredStaffData = (metric) => {
    // Determine which staff to show based on hierarchy path
    let baseFiltered = staffLeaderboardBaseData
    
    // If we're in a hierarchy drill-down, filter by parent
    if (hierarchyPath.length > 0) {
      const currentParent = hierarchyPath[hierarchyPath.length - 1]
      baseFiltered = staffLeaderboardBaseData.filter(staff => staff.parentId === currentParent.id)
    } else if (currentHierarchyLevel === 1) {
      // Show only top level (Supervisors) when starting
      baseFiltered = staffLeaderboardBaseData.filter(staff => staff.hierarchyLevel === 1)
    } else if (currentHierarchyLevel) {
      // Show staff at current hierarchy level
      baseFiltered = staffLeaderboardBaseData.filter(staff => staff.hierarchyLevel === currentHierarchyLevel)
    }
    
    let filtered = baseFiltered.filter(staff => {
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

  // Reset page when metric, search, filters, or hierarchy changes
  useEffect(() => {
    setStaffCurrentPage(1)
  }, [selectedStaffMetric, staffSearchTerm, staffSortBy, staffSortOrder, filterLoanType, filterDPD, filterGeography, filterState, filterDistrict, filterPICode, fromDate, toDate, hierarchyPath, currentHierarchyLevel])

  const handleStaffCardClick = (metric) => {
    if (selectedStaffMetric === metric) {
      setSelectedStaffMetric(null)
      setHierarchyPath([])
      setCurrentHierarchyLevel(null)
      setSelectedLoanType(null) // Reset loan type when closing
    } else {
      setSelectedStaffMetric(metric)
      // Reset hierarchy to show top level (Supervisors)
      setHierarchyPath([])
      setCurrentHierarchyLevel(1) // Start with Supervisor level
      // Reset loan type when switching to allocation
      if (metric === 'allocation') {
        setSelectedLoanType(null) // Show loan type cards first
      }
    }
  }

  // Handle hierarchy drill-down - click on a row to see subordinates
  const handleHierarchyDrillDown = (staff) => {
    // Check if this staff member has subordinates
    const hasSubordinates = staffLeaderboardBaseData.some(s => s.parentId === staff.id)
    
    if (hasSubordinates) {
      // Add current staff to hierarchy path
      setHierarchyPath(prev => [...prev, {
        level: staff.hierarchyLevel,
        id: staff.id,
        name: staff.name,
        hierarchy: staff.hierarchy
      }])
      // Set next hierarchy level
      setCurrentHierarchyLevel(staff.hierarchyLevel + 1)
      setStaffCurrentPage(1) // Reset pagination
    }
  }

  // Handle going back up the hierarchy
  const handleHierarchyBack = (targetLevel) => {
    if (targetLevel === 0) {
      // Go back to top level
      setHierarchyPath([])
      setCurrentHierarchyLevel(1)
    } else {
      // Go back to specific level
      const newPath = hierarchyPath.slice(0, targetLevel)
      setHierarchyPath(newPath)
      if (newPath.length > 0) {
        setCurrentHierarchyLevel(newPath[newPath.length - 1].level + 1)
      } else {
        setCurrentHierarchyLevel(1)
      }
    }
    setStaffCurrentPage(1) // Reset pagination
  }

  // Export filtered data to Excel
  const handleExportToExcel = () => {
    if (!selectedStaffMetric || filteredStaffData.length === 0) {
      alert('No data to export')
      return
    }

    // Prepare data for export - include all filtered data (all pages)
    const exportData = filteredStaffData.map(staff => ({
      'Emp ID': staff.id,
      'Name': staff.name,
      'Hierarchy': staff.hierarchy,
      'PI Code': staff.piCode,
      'Center': staff.center,
      'District': staff.district,
      'State': staff.state,
      'Loan Type': staff.loanType,
      'Region': staff.region,
      'Customers': staff.customers,
      'Due (₹)': staff.due,
      'Overdue (₹)': staff.overdue,
      'Calls': staff.calls,
      'Visits': staff.visits,
      'Collected (₹)': staff.collected,
      'Efficiency (%)': staff.efficiency,
      'Escalations': staff.escalations
    }))

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Staff Performance')

    // Generate filename with current date and metric name
    const dateStr = new Date().toISOString().split('T')[0]
    const metricName = getCardName(selectedStaffMetric).replace(/\s+/g, '_')
    const filename = `Staff_Performance_${metricName}_${dateStr}.xlsx`

    // Write file
    XLSX.writeFile(wb, filename)
  }

  // Handle engagement card click
  const handleEngagementCardClick = (cardType) => {
    if (selectedEngagementCard === cardType) {
      setSelectedEngagementCard(null)
    } else {
      setSelectedEngagementCard(cardType)
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
    setFromDate(getDefaultFromDate())
    setToDate(getDefaultToDate())
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
    { id: 'reposition', name: 'Reposition', category: 'Case Management' },
    { id: 'deposition', name: 'Deposition', category: 'Case Management' },
    { id: 'settlements', name: 'Settlements', category: 'Case Management' },
    { id: 'bucketWiseDPD', name: 'Bucket Wise DPD', category: 'Case Management' },
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

  // Helper function to export table data to Excel
  const exportTableToExcel = (data, headers, filename) => {
    try {
      // Prepare header row (extract labels from header objects)
      const headerRow = headers.map(header => header.label || header)
      
      // Prepare data rows
      const dataRows = data.map(row => 
        headers.map(header => {
          const key = header.key || header
          const value = row[key]
          return value !== undefined && value !== null ? String(value) : ''
        })
      )

      // Combine headers and data
      const exportData = [headerRow, ...dataRows]

      // Create workbook and worksheet
      const ws = XLSX.utils.aoa_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

      // Set column widths
      const colWidths = headers.map((header, index) => {
        const label = header.label || header
        const maxLength = Math.max(
          label.length,
          ...dataRows.map(row => String(row[index] || '').length)
        )
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
      })
      ws['!cols'] = colWidths

      // Export to file
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error('Error exporting table:', error)
      alert('Failed to export table. Please try again.')
    }
  }

  // Helper function to render Portfolio-wise Summary table
  const renderPortfolioWiseSummaryTable = () => {
    const portfolioData = [
      { portfolio: 'TFE', totalAccounts: 76852, totalRepossessions: 433, allocatedAccounts: 76542, totalNotSurrendered: 76843 },
      { portfolio: 'CV', totalAccounts: 20509, totalRepossessions: 15248, allocatedAccounts: 4939, totalNotSurrendered: 20468 },
      { portfolio: 'LCV', totalAccounts: 5298, totalRepossessions: 1, allocatedAccounts: 5296, totalNotSurrendered: 5297 },
      { portfolio: 'SA', totalAccounts: 3341, totalRepossessions: 1, allocatedAccounts: 3339, totalNotSurrendered: 3341 },
      { portfolio: 'CE', totalAccounts: 2908, totalRepossessions: 66, allocatedAccounts: 261, totalNotSurrendered: 2904 },
      { portfolio: 'TW', totalAccounts: 105, totalRepossessions: 146, allocatedAccounts: 92, totalNotSurrendered: 105 }
    ]
    const totals = portfolioData.reduce((acc, row) => ({
      totalAccounts: acc.totalAccounts + row.totalAccounts,
      totalRepossessions: acc.totalRepossessions + row.totalRepossessions,
      allocatedAccounts: acc.allocatedAccounts + row.allocatedAccounts,
      totalNotSurrendered: acc.totalNotSurrendered + row.totalNotSurrendered
    }), { totalAccounts: 0, totalRepossessions: 0, allocatedAccounts: 0, totalNotSurrendered: 0 })

    const handleExport = () => {
      const headers = [
        { key: 'portfolio', label: 'Portfolio' },
        { key: 'totalAccounts', label: 'Total Accounts' },
        { key: 'totalRepossessions', label: 'Total Repossessions' },
        { key: 'allocatedAccounts', label: 'Allocated Accounts' },
        { key: 'totalNotSurrendered', label: 'Total Not Surrendered' }
      ]
      const exportData = [...portfolioData, totals]
      exportTableToExcel(exportData, headers, 'Portfolio_Wise_Summary')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 text-[#003366] p-3 text-lg font-semibold flex justify-between items-center">
          <span>Portfolio-wise Summary</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Accounts</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Repossessions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Accounts</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Not Surrendered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.portfolio}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.totalAccounts.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.totalRepossessions.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.allocatedAccounts.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.totalNotSurrendered.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Summary</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.totalAccounts.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.totalRepossessions.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.allocatedAccounts.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.totalNotSurrendered.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render DPD-wise Summary table
  const renderDPDWiseSummaryTable = () => {
    const dpdData = [
      { dpdBucket: '0 DPD', totalAccounts: 361, totalRepossessions: 120, allocatedAccounts: 219, totalNotSurrendered: 339 },
      { dpdBucket: '1-100', totalAccounts: 1128, totalRepossessions: 147, allocatedAccounts: 110, totalNotSurrendered: 1126 },
      { dpdBucket: '101-300', totalAccounts: 1572, totalRepossessions: 168, allocatedAccounts: 43, totalNotSurrendered: 1571 },
      { dpdBucket: '301-500', totalAccounts: 55707, totalRepossessions: 161, allocatedAccounts: 55177, totalNotSurrendered: 55696 },
      { dpdBucket: '>500', totalAccounts: 49239, totalRepossessions: 15370, allocatedAccounts: 33236, totalNotSurrendered: 49215 }
    ]
    const totals = dpdData.reduce((acc, row) => ({
      totalAccounts: acc.totalAccounts + row.totalAccounts,
      totalRepossessions: acc.totalRepossessions + row.totalRepossessions,
      allocatedAccounts: acc.allocatedAccounts + row.allocatedAccounts,
      totalNotSurrendered: acc.totalNotSurrendered + row.totalNotSurrendered
    }), { totalAccounts: 0, totalRepossessions: 0, allocatedAccounts: 0, totalNotSurrendered: 0 })

    const handleExport = () => {
      const headers = [
        { key: 'dpdBucket', label: 'DPD Bucket' },
        { key: 'totalAccounts', label: 'Total Accounts' },
        { key: 'totalRepossessions', label: 'Total Repossessions' },
        { key: 'allocatedAccounts', label: 'Allocated Accounts' },
        { key: 'totalNotSurrendered', label: 'Total Not Surrendered' }
      ]
      const exportData = [...dpdData, totals]
      exportTableToExcel(exportData, headers, 'DPD_Wise_Summary')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 text-[#003366] p-3 text-lg font-semibold flex justify-between items-center">
          <span>DPD-wise Summary</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DPD Bucket</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Accounts</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Repossessions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated Accounts</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Not Surrendered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dpdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.dpdBucket}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.totalAccounts.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.totalRepossessions.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.allocatedAccounts.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.totalNotSurrendered.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Summary</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.totalAccounts.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.totalRepossessions.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.allocatedAccounts.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{totals.totalNotSurrendered.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render DPD Collection Efficiency Table (Top Table)
  const renderDPDCollectionEfficiencyTable = () => {
    const dpdData = [
      { 
        dpd: '0 DPD',
        casesAllocated: 30000,
        totalOutstandingPOS: 85000000,
        odAmountCurrentDue: 1200000,
        collectedAccounts: 8500,
        clientsVisited: 12000,
        p2pReceived: 350,
        collectedAmount: 420000,
        clientsNotVisited: 18000,
        p2pConverted: 25
      },
      { 
        dpd: '01-30 days',
        casesAllocated: 20000,
        totalOutstandingPOS: 100000000,
        odAmountCurrentDue: 3000000,
        collectedAccounts: 5000,
        clientsVisited: 6000,
        p2pReceived: 200,
        collectedAmount: 250000,
        clientsNotVisited: 14000,
        p2pConverted: 10
      },
      { 
        dpd: '31-60 days',
        casesAllocated: 18000,
        totalOutstandingPOS: 95000000,
        odAmountCurrentDue: 2800000,
        collectedAccounts: 4200,
        clientsVisited: 5500,
        p2pReceived: 180,
        collectedAmount: 220000,
        clientsNotVisited: 12500,
        p2pConverted: 8
      },
      { 
        dpd: '61-90 days',
        casesAllocated: 15000,
        totalOutstandingPOS: 88000000,
        odAmountCurrentDue: 2500000,
        collectedAccounts: 3800,
        clientsVisited: 4800,
        p2pReceived: 150,
        collectedAmount: 190000,
        clientsNotVisited: 10200,
        p2pConverted: 6
      },
      { 
        dpd: '90-120 Days',
        casesAllocated: 12000,
        totalOutstandingPOS: 72000000,
        odAmountCurrentDue: 2100000,
        collectedAccounts: 3100,
        clientsVisited: 3900,
        p2pReceived: 120,
        collectedAmount: 160000,
        clientsNotVisited: 8100,
        p2pConverted: 5
      },
      { 
        dpd: '121-180 days',
        casesAllocated: 10000,
        totalOutstandingPOS: 65000000,
        odAmountCurrentDue: 1800000,
        collectedAccounts: 2600,
        clientsVisited: 3200,
        p2pReceived: 95,
        collectedAmount: 135000,
        clientsNotVisited: 6800,
        p2pConverted: 4
      },
      { 
        dpd: '180-365 Days',
        casesAllocated: 8500,
        totalOutstandingPOS: 55000000,
        odAmountCurrentDue: 1500000,
        collectedAccounts: 2100,
        clientsVisited: 2700,
        p2pReceived: 75,
        collectedAmount: 110000,
        clientsNotVisited: 5800,
        p2pConverted: 3
      },
      { 
        dpd: '>365',
        casesAllocated: 6000,
        totalOutstandingPOS: 42000000,
        odAmountCurrentDue: 1100000,
        collectedAccounts: 1500,
        clientsVisited: 2000,
        p2pReceived: 55,
        collectedAmount: 85000,
        clientsNotVisited: 4000,
        p2pConverted: 2
      }
    ]

    const formatNumber = (value) => {
      if (value === '' || value === null || value === undefined) return ''
      return value.toLocaleString('en-IN')
    }

    const handleExport = () => {
      const headers = [
        { key: 'dpd', label: 'DPD' },
        { key: 'casesAllocated', label: 'Cases Allocated' },
        { key: 'totalOutstandingPOS', label: 'Total OutStanding POS' },
        { key: 'odAmountCurrentDue', label: 'OD Amount + Current Due' },
        { key: 'collectedAccounts', label: '#Collected Accounts' },
        { key: 'clientsVisited', label: 'Clients Visited' },
        { key: 'p2pReceived', label: 'P2P received' },
        { key: 'collectedAmount', label: '#Collected Amount' },
        { key: 'clientsNotVisited', label: 'Clients Not Visited' },
        { key: 'p2pConverted', label: 'P2P Converted' }
      ]
      exportTableToExcel(dpdData, headers, 'DPD_Collection_Efficiency')
    }

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">DPD Collection Efficiency</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>DPD</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>Cases Allocated</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>Total OutStanding POS</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>OD Amount + Current Due</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>#Collected Accounts</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>Clients Visited</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>P2P received</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>#Collected Amount</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>Clients Not Visited</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>P2P Converted</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {dpdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.dpd}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.casesAllocated)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.totalOutstandingPOS)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.odAmountCurrentDue)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.collectedAccounts)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.clientsVisited)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.p2pReceived)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.collectedAmount)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.clientsNotVisited)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.p2pConverted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render DPD Collection Efficiency Summary Table (Bottom Table)
  const renderDPDCollectionEfficiencySummaryTable = () => {
    const dpdData = [
      { 
        dpd: '0 DPD',
        casesAllocated: 30000,
        totalOutstandingPOS: '18.5%',
        odAmountCurrentDue: 1200000,
        collectedAccounts: '28.3%',
        clientsVisited: '35.0%',
        p2pReceivedOverall: '1.17%',
        p2pReceivedVisitedClients: '2.92%',
        collectedAmount: '0.49%',
        clientsNotVisited: '65.00%',
        p2pConverted: '0.83%'
      },
      { 
        dpd: '01-30 days',
        casesAllocated: 20000,
        totalOutstandingPOS: '33%',
        odAmountCurrentDue: 3000000,
        collectedAccounts: '25%',
        clientsVisited: '30%',
        p2pReceivedOverall: '1.00%',
        p2pReceivedVisitedClients: '4.00%',
        collectedAmount: '0.47%',
        clientsNotVisited: '70.00%',
        p2pConverted: '5.00%'
      },
      { 
        dpd: '31-60 days',
        casesAllocated: 18000,
        totalOutstandingPOS: '20.7%',
        odAmountCurrentDue: 2800000,
        collectedAccounts: '23.3%',
        clientsVisited: '30.6%',
        p2pReceivedOverall: '1.00%',
        p2pReceivedVisitedClients: '3.27%',
        collectedAmount: '0.40%',
        clientsNotVisited: '69.44%',
        p2pConverted: '4.44%'
      },
      { 
        dpd: '61-90 days',
        casesAllocated: 15000,
        totalOutstandingPOS: '19.1%',
        odAmountCurrentDue: 2500000,
        collectedAccounts: '25.3%',
        clientsVisited: '32.0%',
        p2pReceivedOverall: '1.00%',
        p2pReceivedVisitedClients: '3.13%',
        collectedAmount: '0.35%',
        clientsNotVisited: '68.00%',
        p2pConverted: '4.00%'
      },
      { 
        dpd: '90-120 Days',
        casesAllocated: 12000,
        totalOutstandingPOS: '15.7%',
        odAmountCurrentDue: 2100000,
        collectedAccounts: '25.8%',
        clientsVisited: '32.5%',
        p2pReceivedOverall: '1.00%',
        p2pReceivedVisitedClients: '3.08%',
        collectedAmount: '0.30%',
        clientsNotVisited: '67.50%',
        p2pConverted: '4.17%'
      },
      { 
        dpd: '121-180 days',
        casesAllocated: 10000,
        totalOutstandingPOS: '14.2%',
        odAmountCurrentDue: 1800000,
        collectedAccounts: '26.0%',
        clientsVisited: '32.0%',
        p2pReceivedOverall: '0.95%',
        p2pReceivedVisitedClients: '2.97%',
        collectedAmount: '0.28%',
        clientsNotVisited: '68.00%',
        p2pConverted: '4.00%'
      },
      { 
        dpd: '180-365 Days',
        casesAllocated: 8500,
        totalOutstandingPOS: '12.0%',
        odAmountCurrentDue: 1500000,
        collectedAccounts: '24.7%',
        clientsVisited: '31.8%',
        p2pReceivedOverall: '0.88%',
        p2pReceivedVisitedClients: '2.78%',
        collectedAmount: '0.25%',
        clientsNotVisited: '68.24%',
        p2pConverted: '3.53%'
      },
      { 
        dpd: '>365',
        casesAllocated: 6000,
        totalOutstandingPOS: '9.2%',
        odAmountCurrentDue: 1100000,
        collectedAccounts: '25.0%',
        clientsVisited: '33.3%',
        p2pReceivedOverall: '0.92%',
        p2pReceivedVisitedClients: '2.75%',
        collectedAmount: '0.24%',
        clientsNotVisited: '66.67%',
        p2pConverted: '3.33%'
      },
      { 
        dpd: 'Total',
        casesAllocated: 119500,
        totalOutstandingPOS: '100%',
        odAmountCurrentDue: 15000000,
        collectedAccounts: '25.8%',
        clientsVisited: '32.4%',
        p2pReceivedOverall: '1.01%',
        p2pReceivedVisitedClients: '3.12%',
        collectedAmount: '0.38%',
        clientsNotVisited: '67.60%',
        p2pConverted: '4.12%'
      }
    ]

    const formatNumber = (value) => {
      if (value === '' || value === null || value === undefined) return ''
      if (typeof value === 'string' && value.includes('%')) return value
      return value.toLocaleString('en-IN')
    }

    const handleExport = () => {
      const headers = [
        { key: 'dpd', label: 'DPD' },
        { key: 'casesAllocated', label: 'Cases Allocated' },
        { key: 'totalOutstandingPOS', label: 'Total OutStanding POS' },
        { key: 'odAmountCurrentDue', label: 'OD Amount + Current Due' },
        { key: 'collectedAccounts', label: '#Collected Accounts' },
        { key: 'clientsVisited', label: 'Clients Visited' },
        { key: 'p2pReceivedOverall', label: 'P2P received Overall' },
        { key: 'p2pReceivedVisitedClients', label: 'P2P received Visited Clients' },
        { key: 'collectedAmount', label: '#Collected Amount' },
        { key: 'clientsNotVisited', label: 'Clients Not Visited' },
        { key: 'p2pConverted', label: 'P2P Converted' }
      ]
      exportTableToExcel(dpdData, headers, 'DPD_Collection_Efficiency_Summary')
    }

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">DPD Collection Efficiency Summary</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>DPD</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>Cases Allocated</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>Total OutStanding POS</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>OD Amount + Current Due</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>#Collected Accounts</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>Clients Visited</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>P2P received Overall</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#B3E5FC', color: '#003366' }}>P2P received Visited Clients</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>#Collected Amount</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>Clients Not Visited</th>
                <th className="text-right py-2 px-2 font-semibold" style={{ backgroundColor: '#FFEB3B', color: '#003366' }}>P2P Converted</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {dpdData.map((row, index) => (
                <tr key={index} className={row.dpd === 'Total' ? 'bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.dpd}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.casesAllocated)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.totalOutstandingPOS)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.odAmountCurrentDue)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.collectedAccounts)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.clientsVisited)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.p2pReceivedOverall)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.p2pReceivedVisitedClients)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.collectedAmount)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.clientsNotVisited)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatNumber(row.p2pConverted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render Application Status Summary table
  const renderApplicationStatusSummaryTable = () => {
    const applicationData = [
      { status: 'Rejected', numberOfApplications: 399835 },
      { status: 'Pending For Approval', numberOfApplications: 91690 },
      { status: 'Approved', numberOfApplications: 664 },
      { status: 'Pending to Initiate', numberOfApplications: 556 },
      { status: 'More Info Required', numberOfApplications: 6 },
      { status: 'Reassigned', numberOfApplications: 6 }
    ]
    const total = applicationData.reduce((acc, row) => acc + row.numberOfApplications, 0)

    const handleExport = () => {
      const headers = [
        { key: 'status', label: 'Status' },
        { key: 'numberOfApplications', label: 'Number of Applications' }
      ]
      const exportData = [...applicationData, { status: 'Summary', numberOfApplications: total }]
      exportTableToExcel(exportData, headers, 'Application_Status_Summary')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 text-[#003366] p-3 text-lg font-semibold flex justify-between items-center">
          <span>Application Status Summary</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Applications</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicationData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.numberOfApplications.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                  <span>Summary</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render Repossession Status Summary table
  const renderRepossessionStatusSummaryTable = () => {
    const repossessionData = [
      { status: 'Rejected', numberOfCases: 15383 },
      { status: 'Approved', numberOfCases: 563 },
      { status: 'Pending For Approval', numberOfCases: 21 },
      { status: 'Pending to Initiate', numberOfCases: 2 },
      { status: 'More Info Required', numberOfCases: 1 }
    ]
    const total = repossessionData.reduce((acc, row) => acc + row.numberOfCases, 0)

    const handleExport = () => {
      const headers = [
        { key: 'status', label: 'Status' },
        { key: 'numberOfCases', label: 'Number of Cases' }
      ]
      const exportData = [...repossessionData, { status: 'Summary', numberOfCases: total }]
      exportTableToExcel(exportData, headers, 'Repossession_Status_Summary')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 text-[#003366] p-3 text-lg font-semibold flex justify-between items-center">
          <span>Repossession Status Summary</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Number of Cases</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {repossessionData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{row.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{row.numberOfCases.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                  <span>Summary</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">{total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render Vertical Summary table
  // Reusable pagination component with modern design
  const renderPagination = (currentPage, setCurrentPage, totalItems, itemsPerPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (totalPages <= 1) return null

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
      }
    }

    // Calculate visible page range with ellipsis
    const getVisiblePages = () => {
      const maxVisible = 5
      const pages = []
      
      if (totalPages <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)
        
        let start = Math.max(2, currentPage - 1)
        let end = Math.min(totalPages - 1, currentPage + 1)
        
        // Adjust if we're near the start
        if (currentPage <= 3) {
          end = Math.min(4, totalPages - 1)
        }
        // Adjust if we're near the end
        if (currentPage >= totalPages - 2) {
          start = Math.max(2, totalPages - 3)
        }
        
        // Add ellipsis after first page if needed
        if (start > 2) {
          pages.push('ellipsis-start')
        }
        
        // Add middle pages
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        // Add ellipsis before last page if needed
        if (end < totalPages - 1) {
          pages.push('ellipsis-end')
        }
        
        // Always show last page
        pages.push(totalPages)
      }
      
      return pages
    }

    const visiblePages = getVisiblePages()

    return (
      <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
        <div className="flex items-center">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> entries
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer'
            }`}
          >
            Previous
          </button>
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500 text-sm">
                  ...
                </span>
              )
            }
            return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-w-[36px] ${
                page === currentPage
                    ? 'bg-red-600 text-white cursor-pointer shadow-sm'
                  : 'bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer'
              }`}
            >
              {page}
            </button>
            )
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  const renderProductSummaryTable = () => {
    // Use API data if available, otherwise use fallback data with zeros
    const defaultProductData = [
      { product: 'CE', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'CV', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'DLLS', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'ICV', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'LCV', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'SA', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'TFE', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'VWFN', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'VWFS', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 }
    ]
    // If API has been called (not loading) and returned empty array, show "No data available"
    // Otherwise use API data if available, or default data
    const hasApiData = verticalSummaryData !== null && verticalSummaryData !== undefined
    const productData = verticalSummaryData && verticalSummaryData.length > 0 ? verticalSummaryData : (hasApiData && verticalSummaryData.length === 0 ? [] : defaultProductData)
    const totals = productData.reduce((acc, row) => ({
      total: acc.total + (row.total || 0),
      good: acc.good + (row.good || 0),
      npa: acc.npa + (row.npa || 0),
      sma0: acc.sma0 + (row.sma0 || 0),
      sma1: acc.sma1 + (row.sma1 || 0),
      sma2: acc.sma2 + (row.sma2 || 0)
    }), { total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    const headers = [
      { key: 'product', label: 'VERTICAL' },
      { key: 'total', label: 'TOTAL' },
      { key: 'good', label: 'GOOD' },
      { key: 'npa', label: 'NPA' },
      { key: 'sma0', label: 'SMA0' },
      { key: 'sma1', label: 'SMA1' },
      { key: 'sma2', label: 'SMA2' },
    ]

    const handleExport = () => {
      const exportData = [...productData, { 
        product: 'Total', 
        total: totals.total, 
        good: totals.good, 
        npa: totals.npa, 
        sma0: totals.sma0, 
        sma1: totals.sma1, 
        sma2: totals.sma2 
      }]
      exportTableToExcel(exportData, headers, 'Vertical_Summary')
    }

    // Pagination logic
    const startIndex = (productSummaryPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = productData.slice(startIndex, endIndex)
    const totalPages = Math.ceil(productData.length / itemsPerPage)

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Vertical Summary</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        {verticalDataLoading ? (
          <div className="py-12 px-8 text-center">
            <div 
              className="inline-block animate-spin h-10 w-10 border-4 border-red-600" 
              style={{ borderRadius: '0' }}
            ></div>
            <p className="mt-4 text-sm font-medium text-gray-600">Loading data...</p>
          </div>
        ) : verticalDataError ? (
          <div className="p-4 text-center text-red-600">Error: {verticalDataError}</div>
        ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="bg-gray-100 text-[#003366] sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold">VERTICAL</th>
                <th className="text-right py-2 px-2 font-semibold">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold">GOOD</th>
                <th className="text-right py-2 px-2 font-semibold">NPA</th>
                <th className="text-right py-2 px-2 font-semibold">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
                {hasApiData && verticalSummaryData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  <>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.product}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.total || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.good || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.npa || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma0 || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma1 || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2 || 0)}</td>
                </tr>
              ))}
              {endIndex >= productData.length && (
                <tr className="bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300">
                  <td className="py-2 px-2">Totals</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.total)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.good)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.npa)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma0)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma1)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
                </tr>
                    )}
                  </>
              )}
            </tbody>
          </table>
        </div>
        )}
        {!verticalDataLoading && !verticalDataError && renderPagination(productSummaryPage, setProductSummaryPage, productData.length, itemsPerPage)}
      </div>
    )
  }

  // Helper function to render Vertical Allocation Summary table
  const renderProductAllocationTable = () => {
    // Use API data if available, otherwise use fallback data with zeros
    const defaultAllocationData = [
      { product: 'CE', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'CV', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'DLLS', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'ICV', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'LCV', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'SA', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'TFE', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'VWFN', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 },
      { product: 'VWFS', total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 }
    ]
    // If API has been called (not loading) and returned empty array, show "No data available"
    // Otherwise use API data if available, or default data
    const hasApiData = verticalAllocationData !== null && verticalAllocationData !== undefined
    const allocationData = verticalAllocationData && verticalAllocationData.length > 0 ? verticalAllocationData : (hasApiData && verticalAllocationData.length === 0 ? [] : defaultAllocationData)
    const totals = allocationData.reduce((acc, row) => ({
      total: acc.total + (row.total || 0),
      good: acc.good + (row.good || 0),
      npa: acc.npa + (row.npa || 0),
      sma0: acc.sma0 + (row.sma0 || 0),
      sma1: acc.sma1 + (row.sma1 || 0),
      sma2: acc.sma2 + (row.sma2 || 0)
    }), { total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    const headers = [
      { key: 'product', label: 'VERTICAL' },
      { key: 'total', label: 'TOTAL' },
      { key: 'good', label: 'GOOD' },
      { key: 'npa', label: 'NPA' },
      { key: 'sma0', label: 'SMA0' },
      { key: 'sma1', label: 'SMA1' },
      { key: 'sma2', label: 'SMA2' },
    ]

    const handleExport = () => {
      const exportData = [...allocationData, { 
        product: 'Total', 
        total: totals.total, 
        good: totals.good, 
        npa: totals.npa, 
        sma0: totals.sma0, 
        sma1: totals.sma1, 
        sma2: totals.sma2 
      }]
      exportTableToExcel(exportData, headers, 'Vertical_Allocation_Summary')
    }

    // Pagination logic
    const startIndex = (productAllocationPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = allocationData.slice(startIndex, endIndex)

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Vertical Allocation Summary</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        {verticalDataLoading ? (
          <div className="py-12 px-8 text-center">
            <div 
              className="inline-block animate-spin h-10 w-10 border-4 border-red-600" 
              style={{ borderRadius: '0' }}
            ></div>
            <p className="mt-4 text-sm font-medium text-gray-600">Loading data...</p>
          </div>
        ) : verticalDataError ? (
          <div className="p-4 text-center text-red-600">Error: {verticalDataError}</div>
        ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="bg-gray-100 text-[#003366] sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold">VERTICAL</th>
                <th className="text-right py-2 px-2 font-semibold">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold">GOOD</th>
                <th className="text-right py-2 px-2 font-semibold">NPA</th>
                <th className="text-right py-2 px-2 font-semibold">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
                {hasApiData && verticalAllocationData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  <>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.product}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.total || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.good || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.npa || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma0 || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma1 || 0)}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2 || 0)}</td>
                </tr>
              ))}
              {endIndex >= allocationData.length && (
                <tr className="bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300">
                  <td className="py-2 px-2">Totals</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.total)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.good)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.npa)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma0)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma1)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
                </tr>
                    )}
                  </>
              )}
            </tbody>
          </table>
        </div>
        )}
        {!verticalDataLoading && !verticalDataError && renderPagination(productAllocationPage, setProductAllocationPage, allocationData.length, itemsPerPage)}
      </div>
    )
  }

  // Generic function to render allocation tables with API data
  const renderGenericAllocationTable = (tableData, tableTitle, exportName, currentPage, setCurrentPage) => {
    // Use API data if available, otherwise use empty array
    const data = tableData && tableData.length > 0 ? tableData : []
    const totals = data.reduce((acc, row) => ({
      total: acc.total + (row.total || 0),
      good: acc.good + (row.good || 0),
      npa: acc.npa + (row.npa || 0),
      sma0: acc.sma0 + (row.sma0 || 0),
      sma1: acc.sma1 + (row.sma1 || 0),
      sma2: acc.sma2 + (row.sma2 || 0)
    }), { total: 0, good: 0, npa: 0, sma0: 0, sma1: 0, sma2: 0 })

    const headers = [
      { key: 'product', label: 'VERTICAL' },
      { key: 'total', label: 'TOTAL' },
      { key: 'good', label: 'GOOD' },
      { key: 'npa', label: 'NPA' },
      { key: 'sma0', label: 'SMA0' },
      { key: 'sma1', label: 'SMA1' },
      { key: 'sma2', label: 'SMA2' },
    ]

    const handleExport = () => {
      const exportData = [...data, { 
        product: 'Total', 
        total: totals.total, 
        good: totals.good, 
        npa: totals.npa, 
        sma0: totals.sma0, 
        sma1: totals.sma1, 
        sma2: totals.sma2 
      }]
      exportTableToExcel(exportData, headers, exportName)
    }

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = data.slice(startIndex, endIndex)

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">{tableTitle}</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        {verticalDataLoading ? (
          <div className="py-12 px-8 text-center">
            <div 
              className="inline-block animate-spin h-10 w-10 border-4 border-red-600" 
              style={{ borderRadius: '0' }}
            ></div>
            <p className="mt-4 text-sm font-medium text-gray-600">Loading data...</p>
          </div>
        ) : verticalDataError ? (
          <div className="p-4 text-center text-red-600">Error: {verticalDataError}</div>
        ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="bg-gray-100 text-[#003366] sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold">VERTICAL</th>
                <th className="text-right py-2 px-2 font-semibold">TOTAL</th>
                <th className="text-right py-2 px-2 font-semibold">GOOD</th>
                <th className="text-right py-2 px-2 font-semibold">NPA</th>
                <th className="text-right py-2 px-2 font-semibold">SMA0</th>
                <th className="text-right py-2 px-2 font-semibold">SMA1</th>
                <th className="text-right py-2 px-2 font-semibold">SMA2</th>
              </tr>
            </thead>
            <tbody className="bg-white">
                {!tableData || tableData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                <>
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-2 text-gray-800 font-medium">{row.product}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.total || 0)}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.good || 0)}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.npa || 0)}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma0 || 0)}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma1 || 0)}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.sma2 || 0)}</td>
                    </tr>
                  ))}
                  {endIndex >= data.length && (
                    <tr className="bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300">
                      <td className="py-2 px-2">Totals</td>
                      <td className="py-2 px-2 text-right">{formatIndianNumber(totals.total)}</td>
                      <td className="py-2 px-2 text-right">{formatIndianNumber(totals.good)}</td>
                      <td className="py-2 px-2 text-right">{formatIndianNumber(totals.npa)}</td>
                      <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma0)}</td>
                      <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma1)}</td>
                      <td className="py-2 px-2 text-right">{formatIndianNumber(totals.sma2)}</td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
        {!verticalDataLoading && !verticalDataError && renderPagination(currentPage, setCurrentPage, data.length, itemsPerPage)}
      </div>
    )
  }

  // Helper function to render NCM Allocation Summary table
  const renderNCMAllocationTable = () => {
    return renderGenericAllocationTable(ncmData, 'NCM Allocation Summary', 'NCM_Allocation_Summary', ncmAllocationPage, setNCMAllocationPage)
  }

  // Helper function to render RCM Allocation Summary table
  const renderRCMAllocationTable = () => {
    return renderGenericAllocationTable(rcmData, 'RCM Allocation Summary', 'RCM_Allocation_Summary', rcmAllocationPage, setRCMAllocationPage)
  }


  // Helper function to render ACM Allocation Summary table
  const renderACMAllocationTable = () => {
    return renderGenericAllocationTable(acmData, 'ACM Allocation Summary', 'ACM_Allocation_Summary', acmAllocationPage, setACMAllocationPage)
  }

  // Helper function to render ALLOCATION_ADMIN Allocation Summary table
  const renderAllocationAdminTable = () => {
    return renderGenericAllocationTable(allocationAdminData, 'Allocation Admin Summary', 'ALLOCATION_ADMIN_Summary', allocationAdminPage, setAllocationAdminPage)
  }

  // Helper function to render BO Allocation Summary table
  const renderBOTable = () => {
    return renderGenericAllocationTable(boData, 'BO Allocation Summary', 'BO_Summary', boPage, setBoPage)
  }

  // Helper function to render CLM Allocation Summary table
  const renderCLMTable = () => {
    return renderGenericAllocationTable(clmData, 'CLM Allocation Summary', 'CLM_Summary', clmPage, setClmPage)
  }

  // Helper function to render DTR Allocation Summary table
  const renderDTRTable = () => {
    return renderGenericAllocationTable(dtrData, 'DTR Allocation Summary', 'DTR_Summary', dtrPage, setDtrPage)
  }

  // Helper function to render TCM Allocation Summary table
  const renderTCMTable = () => {
    return renderGenericAllocationTable(tcmData, 'TCM Allocation Summary', 'TCM_Summary', tcmPage, setTcmPage)
  }


  // Helper function to render State Wise Summary table
  const renderStateWiseSummaryTable = () => {
    const hasApiData = stateWiseData !== null && stateWiseData !== undefined
    const stateData = stateWiseData && stateWiseData.length > 0 ? stateWiseData : []
    const totals = stateData.reduce((acc, row) => ({
      totalCases: acc.totalCases + (row.totalCases || 0),
      outstandingBalance: acc.outstandingBalance + (parseFloat(row.outstandingBalance) || 0),
      resolutionCount: acc.resolutionCount + (row.resolutionCount || 0),
      resolutionAmount: acc.resolutionAmount + (parseFloat(row.resolutionAmount) || 0)
    }), { totalCases: 0, outstandingBalance: 0, resolutionCount: 0, resolutionAmount: 0 })
    const totalResolutionCountPercent = totals.totalCases > 0 ? ((totals.resolutionCount / totals.totalCases) * 100).toFixed(2) : 0
    const totalResolutionAmountPercent = totals.outstandingBalance > 0 ? ((totals.resolutionAmount / totals.outstandingBalance) * 100).toFixed(2) : 0

    const headers = [
      { key: 'state', label: 'State' },
      { key: 'totalCases', label: 'Total Cases' },
      { key: 'outstandingBalance', label: 'Outstanding Balance (in Cr.)' },
      { key: 'resolutionCount', label: 'Resolution Count' },
      { key: 'resolutionCountPercent', label: 'Resolution Count%' },
      { key: 'resolutionAmount', label: 'Resolution Amount' },
      { key: 'resolutionAmountPercent', label: 'Resolution Amount %' },
    ]

    const handleExport = () => {
      const exportData = [...stateData, { 
        state: 'Total', 
        totalCases: totals.totalCases, 
        outstandingBalance: totals.outstandingBalance, 
        resolutionCount: totals.resolutionCount, 
        resolutionCountPercent: totalResolutionCountPercent, 
        resolutionAmount: totals.resolutionAmount, 
        resolutionAmountPercent: totalResolutionAmountPercent 
      }]
      exportTableToExcel(exportData, headers, 'State_Wise_Summary')
    }

    // Pagination logic
    const startIndex = (stateWisePage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = stateData.slice(startIndex, endIndex)

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">State Wise Summary</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        {collectionDataError ? (
          <div className="p-4 text-center text-red-600">Error: {collectionDataError}</div>
        ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="bg-gray-100 text-[#003366] sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold">State</th>
                <th className="text-right py-2 px-2 font-semibold">Total Cases</th>
                <th className="text-right py-2 px-2 font-semibold">Outstanding Balance (in Cr.)</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Count</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Count%</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Amount</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Amount %</th>
              </tr>
            </thead>
            <tbody className="bg-white">
                {hasApiData && stateData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  <>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.state}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.totalCases || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(parseFloat(row.outstandingBalance) || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.resolutionCount || 0)}</td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                            <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className="bg-green-500 h-4 rounded-full transition-all relative flex items-center justify-center" 
                                style={{ width: `${Math.min(Math.max(parseFloat(row.resolutionCountPercent) || 0, 0), 100)}%`, minWidth: parseFloat(row.resolutionCountPercent) > 0 ? '2px' : '0' }}
                              >
                                {parseFloat(row.resolutionCountPercent) > 5 && (
                                  <span className="text-[10px] text-white font-medium whitespace-nowrap">
                                    {(parseFloat(row.resolutionCountPercent) || 0).toFixed(2)}%
                                  </span>
                                )}
                      </div>
                            </div>
                            <span className="text-gray-700 min-w-[50px] text-right font-medium text-xs">{(parseFloat(row.resolutionCountPercent) || 0).toFixed(2)}%</span>
                    </div>
                  </td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(parseFloat(row.resolutionAmount) || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{(parseFloat(row.resolutionAmountPercent) || 0).toFixed(2)}%</td>
                </tr>
              ))}
                    {endIndex >= stateData.length && stateData.length > 0 && (
                <tr className="bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300">
                  <td className="py-2 px-2">Totals</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.totalCases)}</td>
                        <td className="py-2 px-2 text-right">{formatIndianNumber(totals.outstandingBalance)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.resolutionCount)}</td>
                  <td className="py-2 px-2 text-right">{totalResolutionCountPercent}%</td>
                        <td className="py-2 px-2 text-right">{formatIndianNumber(totals.resolutionAmount)}</td>
                <td className="py-2 px-2 text-right">{totalResolutionAmountPercent}%</td>
              </tr>
                    )}
                  </>
              )}
            </tbody>
          </table>
        </div>
        )}
        {!collectionDataLoading && !collectionDataError && renderPagination(stateWisePage, setStateWisePage, stateData.length, itemsPerPage)}
      </div>
    )
  }

  // Helper function to render Region Wise Summary table
  const renderRegionWiseSummaryTable = () => {
    const hasApiData = regionWiseData !== null && regionWiseData !== undefined
    const regionData = regionWiseData && regionWiseData.length > 0 ? regionWiseData : []
    const totals = regionData.reduce((acc, row) => ({
      cases: acc.cases + (row.cases || 0),
      outstandingBalance: acc.outstandingBalance + (parseFloat(row.outstandingBalance) || 0),
      resolutionCount: acc.resolutionCount + (row.resolutionCount || 0),
      resolutionAmount: acc.resolutionAmount + (parseFloat(row.resolutionAmount) || 0)
    }), { cases: 0, outstandingBalance: 0, resolutionCount: 0, resolutionAmount: 0 })
    const totalResolutionCountPercent = totals.cases > 0 ? ((totals.resolutionCount / totals.cases) * 100).toFixed(2) : 0
    const totalResolutionAmountPercent = totals.outstandingBalance > 0 ? ((totals.resolutionAmount / totals.outstandingBalance) * 100).toFixed(2) : 0

    const headers = [
      { key: 'region', label: 'Region' },
      { key: 'cases', label: 'Cases' },
      { key: 'outstandingBalance', label: 'Outstanding balance' },
      { key: 'resolutionCount', label: 'Resolution count' },
      { key: 'resolutionCountPercent', label: 'Resolution Count%' },
      { key: 'resolutionAmount', label: 'Resolution amount' },
      { key: 'resolutionAmountPercent', label: 'Resolution Amount %' },
    ]

    const handleExport = () => {
      const exportData = [...regionData, { 
        region: 'Total', 
        cases: totals.cases, 
        outstandingBalance: totals.outstandingBalance, 
        resolutionCount: totals.resolutionCount, 
        resolutionCountPercent: totalResolutionCountPercent, 
        resolutionAmount: totals.resolutionAmount, 
        resolutionAmountPercent: totalResolutionAmountPercent 
      }]
      exportTableToExcel(exportData, headers, 'Region_Wise_Summary')
    }

    // Pagination logic
    const startIndex = (regionWisePage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = regionData.slice(startIndex, endIndex)

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Region Wise Summary</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        {collectionDataError ? (
          <div className="p-4 text-center text-red-600">Error: {collectionDataError}</div>
        ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="bg-gray-100 text-[#003366] sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold">Region</th>
                <th className="text-right py-2 px-2 font-semibold">Cases</th>
                <th className="text-right py-2 px-2 font-semibold">Outstanding balance</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution count</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Count%</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution amount</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Amount%</th>
              </tr>
            </thead>
            <tbody className="bg-white">
                {hasApiData && regionData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  <>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.region}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.cases || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(parseFloat(row.outstandingBalance) || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.resolutionCount || 0)}</td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                            <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className="bg-green-500 h-4 rounded-full transition-all relative flex items-center justify-center" 
                                style={{ width: `${Math.min(Math.max(parseFloat(row.resolutionCountPercent) || 0, 0), 100)}%`, minWidth: parseFloat(row.resolutionCountPercent) > 0 ? '2px' : '0' }}
                              >
                                {parseFloat(row.resolutionCountPercent) > 5 && (
                                  <span className="text-[10px] text-white font-medium whitespace-nowrap">
                                    {(parseFloat(row.resolutionCountPercent) || 0).toFixed(2)}%
                                  </span>
                                )}
                      </div>
                            </div>
                            <span className="text-gray-700 min-w-[50px] text-right font-medium text-xs">{(parseFloat(row.resolutionCountPercent) || 0).toFixed(2)}%</span>
                    </div>
                  </td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(parseFloat(row.resolutionAmount) || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{(parseFloat(row.resolutionAmountPercent) || 0).toFixed(2)}%</td>
                </tr>
              ))}
                    {endIndex >= regionData.length && regionData.length > 0 && (
                <tr className="bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300">
                  <td className="py-2 px-2">Totals</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.cases)}</td>
                        <td className="py-2 px-2 text-right">{formatIndianNumber(totals.outstandingBalance)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.resolutionCount)}</td>
                  <td className="py-2 px-2 text-right">{totalResolutionCountPercent}%</td>
                        <td className="py-2 px-2 text-right">{formatIndianNumber(totals.resolutionAmount)}</td>
                <td className="py-2 px-2 text-right">{totalResolutionAmountPercent}%</td>
              </tr>
                    )}
                  </>
              )}
            </tbody>
          </table>
        </div>
        )}
        {!collectionDataLoading && !collectionDataError && renderPagination(regionWisePage, setRegionWisePage, regionData.length, itemsPerPage)}
      </div>
    )
  }

  // Helper function to render Bucket Wise Summary table
  const renderBucketWiseSummaryTable = () => {
    const hasApiData = bucketWiseData !== null && bucketWiseData !== undefined
    const bucketData = bucketWiseData && bucketWiseData.length > 0 ? bucketWiseData : []
    const totals = bucketData.reduce((acc, row) => ({
      cases: acc.cases + (row.cases || 0),
      outstandingBalance: acc.outstandingBalance + (parseFloat(row.outstandingBalance) || 0),
      resolutionCount: acc.resolutionCount + (row.resolutionCount || 0),
      resolutionAmount: acc.resolutionAmount + (parseFloat(row.resolutionAmount) || 0)
    }), { cases: 0, outstandingBalance: 0, resolutionCount: 0, resolutionAmount: 0 })
    const totalResolutionCountPercent = totals.cases > 0 ? ((totals.resolutionCount / totals.cases) * 100).toFixed(2) : 0
    const totalResolutionAmountPercent = totals.outstandingBalance > 0 ? ((totals.resolutionAmount / totals.outstandingBalance) * 100).toFixed(2) : 0

    const headers = [
      { key: 'bucket', label: 'Bucket' },
      { key: 'cases', label: 'Cases' },
      { key: 'outstandingBalance', label: 'Outstanding balance' },
      { key: 'resolutionCount', label: 'Resolution count' },
      { key: 'resolutionCountPercent', label: 'Resolution Count%' },
      { key: 'resolutionAmount', label: 'Resolution amount' },
      { key: 'resolutionAmountPercent', label: 'Resolution Amount %' },
    ]

    const handleExport = () => {
      const exportData = [...bucketData, { 
        bucket: 'Total', 
        cases: totals.cases, 
        outstandingBalance: totals.outstandingBalance, 
        resolutionCount: totals.resolutionCount, 
        resolutionCountPercent: totalResolutionCountPercent, 
        resolutionAmount: totals.resolutionAmount, 
        resolutionAmountPercent: totalResolutionAmountPercent 
      }]
      exportTableToExcel(exportData, headers, 'Bucket_Wise_Summary')
    }

    // Pagination logic
    const startIndex = (bucketWisePage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedData = bucketData.slice(startIndex, endIndex)

    return (
      <div className="bg-white border border-[#003366] rounded-lg overflow-hidden mt-16">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Bucket Wise Summary</h3>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        {collectionDataError ? (
          <div className="p-4 text-center text-red-600">Error: {collectionDataError}</div>
        ) : (
        <div className="overflow-x-auto max-h-96 overflow-y-auto table-scroll-container">
          <table className="w-full text-xs border border-[#003366]">
            <thead className="bg-gray-100 text-[#003366] sticky top-0">
              <tr>
                <th className="text-left py-2 px-2 font-semibold">Bucket</th>
                <th className="text-right py-2 px-2 font-semibold">Cases</th>
                <th className="text-right py-2 px-2 font-semibold">Outstanding balance</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution count</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Count%</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution amount</th>
                <th className="text-right py-2 px-2 font-semibold">Resolution Amount%</th>
              </tr>
            </thead>
            <tbody className="bg-white">
                {hasApiData && bucketData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-2 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  <>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : (row.bucket === 'X bucket = 1-30' || row.bucket === '>180' ? 'bg-yellow-50' : 'bg-gray-50')}>
                  <td className="py-2 px-2 text-gray-800 font-medium">{row.bucket}</td>
                        <td className={`py-2 px-2 text-right ${row.bucket === 'X bucket = 1-30' || row.bucket === '>180' ? 'bg-yellow-100 font-semibold' : 'text-gray-700'}`}>{formatIndianNumber(row.cases || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(parseFloat(row.outstandingBalance) || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(row.resolutionCount || 0)}</td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                            <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-4 relative overflow-hidden">
                              <div 
                                className="bg-green-500 h-4 rounded-full transition-all relative flex items-center justify-center" 
                                style={{ width: `${Math.min(Math.max(parseFloat(row.resolutionCountPercent) || 0, 0), 100)}%`, minWidth: parseFloat(row.resolutionCountPercent) > 0 ? '2px' : '0' }}
                              >
                                {parseFloat(row.resolutionCountPercent) > 5 && (
                                  <span className="text-[10px] text-white font-medium whitespace-nowrap">
                                    {(parseFloat(row.resolutionCountPercent) || 0).toFixed(2)}%
                                  </span>
                                )}
                      </div>
                            </div>
                            <span className="text-gray-700 min-w-[50px] text-right font-medium text-xs">{(parseFloat(row.resolutionCountPercent) || 0).toFixed(2)}%</span>
                    </div>
                  </td>
                        <td className="py-2 px-2 text-right text-gray-700">{formatIndianNumber(parseFloat(row.resolutionAmount) || 0)}</td>
                        <td className="py-2 px-2 text-right text-gray-700">{(parseFloat(row.resolutionAmountPercent) || 0).toFixed(2)}%</td>
                </tr>
              ))}
                    {endIndex >= bucketData.length && bucketData.length > 0 && (
                <tr className="bg-gray-100 text-gray-900 font-semibold border-t-2 border-gray-300">
                  <td className="py-2 px-2">Totals</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.cases)}</td>
                        <td className="py-2 px-2 text-right">{formatIndianNumber(totals.outstandingBalance)}</td>
                  <td className="py-2 px-2 text-right">{formatIndianNumber(totals.resolutionCount)}</td>
                  <td className="py-2 px-2 text-right">{totalResolutionCountPercent}%</td>
                        <td className="py-2 px-2 text-right">{formatIndianNumber(totals.resolutionAmount)}</td>
                <td className="py-2 px-2 text-right">{totalResolutionAmountPercent}%</td>
              </tr>
                    )}
                  </>
              )}
            </tbody>
          </table>
        </div>
        )}
        {!collectionDataLoading && !collectionDataError && renderPagination(bucketWisePage, setBucketWisePage, bucketData.length, itemsPerPage)}
      </div>
    )
  }

  // Helper function to render MTD Productivity Report table
  const renderMTDProductivityReportTable = () => {
    const data = []

    const totals = {
      totalAllocated: 0,
      visitsWeb: 0,
      visitsField: 0,
      visitsAccounts: 0,
      avgIntensity: 0,
      numPaid: 0,
      efficiency: 0,
      paidPercent: 0,
      numPTP: 0,
      numDL: 0,
    }

    const headers = [
      { key: 'smartCollId', label: 'SMART COLL ID' },
      { key: 'name', label: 'NAME' },
      { key: 'agency', label: 'AGENCY' },
      { key: 'role', label: 'Role' },
      { key: 'totalAllocated', label: 'Total Allocated' },
      { key: 'visitsWeb', label: '# of visits via Web' },
      { key: 'visitsField', label: '# of visits via Field' },
      { key: 'visitsAccounts', label: '# of visits (Accounts)' },
      { key: 'avgIntensity', label: 'Average Intensity' },
      { key: 'numPaid', label: '# of Paid' },
      { key: 'efficiency', label: 'Efficiency%' },
      { key: 'paidPercent', label: 'Paid %' },
      { key: 'numPTP', label: '# of PTP' },
      { key: 'numDL', label: '# of DL' },
    ]

    const handleExport = () => {
      const exportData = [...data, { 
        smartCollId: 'Totals', 
        name: '', 
        agency: '', 
        role: '', 
        totalAllocated: totals.totalAllocated, 
        visitsWeb: totals.visitsWeb, 
        visitsField: totals.visitsField, 
        visitsAccounts: totals.visitsAccounts, 
        avgIntensity: totals.avgIntensity, 
        numPaid: totals.numPaid, 
        efficiency: totals.efficiency, 
        paidPercent: totals.paidPercent, 
        numPTP: totals.numPTP, 
        numDL: totals.numDL 
      }]
      exportTableToExcel(exportData, headers, 'MTD_Productivity_Report')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
          <span>MTD Productivity Report</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMART COLL ID</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AGENCY</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Allocated</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits via Web</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits via Field</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits (Accounts)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Intensity</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Paid</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency%</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid %</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of PTP</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of DL</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.smartCollId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.agency}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.role}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.totalAllocated}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsWeb}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsField}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsAccounts}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.avgIntensity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.numPaid}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.efficiency}%</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.paidPercent}%</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.numPTP}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.numDL}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900" colSpan="4">Totals</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.totalAllocated}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsWeb}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsField}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsAccounts}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.avgIntensity}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.numPaid}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.efficiency}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.paidPercent}%</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.numPTP}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.numDL}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render FTD Productivity Report table
  const renderFTDProductivityReportTable = () => {
    const ftdData = []

    const totals = {
      webVisits: 0,
      visitsAccounts: 0,
      fieldVisits: 0,
      ptp: 0,
      paid: 0,
      ptpPercent: 0,
      avgIntensity: 0,
      paidPercent: 0,
    }

    const headers = [
      { key: 'smartCollId', label: 'SMART COLL ID' },
      { key: 'name', label: 'NAME' },
      { key: 'agency', label: 'AGENCY' },
      { key: 'webVisits', label: '# of web Visits' },
      { key: 'visitsAccounts', label: '# of visits(Accounts)' },
      { key: 'fieldVisits', label: '# of field visits' },
      { key: 'ptp', label: '# of PTP' },
      { key: 'paid', label: '# of Paid' },
      { key: 'ptpPercent', label: 'PTP%' },
      { key: 'avgIntensity', label: 'Avg Intensity' },
      { key: 'paidPercent', label: 'Paid%' },
    ]

    const handleExport = () => {
      const exportData = [...ftdData, { 
        smartCollId: 'Totals', 
        name: '', 
        agency: '', 
        webVisits: totals.webVisits, 
        visitsAccounts: totals.visitsAccounts, 
        fieldVisits: totals.fieldVisits, 
        ptp: totals.ptp, 
        paid: totals.paid, 
        ptpPercent: totals.ptpPercent, 
        avgIntensity: totals.avgIntensity, 
        paidPercent: totals.paidPercent 
      }]
      exportTableToExcel(exportData, headers, 'FTD_Productivity_Report')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
          <span>FTD Productivity Report</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMART COLL ID</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AGENCY</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of web Visits</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits(Accounts)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of field visits</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of PTP</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Paid</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTP%</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Intensity</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid%</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ftdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.smartCollId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.agency}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.webVisits}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsAccounts}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.fieldVisits}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.ptp}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.paid}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.ptpPercent}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.avgIntensity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.paidPercent}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900" colSpan="3">Totals</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.webVisits}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsAccounts}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.fieldVisits}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.ptp}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.paid}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.ptpPercent}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.avgIntensity}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.paidPercent}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render MTD Collector Summary Report table
  const renderMTDCollectorSummaryReportTable = () => {
    const mtdData = []

    const headers = [
      { key: 'smartCollId', label: 'SMART COLL ID' },
      { key: 'name', label: 'NAME' },
      { key: 'agency', label: 'AGENCY' },
      { key: 'visits', label: '# of Visits' },
      { key: 'visitsAccounts', label: '# of visits(Accounts)' },
      { key: 'ptp', label: 'PTP' },
      { key: 'rtp', label: 'RTP' },
      { key: 'nc', label: 'NC' },
      { key: 'dl', label: 'DL' },
      { key: 'positive', label: 'POSITIVE' },
      { key: 'negative', label: 'NEGATIVE' },
      { key: 'tos', label: 'TOS' },
    ]

    const handleExport = () => {
      exportTableToExcel(mtdData, headers, 'MTD_Collector_Summary_Report')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
          <span>MTD Collector Summary Report</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMART COLL ID</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AGENCY</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Visits</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits(Accounts)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTP</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RTP</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NC</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DL</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POSITIVE</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NEGATIVE</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mtdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.smartCollId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.agency}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visits}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsAccounts}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.ptp}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.rtp}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.nc}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.dl}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.positive}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.negative}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.tos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render FTD Collector Summary Report table
  const renderFTDCollectorSummaryReportTable = () => {
    const ftdData = []

    const totals = {
      visits: 0,
      visitsAccounts: 0,
      ptp: 0,
      rtp: 0,
      nc: 0,
      dl: 0,
      negative: 0,
      positive: 0,
      tos: '0',
    }

    const headers = [
      { key: 'smartCollId', label: 'SMART COLL ID' },
      { key: 'name', label: 'NAME' },
      { key: 'agency', label: 'AGENCY' },
      { key: 'visits', label: '# of Visits' },
      { key: 'visitsAccounts', label: '# of visits(Accounts)' },
      { key: 'ptp', label: 'PTP' },
      { key: 'rtp', label: 'RTP' },
      { key: 'nc', label: 'NC' },
      { key: 'dl', label: 'DL' },
      { key: 'negative', label: 'NEGATIVE' },
      { key: 'positive', label: 'POSITIVE' },
      { key: 'tos', label: 'TOS' },
    ]

    const handleExport = () => {
      const exportData = [...ftdData, { 
        smartCollId: 'Totals', 
        name: '', 
        agency: '', 
        visits: totals.visits, 
        visitsAccounts: totals.visitsAccounts, 
        ptp: totals.ptp, 
        rtp: totals.rtp, 
        nc: totals.nc, 
        dl: totals.dl, 
        negative: totals.negative, 
        positive: totals.positive, 
        tos: totals.tos 
      }]
      exportTableToExcel(exportData, headers, 'FTD_Collector_Summary_Report')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
          <span>FTD Collector Summary Report</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMART COLL ID</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AGENCY</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Visits</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits(Accounts)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTP</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RTP</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NC</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DL</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NEGATIVE</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POSITIVE</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ftdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.smartCollId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.agency}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visits}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsAccounts}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.ptp}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.rtp}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.nc}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.dl}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.negative}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.positive}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.tos}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900" colSpan="3">Totals</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visits}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsAccounts}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.ptp}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.rtp}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.nc}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.dl}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.negative}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.positive}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.tos}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render MTD Time-Wise Visit Report table
  const renderMTDTimeWiseVisitReportTable = () => {
    const mtdData = []

    const totals = {
      visits: '0',
      visitsAccounts: '0',
      time10_12: '0',
      time12_2: '0',
      time2_4: '0',
      time4_6: '0',
      time6_7: 0,
    }

    const headers = [
      { key: 'smartCollId', label: 'SMART COLL ID' },
      { key: 'name', label: 'NAME' },
      { key: 'agency', label: 'AGENCY' },
      { key: 'visits', label: '# of Visits' },
      { key: 'visitsAccounts', label: '# of visits (Accounts)' },
      { key: 'time10_12', label: '10-12 am' },
      { key: 'time12_2', label: '12-2 pm' },
      { key: 'time2_4', label: '2-4 pm' },
      { key: 'time4_6', label: '4-6 pm' },
      { key: 'time6_7', label: '6-7 pm' },
    ]

    const handleExport = () => {
      const exportData = [...mtdData, { 
        smartCollId: 'Totals', 
        name: '', 
        agency: '', 
        visits: totals.visits, 
        visitsAccounts: totals.visitsAccounts, 
        time10_12: totals.time10_12, 
        time12_2: totals.time12_2, 
        time2_4: totals.time2_4, 
        time4_6: totals.time4_6, 
        time6_7: totals.time6_7 
      }]
      exportTableToExcel(exportData, headers, 'MTD_Time_Wise_Visit_Report')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
          <span>MTD Time-Wise Visit Report</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMART COLL ID</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AGENCY</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Visits</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits (Accounts)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">10-12 am</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">12-2 pm</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2-4 pm</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">4-6 pm</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">6-7 pm</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mtdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.smartCollId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.agency}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visits}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsAccounts}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time10_12}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time12_2}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time2_4}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time4_6}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time6_7}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900" colSpan="3">Totals</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visits}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsAccounts}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time10_12}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time12_2}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time2_4}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time4_6}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time6_7}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Helper function to render FTD Time-Wise Visit Report table
  const renderFTDTimeWiseVisitReportTable = () => {
    const ftdData = []

    const totals = {
      visits: 0,
      visitsAccounts: 0,
      time10_12: 0,
      time12_2: 0,
      time2_4: 0,
      time4_6: 0,
      time6_7: 0,
    }

    const headers = [
      { key: 'smartCollId', label: 'SMART COLL ID' },
      { key: 'name', label: 'NAME' },
      { key: 'agency', label: 'AGENCY' },
      { key: 'visits', label: '# of Visits' },
      { key: 'visitsAccounts', label: '# of visits(Accounts)' },
      { key: 'time10_12', label: '10-12 am' },
      { key: 'time12_2', label: '12-2 pm' },
      { key: 'time2_4', label: '2-4 pm' },
      { key: 'time4_6', label: '4-6 pm' },
      { key: 'time6_7', label: '6-7 pm' },
    ]

    const handleExport = () => {
      const exportData = [...ftdData, { 
        smartCollId: 'Totals', 
        name: '', 
        agency: '', 
        visits: totals.visits, 
        visitsAccounts: totals.visitsAccounts, 
        time10_12: totals.time10_12, 
        time12_2: totals.time12_2, 
        time2_4: totals.time2_4, 
        time4_6: totals.time4_6, 
        time6_7: totals.time6_7 
      }]
      exportTableToExcel(exportData, headers, 'FTD_Time_Wise_Visit_Report')
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
          <span>FTD Time-Wise Visit Report</span>
          <button
            onClick={handleExport}
            className="bg-white text-red-600 border border-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
            title="Export to Excel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMART COLL ID</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AGENCY</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Visits</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of visits(Accounts)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">10-12 am</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">12-2 pm</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2-4 pm</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">4-6 pm</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">6-7 pm</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ftdData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{row.smartCollId}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.agency}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visits}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.visitsAccounts}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time10_12}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time12_2}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time2_4}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time4_6}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.time6_7}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900" colSpan="3">Totals</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visits}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.visitsAccounts}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time10_12}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time12_2}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time2_4}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time4_6}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{totals.time6_7}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Render Deposition Table
  const renderDepositionTable = () => {
    if (depositionLoading) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div 
              className="animate-spin h-10 w-10 border-4 border-red-600" 
              style={{ borderRadius: '0' }}
            ></div>
            <p className="text-sm font-medium text-gray-600">Loading deposition data...</p>
          </div>
        </div>
      )
    }
    
    if (!depositionData || !depositionData.deposition_data || depositionData.deposition_data.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center text-gray-500">
          No deposition data available
        </div>
      )
    }

    const formatDate = (dateString) => {
      if (!dateString || dateString === '1900-01-01T00:00:00') return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      } catch (e) {
        return dateString
      }
    }

    const formatDateTime = (dateString) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return dateString
      }
    }

    const formatAmount = (amount) => {
      if (amount === null || amount === undefined) return '-'
      return formatIndianNumber(amount)
    }

    const handleExport = () => {
      const headers = [
        { key: 'Deposition_Id', label: 'Deposition Id' },
        { key: 'Receipt_number', label: 'Receipt Number' },
        { key: 'APAC_Number', label: 'APAC Number' },
        { key: 'vertical', label: 'Vertical' },
        { key: 'Deposition_Payment_Mode', label: 'Payment Mode' },
        { key: 'Consolidated_Amount', label: 'Consolidated Amount' },
        { key: 'Collection_Date', label: 'Collection Date' },
        { key: 'Deposition_Bank_Name', label: 'Bank Name' },
        { key: 'Deposition_Branch_Name', label: 'Branch Name' },
        { key: 'Agency_Name', label: 'Agency Name' },
        { key: 'bnapac', label: 'BNAPAC' },
        { key: 'Challan_Number', label: 'Challan Number' },
        { key: 'Deposition_Status', label: 'Deposition Status' },
        { key: 'Deposition_Status_Description', label: 'Status Description' },
        { key: 'Deposition_Verified_By', label: 'Verified By' },
        { key: 'Deposition_Approval_Date_Time', label: 'Approval Date Time' },
        { key: 'Approval_Remark', label: 'Approval Remark' },
        { key: 'Payslip_Number', label: 'Payslip Number' },
        { key: 'utr', label: 'UTR' },
        { key: 'Assigned_to_User', label: 'Assigned to User' },
        { key: 'Assigned_DateTime', label: 'Assigned Date Time' },
        { key: 'Collector_Username', label: 'Collector Username' },
        { key: 'Collector_Name', label: 'Collector Name' },
        { key: 'Collection_Status', label: 'Collection Status' },
        { key: 'Collections_Submission_Date', label: 'Submission Date' },
        { key: 'Assigned_From', label: 'Assigned From' },
        { key: 'Supervisor_Name', label: 'Supervisor Name' },
        { key: 'Supervisor_Employee_ID', label: 'Supervisor Employee ID' },
        { key: 'Cheque_Number', label: 'Cheque Number' },
        { key: 'Drawer_Account_Number', label: 'Drawer Account Number' },
        { key: 'Cheque_Date', label: 'Cheque Date' },
        { key: 'Cheque_Amount', label: 'Cheque Amount' },
        { key: 'Bank_Name', label: 'Bank Name' },
        { key: 'Branch', label: 'Branch' },
        { key: 'MICR', label: 'MICR' },
        { key: 'CCAPAC', label: 'CCAPAC' },
      ]

      exportTableToExcel(depositionData.deposition_data, headers, 'Deposition_Data')
    }

    const pagination = depositionData.pagination || {}
    const totalPages = pagination.total_pages || 1
    const currentPage = pagination.current_page || 1
    const totalCount = pagination.total_count || 0
    const hasNext = pagination.has_next || false
    const hasPrevious = pagination.has_previous || false

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setDepositionCurrentPage(newPage)
      }
    }

    const renderPaginationButtons = () => {
      const buttons = []
      const maxVisiblePages = 5
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      // Previous button
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            hasPrevious
              ? 'bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Previous
        </button>
      )

      // First page
      if (startPage > 1) {
        buttons.push(
          <button
            key={1}
            onClick={() => handlePageChange(1)}
            className="px-3 py-1 rounded text-sm font-medium bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          >
            1
          </button>
        )
        if (startPage > 2) {
          buttons.push(
            <span key="ellipsis1" className="px-2 text-gray-500">
              ...
            </span>
          )
        }
      }

      // Page number buttons
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              i === currentPage
                ? 'bg-red-600 text-white cursor-pointer'
                : 'bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer'
            }`}
          >
            {i}
          </button>
        )
      }

      // Last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push(
            <span key="ellipsis2" className="px-2 text-gray-500">
              ...
            </span>
          )
        }
        buttons.push(
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="px-3 py-1 rounded text-sm font-medium bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          >
            {totalPages}
          </button>
        )
      }

      // Next button
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            hasNext
              ? 'bg-white text-red-600 border border-red-600 hover:bg-red-50 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      )

      return buttons
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-100 text-[#003366] p-3 text-lg font-semibold flex justify-between items-center">
          <span>Deposition Data</span>
          <div className="flex items-center gap-4">
            {pagination && (
              <span className="text-sm">
                Page {currentPage} of {totalPages} 
                ({totalCount} total records)
              </span>
            )}
            <button
              onClick={handleExport}
              className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
              title="Export to Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">APAC Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">Vertical</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan Number</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified By</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval Date Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned to User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collector Username</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collector Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned From</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor Employee ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {depositionData.deposition_data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.APAC_Number || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-semibold">{row.vertical || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Deposition_Payment_Mode || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 font-semibold">{formatAmount(row.Consolidated_Amount)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{formatDateTime(row.Collection_Date)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Agency_Name || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Challan_Number || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Deposition_Status || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Deposition_Verified_By || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{formatDateTime(row.Deposition_Approval_Date_Time)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Assigned_to_User || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{formatDateTime(row.Assigned_DateTime)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Collector_Username || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Collector_Name || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Collection_Status || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{formatDateTime(row.Collections_Submission_Date)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Assigned_From || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Supervisor_Name || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Supervisor_Employee_ID || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{row.Branch || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalCount} total records)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>
    )
  }

  console.log('dashboardData', dashboardData?.loan_data?.total_loans)

  return (
    <div className="h-screen font-['Montserrat'] flex" style={{background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'}}>
      <style>{`
        /* Custom Scrollbar Styles - Very Thin and Red */
        * {
          scrollbar-width: thin;
          scrollbar-color: #003366 transparent;
        }
        *::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: #003366;
          border-radius: 2px;
          transition: background 0.2s ease;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: #002244;
        }
        /* Table scrollbar styling */
        .table-scroll-container::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .table-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb {
          background: #003366;
          border-radius: 2px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #002244;
        }
        *::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        .card-with-wave {
          position: relative;
          overflow: hidden;
        }
        .card-with-wave.expanded {
          overflow: visible;
          z-index: 50;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .card-expanded-content {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50;
          margin-top: 0.25rem;
          padding: 0.75rem;
          min-width: 100%;
        }
        .card-with-wave::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .card-with-wave.expanded::after {
          height: 3px;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .card-with-wave-thin::after {
          height: 3px;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .card-with-wave-thin.expanded::after {
          height: 3px;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .card-with-wave.card-selected::after {
          display: none;
        }
        .card-selected {
          transform: scale(1.05) translateY(8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }
        .card-selected-zoom {
          transform: scale(1.05) translateY(8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }
        .card-wave-indigo::after { background-color: #003366; }
        .card-wave-blue::after { background-color: #2196F3; }
        .card-wave-green::after { background-color: #4CAF50; }
        .card-wave-orange::after { background-color: #F04E23; }
        .card-wave-red::after { background-color: #DC2626; }
        .card-wave-purple::after { background-color: #1976D2; }
        .card-wave-gray::after { background-color: #6B7280; }
        .card-wave-staff::after { background-color: #DC2626; }
        .card-wave-engagement::after { background-color: #2196F3; }
        .card-wave-payment::after { background-color: #003366; }
        .card-wave-case::after { background-color: #7C3AED; }
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
      
      <div 
        ref={mainContentRef} 
        className="flex flex-col overflow-hidden flex-1 relative transition-all duration-300"
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (isSidebarCollapsed ? '0px' : '272px')
            : '0px'
        }}
      >
        {/* Navbar */}
        <Navbar 
          onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          isSidebarCollapsed={isSidebarCollapsed}
          onBellClick={() => setShowAlerts(!showAlerts)}
        />

        {/* Loading Overlay */}
        {dashboardLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="animate-spin h-12 w-12 border-4 border-red-600" 
                style={{ borderRadius: '0' }}
              ></div>
              <p className="text-sm font-medium text-gray-600">Loading dashboard data...</p>
            </div>
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
        <main className="flex-1 overflow-hidden flex flex-col" style={{ paddingTop: '64px' }}>
          {/* Collection Dashboard Content */}
          <div className="bg-gray-100 flex-1 overflow-hidden flex">
            <div className="flex gap-4 p-4 w-full h-full overflow-hidden">
              {/* Left Side - Filters and Delegation Tracking */}
              <div className="w-64 flex-shrink-0 space-y-4 overflow-y-auto overflow-x-hidden pr-2" ref={filtersRef} style={{ maxHeight: '100%' }}>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type of Loan <span className="text-gray-400 font-normal">(4)</span></label>
                      <select 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          filterLoanType !== 'All Loans' ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">DPD Buckets <span className="text-gray-400 font-normal">(6)</span></label>
                      <select 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          filterDPD !== 'All Buckets' ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
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
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          !isFromDateDefault() ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                      <input 
                        type="date" 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          !isToDateDefault() ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Geography <span className="text-gray-400 font-normal">(6)</span></label>
                      <select 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          filterGeography !== 'All Regions' ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">State <span className="text-gray-400 font-normal">(9)</span></label>
                      <select 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          filterState !== 'All States' ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">District <span className="text-gray-400 font-normal">(10)</span></label>
                      <select 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          filterDistrict !== 'All Districts' ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">PI Code <span className="text-gray-400 font-normal">(13)</span></label>
                      <select 
                        className={`w-full p-2 rounded text-xs focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors ${
                          filterPICode !== 'All PI Codes' ? 'border-2 border-red-600' : 'border border-gray-300'
                        }`}
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
                <div className="bg-gray-50 border-l-4 border-t border-r border-b border-gray-200 rounded-lg p-4 shadow-sm" style={{ borderLeftColor: '#003366' }}>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: '#003366' }}>Delegation Tracking</h3>
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
              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-full pr-6">
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
                        } else if (cardId === 'deposition') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-300 h-20 relative shadow-lg card-with-wave card-wave-staff">
                              <div className="text-xs text-gray-800 relative z-10">Deposition</div>
                              <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>{depositionData?.pagination?.total_count || 0}</div>
                              {renderFavoritePin('deposition')}
                            </div>
                          )
                        } else if (cardId === 'whatsapp') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('whatsapp')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">WhatsApp Engagements</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Messages Sent</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>1,245</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Delivered</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>1,180</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'aiCalls') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('aiCalls')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">AI Calls</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Calls Triggered</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>2,100</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Answered</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>1,580</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'dialler') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('dialler')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Dialler Calls</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Total Calls</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>1,850</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Successful Connects</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>1,340</span>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (cardId === 'fieldVisits') {
                          return (
                            <div key={cardId} className="group bg-white  rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md shadow-lg relative card-with-wave card-wave-payment">
                              {renderFavoritePin('fieldVisits')}
                              <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Field Visits</h3>
                              <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Planned Visits</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>156</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-800">
                                  <span>Completed Visits</span>
                                  <span className="font-semibold" style={{color: '#003366'}}>122</span>
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
                <div className="mb-8 w-full ml-2">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Staff Monitoring</h2>
                  <div className="grid grid-cols-5 gap-3 relative w-full">
                    {/* Allocation Summary Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff h-20 ${expandedCard === 'allocation' ? 'expanded' : ''} ${selectedStaffMetric === 'allocation' ? 'card-selected' : 'border border-gray-200'}`}
                      onMouseEnter={() => setExpandedCard('allocation')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('allocation')
                      }}
                    >
                      {renderFavoritePin('allocation')}
                      <div className="text-xs text-gray-800 relative z-10">Case Summary</div>
                      <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>{formatIndianNumber(dashboardData?.loan_data?.total_loans)}</div>
                      {expandedCard === 'allocation' && (
                        <div className="card-expanded-content">
                          <div className="text-xs text-gray-800 mb-1">Case Summary</div>
                          <div className="text-lg font-bold mb-2" style={{color: '#DC2626'}}>{formatIndianNumber(dashboardData?.loan_data?.total_loans)}</div>
                          <div className="space-y-1">
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
                      )}
                    </div>

                    {/* Collection Efficiency Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff h-20 ${expandedCard === 'collection' ? 'expanded' : ''} ${selectedStaffMetric === 'collection' ? 'card-selected' : 'border border-gray-200'}`}
                      onMouseEnter={() => setExpandedCard('collection')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('collection')
                      }}
                    >
                      {renderFavoritePin('collection')}
                      <div className="text-xs text-gray-800 relative z-10">Collection Efficiency (%)</div>
                      <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>{dashboardData?.collection_data?.collection_percentage}%</div>
                      {expandedCard === 'collection' && (
                        <div className="card-expanded-content">
                          <div className="text-xs text-gray-800 mb-1">Collection Efficiency (%)</div>
                          <div className="text-lg font-bold mb-2" style={{color: '#DC2626'}}>{dashboardData?.collection_data?.collection_percentage}%</div>
                          <div className="space-y-1">
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
                      )}
                    </div>

                    {/* PTP Conversion Rate Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff h-20 ${expandedCard === 'ptp' ? 'expanded' : ''} ${selectedStaffMetric === 'ptp' ? 'card-selected' : 'border border-gray-200'}`}
                      onMouseEnter={() => setExpandedCard('ptp')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('ptp')
                      }}
                    >
                      {renderFavoritePin('ptp')}
                      <div className="text-xs text-gray-800 relative z-10">PTP Conversion Rate (%)</div>
                      <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>72.3%</div>
                      {expandedCard === 'ptp' && (
                        <div className="card-expanded-content">
                          <div className="text-xs text-gray-800 mb-1">PTP Conversion Rate (%)</div>
                          <div className="text-lg font-bold mb-2" style={{color: '#DC2626'}}>72.3%</div>
                          <div className="space-y-1">
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
                      )}
                    </div>

                    {/* Staff Productivity Index Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-300 relative card-with-wave card-wave-staff h-20 ${expandedCard === 'productivity' ? 'expanded' : ''} ${selectedStaffMetric === 'productivity' ? 'card-selected' : 'border border-gray-200'}`}
                      onMouseEnter={() => setExpandedCard('productivity')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('productivity')
                      }}
                    >
                      {renderFavoritePin('productivity')}
                      <div className="text-xs text-gray-800 relative z-10">Staff Productivity Index</div>
                      <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>156</div>
                      {expandedCard === 'productivity' && (
                        <div className="card-expanded-content">
                          <div className="text-xs text-gray-800 mb-1">Staff Productivity Index</div>
                          <div className="text-lg font-bold mb-2" style={{color: '#DC2626'}}>156</div>
                          <div className="space-y-1">
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
                      )}
                    </div>

                    {/* Inactive/Non-performing Staff Card */}
                    <div 
                      data-staff-card
                      className={`group bg-white rounded-lg p-3 relative cursor-pointer transition-all duration-300 card-with-wave card-wave-staff h-20 ${expandedCard === 'inactive' ? 'expanded' : ''} ${selectedStaffMetric === 'inactive' ? 'card-selected' : 'border border-gray-200'}`}
                      onMouseEnter={() => setExpandedCard('inactive')}
                      onMouseLeave={() => setExpandedCard(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStaffCardClick('inactive')
                      }}
                    >
                      {renderFavoritePin('inactive')}
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold z-20 shadow-sm">3</div>
                      <div className="text-xs text-gray-800 relative z-10">Inactive/Non-performing Staff</div>
                      <div className="text-lg font-bold relative z-10" style={{color: '#DC2626'}}>3</div>
                      {expandedCard === 'inactive' && (
                        <div className="card-expanded-content">
                          <div className="text-xs text-gray-800 mb-1">Inactive/Non-performing Staff</div>
                          <div className="text-lg font-bold mb-1" style={{color: '#DC2626'}}>3</div>
                          <div className="text-xs text-gray-800 mb-2">0 calls or 0 visits</div>
                          <div className="space-y-1">
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
                      )}
                    </div>
                  </div>
                </div>

                {/* Allocation Section - Show when allocation card is clicked */}
                {selectedStaffMetric === 'allocation' && (
                  <div ref={leaderboardTableRef} className="mb-8 w-full space-y-6">
                    {/* Header with Title and Close Button */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Case Summary - Allocation Details</h2>
                      <button
                        onClick={() => {
                          setSelectedStaffMetric(null)
                          setSelectedLoanType(null)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close allocation tables"
                      >
                        Close
                      </button>
                    </div>

                    {/* Loading State - Show main loader */}
                    {verticalDataLoading && (
                      <div className="flex flex-col items-center justify-center py-20 px-4" style={{ minHeight: '400px' }}>
                        <div className="flex flex-col items-center space-y-4">
                          <div 
                className="animate-spin h-12 w-12 border-4 border-red-600" 
                style={{ borderRadius: '0' }}
              ></div>
                          <p className="text-sm font-medium text-gray-600">Loading allocation data...</p>
                        </div>
                      </div>
                    )}

                    {/* Content - Show only when not loading */}
                    {!verticalDataLoading && (
                      <>
                        {/* Loan Type Cards - Always show on top */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Tractor Finance Card */}
                        <div
                          onClick={() => setSelectedLoanType('tractor')}
                          className={`group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${selectedLoanType === 'tractor' ? 'card-selected-zoom' : 'border border-gray-200 hover:border-red-600'}`}
                          style={{
                            backgroundImage: tractorFinanceImage ? `url("${tractorFinanceImage}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'right center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Removed overlay/blur to show full tractor image clearly */}
                          <div className="flex h-32 relative z-10">
                            {/* Left Side - Text Content */}
                            <div className="flex-1 flex flex-col justify-center px-3 py-2 z-10 relative">
                              <h3 className="text-base font-bold text-gray-900 mb-1">Tractor Finance</h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">Agricultural equipment financing solutions</p>
                              <div className="flex items-center text-red-600 font-semibold text-xs">
                                <span>View Details</span>
                                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            {/* Right Side spacer only; background image on container shows the tractor without blur */}
                            <div className="relative w-32 flex-shrink-0 overflow-hidden"></div>
                          </div>
                        </div>

                        {/* Commercial Vehicle Card */}
                        <div
                          onClick={() => setSelectedLoanType('vehicle')}
                          className={`group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${selectedLoanType === 'vehicle' ? 'card-selected-zoom' : 'border border-gray-200 hover:border-red-600'}`}
                          style={{
                            backgroundImage: commercialVehicleImage ? `url("${commercialVehicleImage}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'right center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Removed overlay/blur to show full vehicle image clearly */}
                          <div className="flex h-32 relative z-10">
                            {/* Left Side - Text Content */}
                            <div className="flex-1 flex flex-col justify-center px-3 py-2 z-10 relative">
                              <h3 className="text-base font-bold text-gray-900 mb-1">Commercial Vehicle</h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">Vehicle financing for commercial purposes</p>
                              <div className="flex items-center text-red-600 font-semibold text-xs">
                                <span>View Details</span>
                                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            {/* Right Side spacer only; background image on container shows the vehicle without blur */}
                            <div className="relative w-32 flex-shrink-0 overflow-hidden"></div>
                          </div>
                        </div>

                        {/* Construction Equipment Card */}
                        <div
                          onClick={() => setSelectedLoanType('construction')}
                          className={`group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${selectedLoanType === 'construction' ? 'card-selected-zoom' : 'border border-gray-200 hover:border-red-600'}`}
                          style={{
                            backgroundImage: constructionEquipmentImage ? `url("${constructionEquipmentImage}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'right center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Removed overlay/blur to show full construction image clearly */}
                          <div className="flex h-32 relative z-10">
                            {/* Left Side - Text Content */}
                            <div className="flex-1 flex flex-col justify-center px-3 py-2 z-10 relative">
                              <h3 className="text-base font-bold text-gray-900 mb-1">Construction Equipment</h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">Heavy machinery and equipment financing</p>
                              <div className="flex items-center text-red-600 font-semibold text-xs">
                                <span>View Details</span>
                                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            {/* Right Side spacer only; background image on container shows the construction image without blur */}
                            <div className="relative w-32 flex-shrink-0 overflow-hidden"></div>
                          </div>
                        </div>

                        {/* Home Loan Card */}
                        <div
                          onClick={() => setSelectedLoanType('home')}
                          className={`group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${selectedLoanType === 'home' ? 'card-selected-zoom' : 'border border-gray-200 hover:border-red-600'}`}
                          style={{
                            backgroundImage: homeLoanImage ? `url("${homeLoanImage}")` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'right center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* Removed overlay/blur to show full home loan image clearly */}
                          <div className="flex h-32 relative z-10">
                            {/* Left Side - Text Content */}
                            <div className="flex-1 flex flex-col justify-center px-3 py-2 z-10 relative">
                              <h3 className="text-base font-bold text-gray-900 mb-1">Home Loan</h3>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">Residential property financing solutions</p>
                              <div className="flex items-center text-red-600 font-semibold text-xs">
                                <span>View Details</span>
                                <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            {/* Right Side spacer only; background image on container shows the home loan image without blur */}
                            <div className="relative w-32 flex-shrink-0 overflow-hidden"></div>
                          </div>
                        </div>
                        </div>

                        {/* Grid of Tables - Always show below cards */}
                        <div className="mt-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Vertical Summary Table */}
                            <div className="lg:col-span-2">
                              {renderProductSummaryTable()}
                            </div>
                            
                            {/* Vertical Allocation Summary Table */}
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
                            
                            {/* ALLOCATION_ADMIN Allocation Summary Table */}
                            <div>
                              {renderAllocationAdminTable()}
                            </div>
                            
                            {/* BO Allocation Summary Table */}
                            <div>
                              {renderBOTable()}
                            </div>
                            
                            {/* CLM Allocation Summary Table */}
                            <div>
                              {renderCLMTable()}
                            </div>
                            
                            {/* DTR Allocation Summary Table */}
                            <div>
                              {renderDTRTable()}
                            </div>
                            
                            {/* TCM Allocation Summary Table */}
                            <div>
                              {renderTCMTable()}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Collection Summary Tables - Show when collection card is clicked */}
                {selectedStaffMetric === 'collection' && (
                  <div ref={leaderboardTableRef} className="mb-8 w-full space-y-6" onClick={(e) => e.stopPropagation()}>
                    {/* Header with Title and Close Button */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Collection Efficiency - Summary Details</h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStaffMetric(null)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close collection tables"
                      >
                        Close
                      </button>
                    </div>

                    {/* Loading State - Show main loader */}
                    {collectionDataLoading && (
                      <div className="flex flex-col items-center justify-center py-20 px-4" style={{ minHeight: '400px' }}>
                        <div className="flex flex-col items-center space-y-4">
                          <div 
                className="animate-spin h-12 w-12 border-4 border-red-600" 
                style={{ borderRadius: '0' }}
              ></div>
                          <p className="text-sm font-medium text-gray-600">Loading collection data...</p>
                        </div>
                      </div>
                    )}

                    {/* Grid of Summary Tables - Show only when not loading */}
                    {!collectionDataLoading && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onClick={(e) => e.stopPropagation()}>
                        {/* State Wise Summary Table */}
                        <div className="lg:col-span-2">
                          {renderStateWiseSummaryTable()}
                        </div>
                        
                        {/* Region Wise Summary Table */}
                        <div className="lg:col-span-2">
                          {renderRegionWiseSummaryTable()}
                        </div>
                        
                        {/* Bucket Wise Summary Table */}
                        <div className="lg:col-span-2">
                          {renderBucketWiseSummaryTable()}
                        </div>
                        
                        {/* DPD Collection Efficiency Table */}
                        <div className="lg:col-span-2">
                          {renderDPDCollectionEfficiencyTable()}
                        </div>
                        
                        {/* DPD Collection Efficiency Summary Table */}
                        <div className="lg:col-span-2">
                          {renderDPDCollectionEfficiencySummaryTable()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Productivity Index Tables - Show when productivity card is clicked */}
                {selectedStaffMetric === 'productivity' && (
                  <div ref={leaderboardTableRef} className="mb-8 w-full space-y-6">
                    {/* Header with Title and Close Button */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Staff Productivity Index - Details</h2>
                      <button
                        onClick={() => setSelectedStaffMetric(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close productivity tables"
                      >
                        Close
                      </button>
                    </div>

                    {/* Loading State - Show main loader */}
                    {verticalDataLoading && (
                      <div className="flex flex-col items-center justify-center py-20 px-4" style={{ minHeight: '400px' }}>
                        <div className="flex flex-col items-center space-y-4">
                          <div 
                className="animate-spin h-12 w-12 border-4 border-red-600" 
                style={{ borderRadius: '0' }}
              ></div>
                          <p className="text-sm font-medium text-gray-600">Loading productivity data...</p>
                        </div>
                      </div>
                    )}

                    {/* Content - Show only when not loading */}
                    {!verticalDataLoading && (
                      <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Users</div>
                        <div className="text-2xl font-bold text-gray-900">323</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Users (Collectors)</div>
                        <div className="text-2xl font-bold text-gray-900">111</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Logged-in (Collectors)</div>
                        <div className="text-2xl font-bold text-gray-900">38</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Not Logged-in (Collectors)</div>
                        <div className="text-2xl font-bold text-gray-900">73</div>
                      </div>
                    </div>

                    {/* Main Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                      <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
                        <span>Staff Productivity Summary</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL ALLOCATED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NOT VISITED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NEWLY ALLOCATED NOT VISITED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH NOT VISITED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH VISITED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P SUCCESS</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P FAILED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% NOT VISITED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% LAST MONTH NOT VISITED</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL OVERDUE AMOUNT</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 1-30</th>
                              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 31-60</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="bg-white">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">7,699</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,245</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">456</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">789</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">5,664</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">3,245</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">892</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.18%</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.25%</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹45.2 Cr</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,156</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,089</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Breakdown Tables */}
                    <div className="space-y-6">
                      {/* Designation Wise Table */}
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
                          <span>Designation Wise</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESIGNATION</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL ALLOCATED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NEWLY ALLOCATED NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P SUCCESS</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P FAILED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% LAST MONTH NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL OVERDUE AMOUNT</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 1-30</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 31-60</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">DTR</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">3,245</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">524</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">189</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">335</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,386</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,456</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">412</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.14%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.32%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹18.5 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">856</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">432</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Supervisor</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,156</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">348</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">125</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">223</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,585</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">987</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">256</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.14%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.34%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹12.8 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">568</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">287</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Senior Executive</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,456</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">235</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">89</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">146</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,075</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">623</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">124</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.14%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.03%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹8.9 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">412</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">208</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Executive</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">842</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">138</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">53</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">85</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">618</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">179</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">100</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.39%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.10%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹5.0 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">320</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">162</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* State Wise Table */}
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
                          <span>State Wise</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATE</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL ALLOCATED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NEWLY ALLOCATED NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P SUCCESS</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P FAILED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% LAST MONTH NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL OVERDUE AMOUNT</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 1-30</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 31-60</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Maharashtra</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,456</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">396</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">142</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">254</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,806</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,102</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">286</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.12%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.34%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹14.5 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">678</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">342</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Delhi</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,856</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">299</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">108</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">191</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,366</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">834</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">216</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.11%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.29%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹11.0 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">512</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">258</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Tamil Nadu</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,245</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">201</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">72</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">129</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">915</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">559</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">145</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.14%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.36%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹7.4 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">343</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">173</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Gujarat</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,056</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">170</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">61</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">109</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">777</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">474</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">123</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.10%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.32%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹6.3 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">291</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">147</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Telangana</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">856</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">138</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">50</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">88</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">630</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">384</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">100</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.12%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.28%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹5.1 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">236</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">119</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Karnataka</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">230</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">37</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">13</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">24</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">169</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">103</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">27</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.09%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.43%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹1.4 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">63</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">32</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Vertical Wise Table */}
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-white text-[#00005A] border border-[#003366] rounded-t-lg px-3 py-1.5 text-lg font-semibold flex justify-between items-center">
                          <span>Vertical Wise</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 border border-[#003366]">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VERTICAL</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL ALLOCATED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NEWLY ALLOCATED NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P SUCCESS</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LAST MONTH P2P FAILED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% LAST MONTH NOT VISITED</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL OVERDUE AMOUNT</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 1-30</th>
                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DPD 31-60</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Tractor Finance</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,856</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">461</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">166</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">295</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,100</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,282</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">333</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.14%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.33%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹16.9 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">789</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">398</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Commercial Vehicle</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">2,156</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">348</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">125</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">223</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,585</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">968</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">251</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.14%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.34%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹12.8 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">596</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">301</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Construction Equipment</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,856</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">299</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">108</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">191</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">1,366</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">834</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">216</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.11%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">10.29%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹11.0 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">512</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">258</td>
                              </tr>
                              <tr className="bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Home Loan</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">831</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">137</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">57</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">80</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">613</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">161</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">92</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">16.49%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">9.63%</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">₹4.5 Cr</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">259</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">132</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Previous Productivity Tables */}
                    <div className="space-y-6 mt-6">
                      {/* MTD Productivity Report */}
                      <div>
                        {renderMTDProductivityReportTable()}
                      </div>
                      
                      {/* FTD Productivity Report */}
                      <div>
                        {renderFTDProductivityReportTable()}
                      </div>
                      
                      {/* MTD Collector Summary Report */}
                      <div>
                        {renderMTDCollectorSummaryReportTable()}
                      </div>
                      
                      {/* FTD Collector Summary Report */}
                      <div>
                        {renderFTDCollectorSummaryReportTable()}
                      </div>
                      
                      {/* MTD Time-Wise Visit Report */}
                      <div>
                        {renderMTDTimeWiseVisitReportTable()}
                      </div>
                      
                      {/* FTD Time-Wise Visit Report */}
                      <div>
                        {renderFTDTimeWiseVisitReportTable()}
                      </div>
                    </div>
                      </>
                    )}
                  </div>
                )}

                {/* Staff Performance Leaderboard Table - Show for collection and other metrics (but not allocation) */}
                {selectedStaffMetric === 'collection' && !collectionDataLoading && (
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

                {/* Staff Performance Leaderboard Table - Show for other metrics (but not allocation or collection) */}
                {selectedStaffMetric && selectedStaffMetric !== 'allocation' && selectedStaffMetric !== 'collection' && selectedStaffMetric !== 'productivity' && (
                  <div ref={leaderboardTableRef} className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full" style={{ maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                    {/* Loading State - Show main loader */}
                    {verticalDataLoading && (
                      <div className="flex flex-col items-center justify-center py-20 px-4" style={{ minHeight: '400px' }}>
                        <div className="flex flex-col items-center space-y-4">
                          <div 
                className="animate-spin h-12 w-12 border-4 border-red-600" 
                style={{ borderRadius: '0' }}
              ></div>
                          <p className="text-sm font-medium text-gray-600">Loading {getCardName(selectedStaffMetric).toLowerCase()}...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Content - Show only when not loading */}
                    {!verticalDataLoading && (
                      <>
                    {/* Header with Title and Close Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{getCardName(selectedStaffMetric)}</h2>
                        {/* Breadcrumb Navigation */}
                        {hierarchyPath.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                            <button
                              onClick={() => handleHierarchyBack(0)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              All Supervisors
                            </button>
                            {hierarchyPath.map((item, index) => (
                              <React.Fragment key={item.id}>
                                <span className="text-gray-400">/</span>
                                <button
                                  onClick={() => handleHierarchyBack(index + 1)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  {item.name} ({item.hierarchy})
                                </button>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                      
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
                          onClick={handleExportToExcel}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
                          aria-label="Export to Excel"
                          title="Export all filtered data to Excel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaffMetric(null)
                            setHierarchyPath([])
                            setCurrentHierarchyLevel(null)
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                          aria-label="Close leaderboard"
                          title="Close table"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
                              paginatedStaffData.map((staff) => {
                                const hasSubordinates = staffLeaderboardBaseData.some(s => s.parentId === staff.id)
                                return (
                                <tr 
                                  key={staff.id} 
                                  className={`border-b border-gray-100 transition-colors ${
                                    hasSubordinates 
                                      ? 'hover:bg-blue-50 cursor-pointer' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => hasSubordinates && handleHierarchyDrillDown(staff)}
                                  title={hasSubordinates ? `Click to view ${staff.name}'s subordinates` : ''}
                                >
                                  <td className="py-3 px-3 font-mono text-xs text-left whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      {staff.id}
                                      {hasSubordinates && (
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </td>
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
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCustomerCountClick(staff)
                                      }}
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
                                )
                              })
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
                      </>
                    )}
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
                <div className="mb-8 w-full ml-2">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Engagement</h2>
                  <div className="grid grid-cols-4 gap-3 relative z-10">
                    <div 
                      data-engagement-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement ${selectedEngagementCard === 'whatsapp' ? 'card-selected-zoom' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEngagementCardClick('whatsapp')
                      }}
                    >
                      {renderFavoritePin('whatsapp')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">WhatsApp Engagements</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Messages Sent</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Delivered</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Read</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Responded</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      data-engagement-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement ${selectedEngagementCard === 'aiCalls' ? 'card-selected-zoom' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEngagementCardClick('aiCalls')
                      }}
                    >
                      {renderFavoritePin('aiCalls')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">AI Calls</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Calls Triggered</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Answered</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Positive Response</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      data-engagement-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement ${selectedEngagementCard === 'dialler' ? 'card-selected-zoom' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEngagementCardClick('dialler')
                      }}
                    >
                      {renderFavoritePin('dialler')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Dialler Calls</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Calls</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Successful Connects</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Follow-up Actions</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                    </div>
                  </div>

                    <div 
                      data-engagement-card
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-engagement ${selectedEngagementCard === 'fieldVisits' ? 'card-selected-zoom' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEngagementCardClick('fieldVisits')
                      }}
                    >
                      {renderFavoritePin('fieldVisits')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Field Visits</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Planned Visits</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Completed Visits</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Geo-tagging Compliance</span>
                          <span className="font-semibold" style={{color: '#003366'}}>0</span>
                        </div>
                  </div>
                </div>
              </div>

                {/* Customer Engagement Detailed Section */}
                {selectedEngagementCard && (
                  <div ref={engagementSectionRef} className="mb-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6">
                  {/* Header with Close Button */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Customer Engagement Details</h2>
                    <button
                      onClick={() => setSelectedEngagementCard(null)}
                      className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-gray-100"
                      aria-label="Close engagement section"
                      title="Close"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                
                  {/* 🔹 Timeline Section */}
                  <div className="flex overflow-x-auto gap-3 pb-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {[
                      "01-10-2025", "02-10-2025", "03-10-2025", "04-10-2025", "05-10-2025",
                      "06-10-2025", "07-10-2025", "08-10-2025", "09-10-2025", "10-10-2025",
                      "11-10-2025", "12-10-2025", "13-10-2025", "14-10-2025"
                    ].map((date, index) => (
                      <div
                        key={index}
                        className={`min-w-[90px] text-center border rounded-lg py-2 shadow-sm cursor-pointer transition-all duration-200 ${
                          selectedDate === date
                            ? "bg-blue-100 border-blue-600 text-blue-800 font-semibold"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-lg font-bold">0</div>
                        <div className="text-xs">{date}</div>
                      </div>
                    ))}
                  </div>
                
                  {/* Engagement Grid Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    {/* Total Engagement + Breakdown */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm font-semibold text-gray-900">Total Customers Engagement</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {customerEngagementData.totalEngagement.toLocaleString()}
                        </div>
                      </div>
                
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">💬</div>
                          <div className="text-sm font-semibold text-green-800">
                            {customerEngagementData.engagementBreakdown.whatsapp.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-700">WhatsApp</div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">🔊</div>
                          <div className="text-sm font-semibold text-blue-800">
                            {customerEngagementData.engagementBreakdown.blaster.toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-700">Blaster</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">🤖</div>
                          <div className="text-sm font-semibold text-purple-800">
                            {customerEngagementData.engagementBreakdown.aiCalls.toLocaleString()}
                          </div>
                          <div className="text-xs text-purple-700">AI Calls</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">📞</div>
                          <div className="text-sm font-semibold text-orange-800">
                            {customerEngagementData.engagementBreakdown.dialers.toLocaleString()}
                          </div>
                          <div className="text-xs text-orange-700">Dialers</div>
                        </div>
                      </div>
                
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">👤</div>
                          <div className="text-base font-semibold text-gray-800">
                            {customerEngagementData.customerMetrics.totalCustomers.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Total Customers</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">👥</div>
                          <div className="text-base font-semibold text-gray-800">
                            {customerEngagementData.customerMetrics.connectedCustomers.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Connected</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">💰</div>
                          <div className="text-base font-semibold text-gray-800">
                            ₹{customerEngagementData.customerMetrics.amountPromised.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Amount Promised</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <div className="text-2xl">💳</div>
                          <div className="text-base font-semibold text-gray-800">
                            ₹{customerEngagementData.customerMetrics.amountCollected.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Amount Collected</div>
                        </div>
                      </div>
                    </div>
                
                    {/* Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900">Customers Engagement</h4>
                        <select
                          defaultValue="Last 15 days"
                          className="px-3 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Last 7 days">Last 7 days</option>
                          <option value="Last 15 days">Last 15 days</option>
                          <option value="Last 30 days">Last 30 days</option>
                        </select>
                      </div>
                      <Chart options={engagementChartOptions} series={engagementChartSeries} type="bar" height={260} />
                    </div>
                  </div>
                
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between border-b border-green-200 pb-2 mb-2">
                        <h4 className="text-sm font-semibold text-green-800">Promised to Pay</h4>
                      </div>
                      <div className="text-2xl font-bold text-green-900">{customerEngagementData.statusCards.promisedToPay.accounts}</div>
                      <div className="text-xs text-green-700 mt-1">Accounts</div>
                      <div className="text-sm font-semibold text-green-800 mt-2">
                        ₹{customerEngagementData.statusCards.promisedToPay.amount.toLocaleString()}
                      </div>
                    </div>
                
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between border-b border-red-200 pb-2 mb-2">
                        <h4 className="text-sm font-semibold text-red-800">Refused to Pay</h4>
                      </div>
                      <div className="text-2xl font-bold text-red-900">{customerEngagementData.statusCards.refusedToPay.accounts}</div>
                      <div className="text-xs text-red-700 mt-1">Accounts</div>
                    </div>
                
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-2">
                        <h4 className="text-sm font-semibold text-blue-800">Already Paid</h4>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">{customerEngagementData.statusCards.alreadyPaid.accounts}</div>
                      <div className="text-xs text-blue-700 mt-1">Accounts</div>
                      <div className="text-sm font-semibold text-blue-800 mt-2">
                        ₹{customerEngagementData.statusCards.alreadyPaid.amount.toLocaleString()}
                      </div>
                    </div>
                
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between border-b border-orange-200 pb-2 mb-2">
                        <h4 className="text-sm font-semibold text-orange-800">Wrong Number</h4>
                      </div>
                      <div className="text-2xl font-bold text-orange-900">{customerEngagementData.statusCards.wrongNumber.accounts}</div>
                      <div className="text-xs text-orange-700 mt-1">Accounts</div>
                    </div>
                  </div>
                </div>
                
                )}
            </div>

                {/* Payment Intent & Behavior */}
                <div className="mb-8 ml-2">
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

                {/* Case Management & DPD Analysis */}
                <div className="mb-8 ml-2">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Case Management & DPD Analysis</h2>
                  <div className="grid grid-cols-4 gap-3">
                    <div 
                      data-case-card="reposition"
                      className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-staff"
                      onClick={() => {
                        if (selectedCaseMetric === 'reposition') {
                          setSelectedCaseMetric(null)
                        } else {
                          setSelectedCaseMetric('reposition')
                        }
                      }}
                    >
                      {renderFavoritePin('reposition')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Reposition</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Cases</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>1,247</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Pending</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>342</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Completed</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>905</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Amount</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>₹3.45Cr</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      data-case-card="deposition"
                      className={`group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-staff ${selectedCaseMetric === 'deposition' ? 'card-selected-zoom' : ''}`}
                      onClick={() => {
                        if (selectedCaseMetric === 'deposition') {
                          setSelectedCaseMetric(null)
                        } else {
                          setSelectedCaseMetric('deposition')
                          setDepositionCurrentPage(1)
                        }
                      }}
                    >
                      {renderFavoritePin('deposition')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Deposition</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Records</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>{depositionData?.pagination?.total_count || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Current Page</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>{depositionData?.pagination?.current_page || 1}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Pages</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>{depositionData?.pagination?.total_pages || 1}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Date Range</span>
                          <span className="font-semibold text-xs" style={{color: '#DC2626'}}>
                            {depositionData?.from_date || '-'} to {depositionData?.to_date || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-staff">
                      {renderFavoritePin('settlements')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Settlements</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Settlements</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>567</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Pending Approval</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>89</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Approved</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>478</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Settlement Amount</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>₹1.87Cr</span>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md relative card-with-wave card-with-wave-thin card-wave-staff">
                      {renderFavoritePin('bucketWiseDPD')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Bucket Wise DPD</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>0-30 Days</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>4,523</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>31-60 Days</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>2,187</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>61-90 Days</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>1,456</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>90+ Days</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>892</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio Performance */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Portfolio Performance</h2>
                    <button
                      onClick={() => {
                        if (selectedRollMetric === 'rollbackReport') {
                          setSelectedRollMetric(null)
                        } else {
                          setSelectedRollMetric('rollbackReport')
                        }
                      }}
                      className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      aria-label={selectedRollMetric === 'rollbackReport' ? 'Close roll rate analysis' : 'Open roll rate analysis'}
                    >
                      <svg 
                        className={`w-5 h-5 text-gray-600 transition-transform ${selectedRollMetric === 'rollbackReport' ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="group bg-white rounded-lg p-3 transition-all duration-200 relative card-with-wave card-with-wave-thin card-wave-staff"
                    >
                      {renderFavoritePin('rollbackReport')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Portfolio Performance</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Rollbacks</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Pending</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Completed</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Amount</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>₹0</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      data-roll-card="rollForward"
                      className="group bg-white rounded-lg p-3 transition-all duration-200 relative card-with-wave card-with-wave-thin card-wave-staff"
                    >
                      {renderFavoritePin('rollForward')}
                      <h3 className="text-sm font-semibold mb-2 relative z-10 text-gray-800">Roll Forward</h3>
                      <div className="space-y-1 relative z-10">
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Total Roll Forwards</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Pending</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Completed</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>0</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-800">
                          <span>Amount</span>
                          <span className="font-semibold" style={{color: '#DC2626'}}>₹0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Roll Forward Expanded Section */}
                {selectedRollMetric === 'rollForward' && (
                  <div ref={rollForwardRef} className="mb-8 w-full space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Zone Wise Roll Rate Analysis</h2>
                      <button 
                        onClick={() => setSelectedRollMetric(null)} 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close roll forward section"
                      >
                        Close
                      </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Roll Forward</div>
                        <div className="text-2xl font-bold text-gray-900">74,451</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Roll Backward</div>
                        <div className="text-2xl font-bold text-gray-900">10,894</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Stabilized</div>
                        <div className="text-2xl font-bold text-gray-900">958,071</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Regularized</div>
                        <div className="text-2xl font-bold text-gray-900">958,071</div>
                      </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">FunderName</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Division</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">StateName</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">DistrictName</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Year, Month</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>2024 (Year) + De...</option>
                            <option>2025 (Year) + Ja...</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Grid - Tables and Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left Column - Tables */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Zone and Division wise Roll Rate Analysis for Loans */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Zone and Division wise Roll Rate Analysis for Loans</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Zone</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Gorakhpur Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('gorakhpur')) {
                                          newExpanded.delete('gorakhpur')
                                        } else {
                                          newExpanded.add('gorakhpur')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('gorakhpur') ? '−' : '+'} Gorakhpur
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700">145,262</td>
                                  <td className="text-right py-2 px-2 text-gray-700">12,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5,678</td>
                                  <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700">567</td>
                                  <td className="text-right py-2 px-2 text-gray-700">234</td>
                                </tr>
                                {expandedZones.has('gorakhpur') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Lucknow Division</td>
                                    <td className="text-right py-2 px-2 text-gray-700">72,631</td>
                                    <td className="text-right py-2 px-2 text-gray-700">6,228</td>
                                    <td className="text-right py-2 px-2 text-gray-700">4,117</td>
                                    <td className="text-right py-2 px-2 text-gray-700">2,839</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1,728</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1,173</td>
                                    <td className="text-right py-2 px-2 text-gray-700">617</td>
                                    <td className="text-right py-2 px-2 text-gray-700">284</td>
                                    <td className="text-right py-2 px-2 text-gray-700">117</td>
                                  </tr>
                                )}
                                {/* Jabalpur Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('jabalpur')) {
                                          newExpanded.delete('jabalpur')
                                        } else {
                                          newExpanded.add('jabalpur')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('jabalpur') ? '−' : '+'} Jabalpur
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">201,240</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">18,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">345</td>
                                </tr>
                                {expandedZones.has('jabalpur') && (
                                  <>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Jhansi</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">86</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Katni</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">86</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Nagpur</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">86</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Sagar</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">86</td>
                                    </tr>
                                  </>
                                )}
                                {/* Moradabad Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('moradabad')) {
                                          newExpanded.delete('moradabad')
                                        } else {
                                          newExpanded.add('moradabad')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('moradabad') ? '−' : '+'} Moradabad
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">221,890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">19,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">13,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9,123</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,678</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,956</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">978</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">456</td>
                                </tr>
                                {expandedZones.has('moradabad') && (
                                  <>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Jaipur</td>
                                      <td className="text-right py-2 px-2 text-gray-700">110,945</td>
                                      <td className="text-right py-2 px-2 text-gray-700">9,728</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6,617</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,562</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,839</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,895</td>
                                      <td className="text-right py-2 px-2 text-gray-700">978</td>
                                      <td className="text-right py-2 px-2 text-gray-700">489</td>
                                      <td className="text-right py-2 px-2 text-gray-700">228</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Moradabad</td>
                                      <td className="text-right py-2 px-2 text-gray-700">110,945</td>
                                      <td className="text-right py-2 px-2 text-gray-700">9,728</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6,617</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,562</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,839</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,895</td>
                                      <td className="text-right py-2 px-2 text-gray-700">978</td>
                                      <td className="text-right py-2 px-2 text-gray-700">489</td>
                                      <td className="text-right py-2 px-2 text-gray-700">228</td>
                                    </tr>
                                  </>
                                )}
                                {/* Patna Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Patna</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">222,197</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">19,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">13,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,012</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,006</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">467</td>
                                </tr>
                                {/* Prayagraj Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Prayagraj</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">167,482</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10,123</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6,987</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,495</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">748</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">345</td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">958,071</td>
                                  <td className="text-right py-2 px-2 text-gray-900">84,502</td>
                                  <td className="text-right py-2 px-2 text-gray-900">57,392</td>
                                  <td className="text-right py-2 px-2 text-gray-900">39,589</td>
                                  <td className="text-right py-2 px-2 text-gray-900">24,502</td>
                                  <td className="text-right py-2 px-2 text-gray-900">16,370</td>
                                  <td className="text-right py-2 px-2 text-gray-900">8,458</td>
                                  <td className="text-right py-2 px-2 text-gray-900">4,189</td>
                                  <td className="text-right py-2 px-2 text-gray-900">1,847</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Zone and Division wise Roll Rate Analysis for AUM */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Zone and Division wise Roll Rate Analysis for AUM</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Zone</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* State rows with expandable functionality */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('bihar')) {
                                          newExpanded.delete('bihar')
                                        } else {
                                          newExpanded.add('bihar')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('bihar') ? '−' : '+'} Bihar
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700">2,456.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700">215.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">146.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">100.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700">62.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">41.67</td>
                                  <td className="text-right py-2 px-2 text-gray-700">21.52</td>
                                  <td className="text-right py-2 px-2 text-gray-700">10.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700">4.69</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('uttar-pradesh')) {
                                          newExpanded.delete('uttar-pradesh')
                                        } else {
                                          newExpanded.add('uttar-pradesh')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('uttar-pradesh') ? '−' : '+'} Uttar Pradesh
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">17,751.46</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,567.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,065.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">734.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">455.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">303.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">156.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">77.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">34.23</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Madhya Pradesh</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,456.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">304.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">207.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">142.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">88.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">58.97</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">30.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6.65</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Jharkhand</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,234.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">108.90</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">74.05</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">51.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">31.62</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">21.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5.39</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.38</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Rajasthan</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,123.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">99.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">67.41</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">46.52</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">28.79</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">19.19</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9.91</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.91</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.17</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Haryana</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">890.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">78.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">53.41</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">36.85</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">22.81</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15.21</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7.85</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.72</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Uttarakhand</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">567.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">50.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">34.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">23.51</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14.55</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9.70</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5.01</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.48</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.10</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Maharashtra</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">456.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">40.31</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">27.41</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">18.91</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">11.70</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7.80</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.03</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.99</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">0.88</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Punjab</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">345.67</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">30.51</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">20.75</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14.32</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.86</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5.91</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.05</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.51</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">0.67</td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">28,283.51</td>
                                  <td className="text-right py-2 px-2 text-gray-900">2,494.19</td>
                                  <td className="text-right py-2 px-2 text-gray-900">1,696.50</td>
                                  <td className="text-right py-2 px-2 text-gray-900">1,170.77</td>
                                  <td className="text-right py-2 px-2 text-gray-900">724.33</td>
                                  <td className="text-right py-2 px-2 text-gray-900">483.01</td>
                                  <td className="text-right py-2 px-2 text-gray-900">249.49</td>
                                  <td className="text-right py-2 px-2 text-gray-900">123.57</td>
                                  <td className="text-right py-2 px-2 text-gray-900">54.46</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Charts */}
                      <div className="space-y-4">
                        {/* Sum of Loans by Zone - Donut Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sum of Loans by Zone</h3>
                          <Chart
                            type="donut"
                            height={300}
                            series={[222197, 221890, 201240, 167482, 145262]}
                            options={{
                              chart: {
                                type: 'donut',
                                toolbar: { show: false }
                              },
                              labels: ['Patna', 'Moradabad', 'Jabalpur', 'Prayagraj', 'Gorakhpur'],
                              colors: ['#3b82f6', '#1e3a8a', '#f59e0b', '#8b5cf6', '#ec4899'],
                              legend: {
                                position: 'bottom',
                                fontSize: '11px'
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return val.toFixed(1) + '%'
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              plotOptions: {
                                pie: {
                                  donut: {
                                    size: '65%'
                                  }
                                }
                              }
                            }}
                          />
                        </div>

                        {/* Comparison Month Principle OS (Crores) by Zone - Donut Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Comparison Month Principle OS (Crores) by Zone</h3>
                          <Chart
                            type="donut"
                            height={300}
                            series={[580.58, 569.82, 515.03, 444.40, 393.48]}
                            options={{
                              chart: {
                                type: 'donut',
                                toolbar: { show: false }
                              },
                              labels: ['Patna', 'Moradabad', 'Jabalpur', 'Prayagraj', 'Gorakhpur'],
                              colors: ['#3b82f6', '#1e3a8a', '#f59e0b', '#8b5cf6', '#ec4899'],
                              legend: {
                                position: 'bottom',
                                fontSize: '11px'
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return val.toFixed(1) + '%'
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              plotOptions: {
                                pie: {
                                  donut: {
                                    size: '65%'
                                  }
                                }
                              }
                            }}
                          />
                        </div>

                        {/* Loans by State - Bar Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Loans by State</h3>
                          <Chart
                            type="bar"
                            height={400}
                            series={[{
                              name: 'Loans',
                              data: [7600483, 2456789, 3456789, 1234567, 1123456, 890123, 567890, 456789, 345678]
                            }]}
                            options={{
                              chart: {
                                type: 'bar',
                                horizontal: true,
                                toolbar: { show: false }
                              },
                              plotOptions: {
                                bar: {
                                  borderRadius: 4,
                                  horizontal: true
                                }
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return (val / 1000000).toFixed(1) + 'M'
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              xaxis: {
                                categories: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Jharkhand', 'Rajasthan', 'Haryana', 'Uttarakhand', 'Maharashtra', 'Punjab'],
                                labels: {
                                  style: { fontSize: '10px' }
                                }
                              },
                              yaxis: {
                                labels: {
                                  style: { fontSize: '10px' }
                                }
                              },
                              colors: ['#3b82f6'],
                              grid: { borderColor: '#E5E7EB' }
                            }}
                          />
                        </div>

                        {/* Comparison Month Principle OS (Crores) by State - Bar Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Comparison Month Principle OS (Crores) by State</h3>
                          <Chart
                            type="bar"
                            height={400}
                            series={[{
                              name: 'Principle OS (Crores)',
                              data: [20326.54, 5805.80, 3456.78, 1234.56, 1123.45, 890.12, 567.89, 456.78, 345.67]
                            }]}
                            options={{
                              chart: {
                                type: 'bar',
                                horizontal: true,
                                toolbar: { show: false }
                              },
                              plotOptions: {
                                bar: {
                                  borderRadius: 4,
                                  horizontal: true
                                }
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return val.toFixed(2)
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              xaxis: {
                                categories: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Jharkhand', 'Rajasthan', 'Haryana', 'Uttarakhand', 'Maharashtra', 'Punjab'],
                                labels: {
                                  style: { fontSize: '10px' },
                                  formatter: function (val) {
                                    return (val / 1000).toFixed(0) + 'K'
                                  }
                                }
                              },
                              yaxis: {
                                labels: {
                                  style: { fontSize: '10px' }
                                }
                              },
                              colors: ['#3b82f6'],
                              grid: { borderColor: '#E5E7EB' }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rollback Report Expanded Section - Roll Rate Analysis */}
                {selectedRollMetric === 'rollbackReport' && (
                  <div className="mb-8 w-full space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Roll Rate Analysis</h2>
                      <button 
                        onClick={() => setSelectedRollMetric(null)} 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close roll rate analysis section"
                      >
                        Close
                      </button>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">FunderName</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Division</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">StateName</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">DistrictName</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex border-b border-gray-200">
                        <button
                          onClick={() => setRollRateAnalysisTab('customerNumbers')}
                          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            rollRateAnalysisTab === 'customerNumbers'
                              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          Customer Numbers
                        </button>
                        <button
                          onClick={() => setRollRateAnalysisTab('customerOutstanding')}
                          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            rollRateAnalysisTab === 'customerOutstanding'
                              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          Customer Outstanding
                        </button>
                        <button
                          onClick={() => setRollRateAnalysisTab('trendAnalysis')}
                          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            rollRateAnalysisTab === 'trendAnalysis'
                              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          Trend Analysis
                        </button>
                      </div>
                    </div>

                    {/* Customer Numbers Tab Content */}
                    {rollRateAnalysisTab === 'customerNumbers' && (
                      <div className="space-y-6">
                        {/* Roll Rate Analysis for Loans */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Roll Rate Analysis for Loans</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="text-left py-2 px-2 font-semibold text-gray-700">BaseMonth_Bucket</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">New Loan</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">Roll Forward %</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">Roll Backward %</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">Stabilized %</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">Regularised %</th>
                              <th className="text-right py-2 px-2 font-semibold text-gray-700">ClosedLoan %</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">Regular</td>
                              <td className="text-right py-2 px-2 text-gray-700">665,487</td>
                              <td className="text-right py-2 px-2 text-gray-700">17,574</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">41,165</td>
                              <td className="text-right py-2 px-2 text-gray-700">2.43%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">91.89%</td>
                              <td className="text-right py-2 px-2 text-gray-700">91.89%</td>
                              <td className="text-right py-2 px-2 text-gray-700">5.68%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">1 to 30</td>
                              <td className="text-right py-2 px-2 text-gray-700">8,093</td>
                              <td className="text-right py-2 px-2 text-gray-700">14,461</td>
                              <td className="text-right py-2 px-2 text-gray-700">9,584</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,968</td>
                              <td className="text-right py-2 px-2 text-gray-700">28.10%</td>
                              <td className="text-right py-2 px-2 text-gray-700">23.73%</td>
                              <td className="text-right py-2 px-2 text-gray-700">42.40%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">5.77%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">31 to 60</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,465</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,124</td>
                              <td className="text-right py-2 px-2 text-gray-700">5,789</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,211</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                              <td className="text-right py-2 px-2 text-gray-700">39.65%</td>
                              <td className="text-right py-2 px-2 text-gray-700">15.32%</td>
                              <td className="text-right py-2 px-2 text-gray-700">37.89%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">8.14%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">61 to 90</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,567</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                              <td className="text-right py-2 px-2 text-gray-700">4,567</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,890</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">987</td>
                              <td className="text-right py-2 px-2 text-gray-700">47.23%</td>
                              <td className="text-right py-2 px-2 text-gray-700">12.45%</td>
                              <td className="text-right py-2 px-2 text-gray-700">36.98%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">7.99%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">91 to 120</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,789</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                              <td className="text-right py-2 px-2 text-gray-700">987</td>
                              <td className="text-right py-2 px-2 text-gray-700">654</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,123</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">765</td>
                              <td className="text-right py-2 px-2 text-gray-700">52.34%</td>
                              <td className="text-right py-2 px-2 text-gray-700">10.12%</td>
                              <td className="text-right py-2 px-2 text-gray-700">34.56%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">8.23%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">121 to 180</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,789</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                              <td className="text-right py-2 px-2 text-gray-700">987</td>
                              <td className="text-right py-2 px-2 text-gray-700">8,123</td>
                              <td className="text-right py-2 px-2 text-gray-700">4,567</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,456</td>
                              <td className="text-right py-2 px-2 text-gray-700">58.45%</td>
                              <td className="text-right py-2 px-2 text-gray-700">8.90%</td>
                              <td className="text-right py-2 px-2 text-gray-700">30.12%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">7.89%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">181 to 365</td>
                              <td className="text-right py-2 px-2 text-gray-700">5,678</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,789</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                              <td className="text-right py-2 px-2 text-gray-700">987</td>
                              <td className="text-right py-2 px-2 text-gray-700">12,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">6,789</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">61.23%</td>
                              <td className="text-right py-2 px-2 text-gray-700">7.45%</td>
                              <td className="text-right py-2 px-2 text-gray-700">28.34%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">8.12%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">&gt;365</td>
                              <td className="text-right py-2 px-2 text-gray-700">8,901</td>
                              <td className="text-right py-2 px-2 text-gray-700">5,678</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                              <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,789</td>
                              <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                              <td className="text-right py-2 px-2 text-gray-700">987</td>
                              <td className="text-right py-2 px-2 text-gray-700">15,678</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                              <td className="text-right py-2 px-2 text-gray-700">64.56%</td>
                              <td className="text-right py-2 px-2 text-gray-700">6.78%</td>
                              <td className="text-right py-2 px-2 text-gray-700">25.34%</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">9.12%</td>
                            </tr>
                            <tr className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2 text-gray-800 font-medium">New Loan</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">12,345</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                              <td className="text-right py-2 px-2 text-gray-700">-</td>
                            </tr>
                            <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                              <td className="py-2 px-2 text-gray-900">Total</td>
                              <td className="text-right py-2 px-2 text-gray-900">707,280</td>
                              <td className="text-right py-2 px-2 text-gray-900">33,198</td>
                              <td className="text-right py-2 px-2 text-gray-900">14,589</td>
                              <td className="text-right py-2 px-2 text-gray-900">12,350</td>
                              <td className="text-right py-2 px-2 text-gray-900">12,323</td>
                              <td className="text-right py-2 px-2 text-gray-900">23,941</td>
                              <td className="text-right py-2 px-2 text-gray-900">45,101</td>
                              <td className="text-right py-2 px-2 text-gray-900">61,788</td>
                              <td className="text-right py-2 px-2 text-gray-900">12,345</td>
                              <td className="text-right py-2 px-2 text-gray-900">47,501</td>
                              <td className="text-right py-2 px-2 text-gray-900">29.49%</td>
                              <td className="text-right py-2 px-2 text-gray-900">12.34%</td>
                              <td className="text-right py-2 px-2 text-gray-900">54.23%</td>
                              <td className="text-right py-2 px-2 text-gray-900">91.89%</td>
                              <td className="text-right py-2 px-2 text-gray-900">6.78%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                        </div>
                      </div>
                    )}

                    {/* Customer Outstanding Tab Content */}
                    {rollRateAnalysisTab === 'customerOutstanding' && (
                      <div className="space-y-6">
                        {/* Roll Rate Analysis for AUM */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Roll Rate Analysis for AUM</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">BaseMonth_Bucket</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">New Loan</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Roll Forward %</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Roll Backward %</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Stabilized %</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regularised %</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">ClosedLoan %</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">Regular</td>
                                  <td className="text-right py-2 px-2 text-gray-700">2,028.58</td>
                                  <td className="text-right py-2 px-2 text-gray-700">77.72</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">33.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">2.43%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">91.89%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">91.89%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.68%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">1 to 30</td>
                                  <td className="text-right py-2 px-2 text-gray-700">18.51</td>
                                  <td className="text-right py-2 px-2 text-gray-700">32.77</td>
                                  <td className="text-right py-2 px-2 text-gray-700">22.36</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">1.13</td>
                                  <td className="text-right py-2 px-2 text-gray-700">28.10%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">23.73%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">42.40%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.77%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">31 to 60</td>
                                  <td className="text-right py-2 px-2 text-gray-700">12.34</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">19.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">11.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">4.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">39.65%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">15.32%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">37.89%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8.14%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">61 to 90</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.87</td>
                                  <td className="text-right py-2 px-2 text-gray-700">6.54</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">18.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">12.34</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">3.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700">47.23%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">12.45%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">36.98%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.99%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">91 to 120</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">4.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">2.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700">14.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">3.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">52.34%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">10.12%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">34.56%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8.23%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">121 to 180</td>
                                  <td className="text-right py-2 px-2 text-gray-700">14.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.87</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">4.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">33.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">19.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700">58.45%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8.90%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">30.12%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.89%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">181 to 365</td>
                                  <td className="text-right py-2 px-2 text-gray-700">23.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">14.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.87</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">4.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">51.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">28.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700">61.23%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.45%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">28.34%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8.12%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">&gt;365</td>
                                  <td className="text-right py-2 px-2 text-gray-700">36.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700">23.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">14.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.87</td>
                                  <td className="text-right py-2 px-2 text-gray-700">7.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">4.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">63.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">14.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700">64.56%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">6.78%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">25.34%</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.12%</td>
                                </tr>
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2 text-gray-800 font-medium">New Loan</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">50.12</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                  <td className="text-right py-2 px-2 text-gray-700">-</td>
                                </tr>
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">2,028.58</td>
                                  <td className="text-right py-2 px-2 text-gray-900">77.72</td>
                                  <td className="text-right py-2 px-2 text-gray-900">33.12</td>
                                  <td className="text-right py-2 px-2 text-gray-900">28.31</td>
                                  <td className="text-right py-2 px-2 text-gray-900">29.11</td>
                                  <td className="text-right py-2 px-2 text-gray-900">56.94</td>
                                  <td className="text-right py-2 px-2 text-gray-900">100.15</td>
                                  <td className="text-right py-2 px-2 text-gray-900">119.89</td>
                                  <td className="text-right py-2 px-2 text-gray-900">50.12</td>
                                  <td className="text-right py-2 px-2 text-gray-900">119.89</td>
                                  <td className="text-right py-2 px-2 text-gray-900">29.49%</td>
                                  <td className="text-right py-2 px-2 text-gray-900">12.34%</td>
                                  <td className="text-right py-2 px-2 text-gray-900">54.23%</td>
                                  <td className="text-right py-2 px-2 text-gray-900">91.89%</td>
                                  <td className="text-right py-2 px-2 text-gray-900">6.78%</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trend Analysis Tab Content */}
                    {rollRateAnalysisTab === 'trendAnalysis' && (
                      <div className="space-y-6">
                        {/* Main Content Grid - Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Left Column - Tables */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Zone and Division wise Roll Rate Analysis for Loans */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Zone and Division wise Roll Rate Analysis for Loans</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Zone</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Gorakhpur Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('gorakhpur')) {
                                          newExpanded.delete('gorakhpur')
                                        } else {
                                          newExpanded.add('gorakhpur')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('gorakhpur') ? '−' : '+'} Gorakhpur
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700">145,262</td>
                                  <td className="text-right py-2 px-2 text-gray-700">12,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700">8,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700">5,678</td>
                                  <td className="text-right py-2 px-2 text-gray-700">3,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700">2,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700">1,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700">567</td>
                                  <td className="text-right py-2 px-2 text-gray-700">234</td>
                                </tr>
                                {expandedZones.has('gorakhpur') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Lucknow Division</td>
                                    <td className="text-right py-2 px-2 text-gray-700">72,631</td>
                                    <td className="text-right py-2 px-2 text-gray-700">6,228</td>
                                    <td className="text-right py-2 px-2 text-gray-700">4,117</td>
                                    <td className="text-right py-2 px-2 text-gray-700">2,839</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1,728</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1,173</td>
                                    <td className="text-right py-2 px-2 text-gray-700">617</td>
                                    <td className="text-right py-2 px-2 text-gray-700">284</td>
                                    <td className="text-right py-2 px-2 text-gray-700">117</td>
                                  </tr>
                                )}
                                {/* Jabalpur Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('jabalpur')) {
                                          newExpanded.delete('jabalpur')
                                        } else {
                                          newExpanded.add('jabalpur')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('jabalpur') ? '−' : '+'} Jabalpur
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">201,240</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">18,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15,321</td>
                                </tr>
                                {expandedZones.has('jabalpur') && (
                                  <>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Jhansi</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,830</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Katni</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,830</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Nagpur</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,830</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Sagar</td>
                                      <td className="text-right py-2 px-2 text-gray-700">50,310</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4,559</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,114</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,142</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,309</td>
                                      <td className="text-right py-2 px-2 text-gray-700">864</td>
                                      <td className="text-right py-2 px-2 text-gray-700">447</td>
                                      <td className="text-right py-2 px-2 text-gray-700">223</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,830</td>
                                    </tr>
                                  </>
                                )}
                                {/* Moradabad Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('moradabad')) {
                                          newExpanded.delete('moradabad')
                                        } else {
                                          newExpanded.add('moradabad')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('moradabad') ? '−' : '+'} Moradabad
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">179,146</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10,756</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7,412</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4,612</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,078</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,589</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">794</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10,196</td>
                                </tr>
                                {expandedZones.has('moradabad') && (
                                  <>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Jaipur</td>
                                      <td className="text-right py-2 px-2 text-gray-700">89,573</td>
                                      <td className="text-right py-2 px-2 text-gray-700">7,895</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5,378</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,706</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,306</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,539</td>
                                      <td className="text-right py-2 px-2 text-gray-700">795</td>
                                      <td className="text-right py-2 px-2 text-gray-700">397</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5,098</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Moradabad</td>
                                      <td className="text-right py-2 px-2 text-gray-700">89,573</td>
                                      <td className="text-right py-2 px-2 text-gray-700">7,895</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5,378</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3,706</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2,306</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1,539</td>
                                      <td className="text-right py-2 px-2 text-gray-700">795</td>
                                      <td className="text-right py-2 px-2 text-gray-700">397</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5,098</td>
                                    </tr>
                                  </>
                                )}
                                {/* Patna Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Patna</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">222,197</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">19,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">13,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,012</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,006</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,634</td>
                                </tr>
                                {/* Prayagraj Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Prayagraj</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">167,482</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10,123</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6,987</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,495</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">748</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9,523</td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">707,280</td>
                                  <td className="text-right py-2 px-2 text-gray-900">33,198</td>
                                  <td className="text-right py-2 px-2 text-gray-900">14,589</td>
                                  <td className="text-right py-2 px-2 text-gray-900">12,350</td>
                                  <td className="text-right py-2 px-2 text-gray-900">12,323</td>
                                  <td className="text-right py-2 px-2 text-gray-900">23,941</td>
                                  <td className="text-right py-2 px-2 text-gray-900">45,101</td>
                                  <td className="text-right py-2 px-2 text-gray-900">61,788</td>
                                  <td className="text-right py-2 px-2 text-gray-900">47,501</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Zone and Division wise Roll Rate Analysis for AUM */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Zone and Division wise Roll Rate Analysis for AUM</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Zone</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Gorakhpur Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('gorakhpur-aum')) {
                                          newExpanded.delete('gorakhpur-aum')
                                        } else {
                                          newExpanded.add('gorakhpur-aum')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('gorakhpur-aum') ? '−' : '+'} Gorakhpur
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700">393.48</td>
                                  <td className="text-right py-2 px-2 text-gray-700">33.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700">22.33</td>
                                  <td className="text-right py-2 px-2 text-gray-700">15.40</td>
                                  <td className="text-right py-2 px-2 text-gray-700">9.37</td>
                                  <td className="text-right py-2 px-2 text-gray-700">6.36</td>
                                  <td className="text-right py-2 px-2 text-gray-700">3.35</td>
                                  <td className="text-right py-2 px-2 text-gray-700">1.54</td>
                                  <td className="text-right py-2 px-2 text-gray-700">0.63</td>
                                </tr>
                                {expandedZones.has('gorakhpur-aum') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Lucknow Division</td>
                                    <td className="text-right py-2 px-2 text-gray-700">196.74</td>
                                    <td className="text-right py-2 px-2 text-gray-700">16.89</td>
                                    <td className="text-right py-2 px-2 text-gray-700">11.17</td>
                                    <td className="text-right py-2 px-2 text-gray-700">7.70</td>
                                    <td className="text-right py-2 px-2 text-gray-700">4.69</td>
                                    <td className="text-right py-2 px-2 text-gray-700">3.18</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1.67</td>
                                    <td className="text-right py-2 px-2 text-gray-700">0.77</td>
                                    <td className="text-right py-2 px-2 text-gray-700">0.32</td>
                                  </tr>
                                )}
                                {/* Jabalpur Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('jabalpur-aum')) {
                                          newExpanded.delete('jabalpur-aum')
                                        } else {
                                          newExpanded.add('jabalpur-aum')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('jabalpur-aum') ? '−' : '+'} Jabalpur
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">515.03</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">46.64</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">31.85</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">21.91</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">13.38</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.84</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.58</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.28</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">27.95</td>
                                </tr>
                                {expandedZones.has('jabalpur-aum') && (
                                  <>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Jhansi</td>
                                      <td className="text-right py-2 px-2 text-gray-700">128.76</td>
                                      <td className="text-right py-2 px-2 text-gray-700">11.66</td>
                                      <td className="text-right py-2 px-2 text-gray-700">7.96</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5.48</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3.35</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2.21</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1.14</td>
                                      <td className="text-right py-2 px-2 text-gray-700">0.57</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.99</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Katni</td>
                                      <td className="text-right py-2 px-2 text-gray-700">128.76</td>
                                      <td className="text-right py-2 px-2 text-gray-700">11.66</td>
                                      <td className="text-right py-2 px-2 text-gray-700">7.96</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5.48</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3.35</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2.21</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1.14</td>
                                      <td className="text-right py-2 px-2 text-gray-700">0.57</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.99</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Nagpur</td>
                                      <td className="text-right py-2 px-2 text-gray-700">128.76</td>
                                      <td className="text-right py-2 px-2 text-gray-700">11.66</td>
                                      <td className="text-right py-2 px-2 text-gray-700">7.96</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5.48</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3.35</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2.21</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1.14</td>
                                      <td className="text-right py-2 px-2 text-gray-700">0.57</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.99</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Sagar</td>
                                      <td className="text-right py-2 px-2 text-gray-700">128.76</td>
                                      <td className="text-right py-2 px-2 text-gray-700">11.66</td>
                                      <td className="text-right py-2 px-2 text-gray-700">7.96</td>
                                      <td className="text-right py-2 px-2 text-gray-700">5.48</td>
                                      <td className="text-right py-2 px-2 text-gray-700">3.35</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2.21</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1.14</td>
                                      <td className="text-right py-2 px-2 text-gray-700">0.57</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.99</td>
                                    </tr>
                                  </>
                                )}
                                {/* Moradabad Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedZones)
                                        if (newExpanded.has('moradabad-aum')) {
                                          newExpanded.delete('moradabad-aum')
                                        } else {
                                          newExpanded.add('moradabad-aum')
                                        }
                                        setExpandedZones(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedZones.has('moradabad-aum') ? '−' : '+'} Moradabad
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">497.49</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12.13</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">29.18</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">20.10</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12.51</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.35</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.31</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.15</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">27.66</td>
                                </tr>
                                {expandedZones.has('moradabad-aum') && (
                                  <>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Jaipur</td>
                                      <td className="text-right py-2 px-2 text-gray-700">248.75</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.07</td>
                                      <td className="text-right py-2 px-2 text-gray-700">14.59</td>
                                      <td className="text-right py-2 px-2 text-gray-700">10.05</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.26</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4.18</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2.16</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1.08</td>
                                      <td className="text-right py-2 px-2 text-gray-700">13.83</td>
                                    </tr>
                                    <tr className="bg-gray-50 border-b">
                                      <td className="py-2 px-2 pl-6 text-gray-600">Moradabad</td>
                                      <td className="text-right py-2 px-2 text-gray-700">248.75</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.07</td>
                                      <td className="text-right py-2 px-2 text-gray-700">14.59</td>
                                      <td className="text-right py-2 px-2 text-gray-700">10.05</td>
                                      <td className="text-right py-2 px-2 text-gray-700">6.26</td>
                                      <td className="text-right py-2 px-2 text-gray-700">4.18</td>
                                      <td className="text-right py-2 px-2 text-gray-700">2.16</td>
                                      <td className="text-right py-2 px-2 text-gray-700">1.08</td>
                                      <td className="text-right py-2 px-2 text-gray-700">13.83</td>
                                    </tr>
                                  </>
                                )}
                                {/* Patna Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Patna</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">580.58</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">51.19</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">34.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">24.06</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10.05</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5.20</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.60</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">34.25</td>
                                </tr>
                                {/* Prayagraj Zone */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Prayagraj</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">444.40</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">39.20</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">26.72</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">18.43</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">11.55</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7.70</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.98</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.99</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">25.84</td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">2,028.58</td>
                                  <td className="text-right py-2 px-2 text-gray-900">77.72</td>
                                  <td className="text-right py-2 px-2 text-gray-900">33.12</td>
                                  <td className="text-right py-2 px-2 text-gray-900">28.31</td>
                                  <td className="text-right py-2 px-2 text-gray-900">29.11</td>
                                  <td className="text-right py-2 px-2 text-gray-900">56.94</td>
                                  <td className="text-right py-2 px-2 text-gray-900">100.15</td>
                                  <td className="text-right py-2 px-2 text-gray-900">119.89</td>
                                  <td className="text-right py-2 px-2 text-gray-900">29.49</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Charts */}
                      <div className="space-y-4">
                        {/* Sum of Loans by Zone - Donut Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sum of Loans by Zone</h3>
                          <Chart
                            type="donut"
                            height={300}
                            series={[222197, 221890, 201240, 167482, 145262]}
                            options={{
                              chart: {
                                type: 'donut',
                                toolbar: { show: false }
                              },
                              labels: ['Patna', 'Moradabad', 'Jabalpur', 'Prayagraj', 'Gorakhpur'],
                              colors: ['#3b82f6', '#1e3a8a', '#f59e0b', '#8b5cf6', '#ec4899'],
                              legend: {
                                position: 'bottom',
                                fontSize: '11px'
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return val.toFixed(1) + '%'
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              plotOptions: {
                                pie: {
                                  donut: {
                                    size: '65%'
                                  }
                                }
                              }
                            }}
                          />
                        </div>

                        {/* Comparison Month Principle OS (Crores) by Zone - Donut Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Comparison Month Principle OS (Crores) by Zone</h3>
                          <Chart
                            type="donut"
                            height={300}
                            series={[580.58, 569.82, 515.03, 444.40, 393.48]}
                            options={{
                              chart: {
                                type: 'donut',
                                toolbar: { show: false }
                              },
                              labels: ['Patna', 'Moradabad', 'Jabalpur', 'Prayagraj', 'Gorakhpur'],
                              colors: ['#60a5fa', '#1e3a8a', '#f59e0b', '#8b5cf6', '#ec4899'],
                              legend: {
                                position: 'bottom',
                                fontSize: '11px'
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return val.toFixed(1) + '%'
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              plotOptions: {
                                pie: {
                                  donut: {
                                    size: '65%'
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* State-wise Analysis Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                      {/* Left Column - Tables */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Zone and Division wise Roll Rate Analysis for Loans - State wise */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Zone and Division wise Roll Rate Analysis for Loans</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">StateName</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Uttar Pradesh */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('uttar-pradesh')) {
                                          newExpanded.delete('uttar-pradesh')
                                        } else {
                                          newExpanded.add('uttar-pradesh')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('uttar-pradesh') ? '−' : '+'} Uttar Pradesh
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6,181,886</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">290,628</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">104,523</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">81,945</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">69,123</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">119,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">250,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">284,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">302,114</td>
                                </tr>
                                {expandedStates.has('uttar-pradesh') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Division 1</td>
                                    <td className="text-right py-2 px-2 text-gray-700">3,090,943</td>
                                    <td className="text-right py-2 px-2 text-gray-700">145,314</td>
                                    <td className="text-right py-2 px-2 text-gray-700">52,262</td>
                                    <td className="text-right py-2 px-2 text-gray-700">40,973</td>
                                    <td className="text-right py-2 px-2 text-gray-700">34,562</td>
                                    <td className="text-right py-2 px-2 text-gray-700">59,784</td>
                                    <td className="text-right py-2 px-2 text-gray-700">125,117</td>
                                    <td className="text-right py-2 px-2 text-gray-700">142,284</td>
                                    <td className="text-right py-2 px-2 text-gray-700">151,057</td>
                                  </tr>
                                )}
                                {/* Bihar */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('bihar')) {
                                          newExpanded.delete('bihar')
                                        } else {
                                          newExpanded.add('bihar')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('bihar') ? '−' : '+'} Bihar
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,531,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">118,945</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">42,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">33,567</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">28,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">49,012</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">102,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">116,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">123,567</td>
                                </tr>
                                {expandedStates.has('bihar') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Division 1</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1,265,728</td>
                                    <td className="text-right py-2 px-2 text-gray-700">59,473</td>
                                    <td className="text-right py-2 px-2 text-gray-700">21,395</td>
                                    <td className="text-right py-2 px-2 text-gray-700">16,784</td>
                                    <td className="text-right py-2 px-2 text-gray-700">14,173</td>
                                    <td className="text-right py-2 px-2 text-gray-700">24,506</td>
                                    <td className="text-right py-2 px-2 text-gray-700">51,228</td>
                                    <td className="text-right py-2 px-2 text-gray-700">58,117</td>
                                    <td className="text-right py-2 px-2 text-gray-700">61,784</td>
                                  </tr>
                                )}
                                {/* Madhya Pradesh */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('madhya-pradesh')) {
                                          newExpanded.delete('madhya-pradesh')
                                        } else {
                                          newExpanded.add('madhya-pradesh')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('madhya-pradesh') ? '−' : '+'} Madhya Pradesh
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,108,712</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">99,123</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">35,678</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">27,945</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">23,612</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">40,845</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">85,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">96,890</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">102,945</td>
                                </tr>
                                {expandedStates.has('madhya-pradesh') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Division 1</td>
                                    <td className="text-right py-2 px-2 text-gray-700">1,054,356</td>
                                    <td className="text-right py-2 px-2 text-gray-700">49,562</td>
                                    <td className="text-right py-2 px-2 text-gray-700">17,839</td>
                                    <td className="text-right py-2 px-2 text-gray-700">13,973</td>
                                    <td className="text-right py-2 px-2 text-gray-700">11,806</td>
                                    <td className="text-right py-2 px-2 text-gray-700">20,423</td>
                                    <td className="text-right py-2 px-2 text-gray-700">42,673</td>
                                    <td className="text-right py-2 px-2 text-gray-700">48,445</td>
                                    <td className="text-right py-2 px-2 text-gray-700">51,473</td>
                                  </tr>
                                )}
                                {/* Jharkhand */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Jharkhand</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">311,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14,623</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,267</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4,128</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,489</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6,034</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,612</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14,312</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15,203</td>
                                </tr>
                                {/* Rajasthan */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Rajasthan</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">271,456</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,756</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4,592</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,601</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,042</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,262</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">11,001</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,484</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">13,262</td>
                                </tr>
                                {/* Haryana */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Haryana</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">265,123</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,461</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4,486</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,518</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,972</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">5,141</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10,748</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,195</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12,955</td>
                                </tr>
                                {/* Uttarakhand */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Uttarakhand</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">195,234</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9,176</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,304</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,591</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,189</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,787</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7,917</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8,984</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9,543</td>
                                </tr>
                                {/* Maharashtra */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Maharashtra</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">62,345</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,930</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,055</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">827</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">699</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,209</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,527</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,867</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3,045</td>
                                </tr>
                                {/* Punjab */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Punjab</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">59,789</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,810</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,012</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">793</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">670</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,159</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,423</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,750</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2,921</td>
                                </tr>
                                {/* Chhattisgarh */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Chhattisgarh</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">31,140</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,463</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">527</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">413</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">349</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">604</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,262</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,432</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1,521</td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">11,616,839</td>
                                  <td className="text-right py-2 px-2 text-gray-900">622,590</td>
                                  <td className="text-right py-2 px-2 text-gray-900">224,065</td>
                                  <td className="text-right py-2 px-2 text-gray-900">175,356</td>
                                  <td className="text-right py-2 px-2 text-gray-900">147,870</td>
                                  <td className="text-right py-2 px-2 text-gray-900">255,779</td>
                                  <td className="text-right py-2 px-2 text-gray-900">534,986</td>
                                  <td className="text-right py-2 px-2 text-gray-900">607,255</td>
                                  <td className="text-right py-2 px-2 text-gray-900">599,275</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Zone and Division wise Roll Rate Analysis for AUM - State wise */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Zone and Division wise Roll Rate Analysis for AUM</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-b">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-700">StateName</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Regular</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">1 to 30</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">31 to 60</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">61 to 90</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">91 to 120</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">121 to 180</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">181 to 365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">&gt;365</th>
                                  <th className="text-right py-2 px-2 font-semibold text-gray-700">Closed Loan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Uttar Pradesh */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('uttar-pradesh-aum')) {
                                          newExpanded.delete('uttar-pradesh-aum')
                                        } else {
                                          newExpanded.add('uttar-pradesh-aum')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('uttar-pradesh-aum') ? '−' : '+'} Uttar Pradesh
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">17,751.46</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">666.04</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">239.65</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">187.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">158.56</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">274.35</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">573.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">651.45</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">198.86</td>
                                </tr>
                                {expandedStates.has('uttar-pradesh-aum') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Division 1</td>
                                    <td className="text-right py-2 px-2 text-gray-700">8,875.73</td>
                                    <td className="text-right py-2 px-2 text-gray-700">333.02</td>
                                    <td className="text-right py-2 px-2 text-gray-700">119.83</td>
                                    <td className="text-right py-2 px-2 text-gray-700">93.95</td>
                                    <td className="text-right py-2 px-2 text-gray-700">79.28</td>
                                    <td className="text-right py-2 px-2 text-gray-700">137.18</td>
                                    <td className="text-right py-2 px-2 text-gray-700">286.89</td>
                                    <td className="text-right py-2 px-2 text-gray-700">325.73</td>
                                    <td className="text-right py-2 px-2 text-gray-700">99.43</td>
                                  </tr>
                                )}
                                {/* Bihar */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('bihar-aum')) {
                                          newExpanded.delete('bihar-aum')
                                        } else {
                                          newExpanded.add('bihar-aum')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('bihar-aum') ? '−' : '+'} Bihar
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7,265.80</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">341.29</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">122.80</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">96.33</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">81.35</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">140.66</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">294.05</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">333.54</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">354.48</td>
                                </tr>
                                {expandedStates.has('bihar-aum') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Division 1</td>
                                    <td className="text-right py-2 px-2 text-gray-700">3,632.90</td>
                                    <td className="text-right py-2 px-2 text-gray-700">170.65</td>
                                    <td className="text-right py-2 px-2 text-gray-700">61.40</td>
                                    <td className="text-right py-2 px-2 text-gray-700">48.17</td>
                                    <td className="text-right py-2 px-2 text-gray-700">40.68</td>
                                    <td className="text-right py-2 px-2 text-gray-700">70.33</td>
                                    <td className="text-right py-2 px-2 text-gray-700">147.03</td>
                                    <td className="text-right py-2 px-2 text-gray-700">166.77</td>
                                    <td className="text-right py-2 px-2 text-gray-700">177.24</td>
                                  </tr>
                                )}
                                {/* Madhya Pradesh */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <button
                                      onClick={() => {
                                        const newExpanded = new Set(expandedStates)
                                        if (newExpanded.has('madhya-pradesh-aum')) {
                                          newExpanded.delete('madhya-pradesh-aum')
                                        } else {
                                          newExpanded.add('madhya-pradesh-aum')
                                        }
                                        setExpandedStates(newExpanded)
                                      }}
                                      className="flex items-center gap-1 text-gray-800 font-medium"
                                    >
                                      {expandedStates.has('madhya-pradesh-aum') ? '−' : '+'} Madhya Pradesh
                                    </button>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6,052.00</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">284.44</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">102.40</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">80.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">67.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">117.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">244.99</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">278.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">295.45</td>
                                </tr>
                                {expandedStates.has('madhya-pradesh-aum') && (
                                  <tr className="bg-gray-50 border-b">
                                    <td className="py-2 px-2 pl-6 text-gray-600">Division 1</td>
                                    <td className="text-right py-2 px-2 text-gray-700">3,026.00</td>
                                    <td className="text-right py-2 px-2 text-gray-700">142.22</td>
                                    <td className="text-right py-2 px-2 text-gray-700">51.20</td>
                                    <td className="text-right py-2 px-2 text-gray-700">40.12</td>
                                    <td className="text-right py-2 px-2 text-gray-700">33.89</td>
                                    <td className="text-right py-2 px-2 text-gray-700">58.62</td>
                                    <td className="text-right py-2 px-2 text-gray-700">122.50</td>
                                    <td className="text-right py-2 px-2 text-gray-700">139.04</td>
                                    <td className="text-right py-2 px-2 text-gray-700">147.73</td>
                                  </tr>
                                )}
                                {/* Jharkhand */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Jharkhand</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">893.04</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">41.97</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15.11</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">11.85</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10.01</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">17.32</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">36.20</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">41.08</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">43.63</td>
                                </tr>
                                {/* Rajasthan */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Rajasthan</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">779.18</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">36.61</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">13.18</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10.34</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.73</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">15.10</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">31.57</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">35.83</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">38.06</td>
                                </tr>
                                {/* Haryana */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Haryana</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">760.70</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">35.75</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">12.87</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10.10</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.53</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">14.75</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">30.85</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">35.00</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">37.18</td>
                                </tr>
                                {/* Uttarakhand */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Uttarakhand</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">560.32</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">26.33</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">9.48</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7.44</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6.28</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">10.87</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">22.72</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">25.78</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">27.39</td>
                                </tr>
                                {/* Maharashtra */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Maharashtra</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">178.93</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.41</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.03</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.37</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.01</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.47</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7.25</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.23</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.74</td>
                                </tr>
                                {/* Punjab */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Punjab</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">171.59</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.06</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.90</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">2.28</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.92</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.33</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">6.95</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">7.89</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">8.38</td>
                                </tr>
                                {/* Chhattisgarh */}
                                <tr className="border-b hover:bg-gray-50">
                                  <td className="py-2 px-2">
                                    <span className="text-gray-800 font-medium">Chhattisgarh</span>
                                  </td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">89.37</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.20</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.51</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.19</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.00</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">1.73</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">3.62</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.11</td>
                                  <td className="text-right py-2 px-2 text-gray-700 font-semibold">4.37</td>
                                </tr>
                                {/* Total Row */}
                                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                                  <td className="py-2 px-2 text-gray-900">Total</td>
                                  <td className="text-right py-2 px-2 text-gray-900">33,237.95</td>
                                  <td className="text-right py-2 px-2 text-gray-900">1,407.42</td>
                                  <td className="text-right py-2 px-2 text-gray-900">484.16</td>
                                  <td className="text-right py-2 px-2 text-gray-900">376.67</td>
                                  <td className="text-right py-2 px-2 text-gray-900">319.27</td>
                                  <td className="text-right py-2 px-2 text-gray-900">552.65</td>
                                  <td className="text-right py-2 px-2 text-gray-900">1,115.84</td>
                                  <td className="text-right py-2 px-2 text-gray-900">1,114.19</td>
                                  <td className="text-right py-2 px-2 text-gray-900">358.85</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Charts */}
                      <div className="space-y-4">
                        {/* Loans by State - Horizontal Bar Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Loans by State</h3>
                          <Chart
                            type="bar"
                            height={400}
                            series={[{
                              name: 'Loans',
                              data: [7600483, 3111032, 2588299, 383644, 334231, 326578, 240645, 76803, 73549, 31140]
                            }]}
                            options={{
                              chart: {
                                type: 'bar',
                                horizontal: true,
                                toolbar: { show: false }
                              },
                              plotOptions: {
                                bar: {
                                  borderRadius: 4,
                                  horizontal: true
                                }
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return (val / 1000000).toFixed(1) + 'M'
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              xaxis: {
                                categories: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Jharkhand', 'Rajasthan', 'Haryana', 'Uttarakhand', 'Maharashtra', 'Punjab', 'Chhattisgarh'],
                                labels: {
                                  style: { fontSize: '10px' },
                                  formatter: function (val) {
                                    return (val / 1000000).toFixed(1) + 'M'
                                  }
                                }
                              },
                              yaxis: {
                                labels: {
                                  style: { fontSize: '10px' }
                                }
                              },
                              colors: ['#3b82f6'],
                              grid: { borderColor: '#E5E7EB' }
                            }}
                          />
                        </div>

                        {/* Comparison Month Principle OS (Crores) by State - Horizontal Bar Chart */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Comparison Month Principle OS (Crores) by State</h3>
                          <Chart
                            type="bar"
                            height={400}
                            series={[{
                              name: 'Principle OS (Crores)',
                              data: [20326.54, 8615.60, 6397.14, 973.67, 860.29, 818.16, 561.88, 143.32, 137.78, 80.57]
                            }]}
                            options={{
                              chart: {
                                type: 'bar',
                                horizontal: true,
                                toolbar: { show: false }
                              },
                              plotOptions: {
                                bar: {
                                  borderRadius: 4,
                                  horizontal: true
                                }
                              },
                              dataLabels: {
                                enabled: true,
                                formatter: function (val) {
                                  return val.toFixed(2)
                                },
                                style: {
                                  fontSize: '10px'
                                }
                              },
                              xaxis: {
                                categories: ['Uttar Pradesh', 'Bihar', 'Madhya Pradesh', 'Jharkhand', 'Rajasthan', 'Haryana', 'Uttarakhand', 'Maharashtra', 'Punjab', 'Chhattisgarh'],
                                labels: {
                                  style: { fontSize: '10px' },
                                  formatter: function (val) {
                                    return (val / 1000).toFixed(0) + 'K'
                                  }
                                }
                              },
                              yaxis: {
                                labels: {
                                  style: { fontSize: '10px' }
                                }
                              },
                              colors: ['#3b82f6'],
                              grid: { borderColor: '#E5E7EB' }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trend Charts Section - Move to Trend Analysis Tab */}
                {selectedRollMetric === 'rollbackReport' && (
                  <div className="mb-8 w-full space-y-6 mt-6">
                    <h2 className="text-xl font-semibold text-gray-900">Trend Analysis (Lakhs)</h2>
                    
                    {/* Top 6 Charts in 2x3 Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Row 1: Roll Forward and Roll Backward */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Roll Forward Trend (Lakhs)</h3>
                        <Chart
                          type="line"
                          height={200}
                          series={[{
                            name: 'Roll Forward',
                            data: [0.59, 0.49, 0.50, 0.57, 0.61, 0.58, 0.72, 0.84, 0.83, 0.97, 0.82, 0.77, 0.74, 0.61, 0.20]
                          }]}
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              zoom: { enabled: false }
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 2,
                              colors: ['#60a5fa']
                            },
                            markers: {
                              size: 4,
                              colors: ['#60a5fa']
                            },
                            xaxis: {
                              categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                              labels: {
                                style: { fontSize: '10px' },
                                rotate: -45
                              }
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '10px' },
                                formatter: function (val) {
                                  return val.toFixed(2)
                                }
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toFixed(2)
                              },
                              style: {
                                fontSize: '9px',
                                colors: ['#374151']
                              }
                            },
                            grid: {
                              borderColor: '#E5E7EB',
                              strokeDashArray: 3
                            },
                            colors: ['#60a5fa']
                          }}
                        />
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Roll Backward Trend (Lakhs)</h3>
                        <Chart
                          type="line"
                          height={200}
                          series={[{
                            name: 'Roll Backward',
                            data: [0.15, 0.14, 0.13, 0.11, 0.14, 0.12, 0.11, 0.12, 0.14, 0.13, 0.19, 0.12, 0.11, 0.09, 0.02]
                          }]}
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              zoom: { enabled: false }
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 2,
                              colors: ['#60a5fa']
                            },
                            markers: {
                              size: 4,
                              colors: ['#60a5fa']
                            },
                            xaxis: {
                              categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                              labels: {
                                style: { fontSize: '10px' },
                                rotate: -45
                              }
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '10px' },
                                formatter: function (val) {
                                  return val.toFixed(2)
                                }
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toFixed(2)
                              },
                              style: {
                                fontSize: '9px',
                                colors: ['#374151']
                              }
                            },
                            grid: {
                              borderColor: '#E5E7EB',
                              strokeDashArray: 3
                            },
                            colors: ['#60a5fa']
                          }}
                        />
                      </div>

                      {/* Row 2: Stabilized and Regularised */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Stabilized Trend (Lakhs)</h3>
                        <Chart
                          type="line"
                          height={200}
                          series={[{
                            name: 'Stabilized',
                            data: [9.28, 9.28, 9.02, 8.85, 8.77, 8.74, 8.60, 8.49, 8.56, 8.45, 8.38, 8.36, 8.25, 8.32, 8.80]
                          }]}
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              zoom: { enabled: false }
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 2,
                              colors: ['#60a5fa']
                            },
                            markers: {
                              size: 4,
                              colors: ['#60a5fa']
                            },
                            xaxis: {
                              categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                              labels: {
                                style: { fontSize: '10px' },
                                rotate: -45
                              }
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '10px' },
                                formatter: function (val) {
                                  return val.toFixed(2)
                                }
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toFixed(2)
                              },
                              style: {
                                fontSize: '9px',
                                colors: ['#374151']
                              }
                            },
                            grid: {
                              borderColor: '#E5E7EB',
                              strokeDashArray: 3
                            },
                            colors: ['#60a5fa']
                          }}
                        />
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Regularised Trend (Lakhs)</h3>
                        <Chart
                          type="line"
                          height={200}
                          series={[{
                            name: 'Regularised',
                            data: [0.13, 0.12, 0.11, 0.10, 0.12, 0.11, 0.10, 0.11, 0.12, 0.12, 0.18, 0.10, 0.09, 0.08, 0.02]
                          }]}
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              zoom: { enabled: false }
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 2,
                              colors: ['#60a5fa']
                            },
                            markers: {
                              size: 4,
                              colors: ['#60a5fa']
                            },
                            xaxis: {
                              categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                              labels: {
                                style: { fontSize: '10px' },
                                rotate: -45
                              }
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '10px' },
                                formatter: function (val) {
                                  return val.toFixed(2)
                                }
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toFixed(2)
                              },
                              style: {
                                fontSize: '9px',
                                colors: ['#374151']
                              }
                            },
                            grid: {
                              borderColor: '#E5E7EB',
                              strokeDashArray: 3
                            },
                            colors: ['#60a5fa']
                          }}
                        />
                      </div>

                      {/* Row 3: Closed Loans and New Loans */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Closed Loans Trend (Lakhs)</h3>
                        <Chart
                          type="line"
                          height={200}
                          series={[{
                            name: 'Closed Loans',
                            data: [0.55, 0.53, 0.42, 0.44, 0.47, 0.38, 0.40, 0.36, 0.38, 0.40, 0.31, 0.42, 0.48, 0.44, 0.01]
                          }]}
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              zoom: { enabled: false }
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 2,
                              colors: ['#60a5fa']
                            },
                            markers: {
                              size: 4,
                              colors: ['#60a5fa']
                            },
                            xaxis: {
                              categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                              labels: {
                                style: { fontSize: '10px' },
                                rotate: -45
                              }
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '10px' },
                                formatter: function (val) {
                                  return val.toFixed(2)
                                }
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toFixed(2)
                              },
                              style: {
                                fontSize: '9px',
                                colors: ['#374151']
                              }
                            },
                            grid: {
                              borderColor: '#E5E7EB',
                              strokeDashArray: 3
                            },
                            colors: ['#60a5fa']
                          }}
                        />
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">New Loans Trend (Lakhs)</h3>
                        <Chart
                          type="line"
                          height={200}
                          series={[{
                            name: 'New Loans',
                            data: [0.46, 0.43, 0.16, 0.31, 0.45, 0.32, 0.39, 0.38, 0.45, 0.43, 0.15, 0.28, 0.33, 0.36, 0.36]
                          }]}
                          options={{
                            chart: {
                              type: 'line',
                              toolbar: { show: false },
                              zoom: { enabled: false }
                            },
                            stroke: {
                              curve: 'smooth',
                              width: 2,
                              colors: ['#60a5fa']
                            },
                            markers: {
                              size: 4,
                              colors: ['#60a5fa']
                            },
                            xaxis: {
                              categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                              labels: {
                                style: { fontSize: '10px' },
                                rotate: -45
                              }
                            },
                            yaxis: {
                              labels: {
                                style: { fontSize: '10px' },
                                formatter: function (val) {
                                  return val.toFixed(2)
                                }
                              }
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function (val) {
                                return val.toFixed(2)
                              },
                              style: {
                                fontSize: '9px',
                                colors: ['#374151']
                              }
                            },
                            grid: {
                              borderColor: '#E5E7EB',
                              strokeDashArray: 3
                            },
                            colors: ['#60a5fa']
                          }}
                        />
                      </div>
                    </div>

                    {/* Total Loans Trend - Full Width */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Total Loans Trend (Lakhs)</h3>
                      <Chart
                        type="line"
                        height={300}
                        series={[{
                          name: 'Total Loans',
                          data: [10.57, 10.45, 10.08, 9.97, 9.99, 9.83, 9.83, 9.82, 9.91, 9.96, 9.70, 9.67, 9.58, 9.46, 9.02]
                        }]}
                        options={{
                          chart: {
                            type: 'line',
                            toolbar: { show: false },
                            zoom: { enabled: false }
                          },
                          stroke: {
                            curve: 'smooth',
                            width: 2,
                            colors: ['#60a5fa']
                          },
                          markers: {
                            size: 4,
                            colors: ['#60a5fa']
                          },
                          xaxis: {
                            categories: ['Jan 24', 'Feb 24', 'Mar 24', 'Apr 24', 'May 24', 'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25'],
                            labels: {
                              style: { fontSize: '10px' },
                              rotate: -45
                            }
                          },
                          yaxis: {
                            labels: {
                              style: { fontSize: '10px' },
                              formatter: function (val) {
                                return val.toFixed(2)
                              }
                            }
                          },
                          dataLabels: {
                            enabled: true,
                            formatter: function (val) {
                              return val.toFixed(2)
                            },
                            style: {
                              fontSize: '9px',
                              colors: ['#374151']
                            }
                          },
                          grid: {
                            borderColor: '#E5E7EB',
                            strokeDashArray: 3
                          },
                          colors: ['#60a5fa']
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Reposition Expanded Section */}
                {selectedCaseMetric === 'reposition' && (
                  <div ref={leaderboardTableRef} className="mb-8 w-full space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Reposition - Details</h2>
                      <button 
                        onClick={() => setSelectedCaseMetric(null)} 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close reposition tables"
                      >
                        Close
                      </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Repo Cases</div>
                        <div className="text-2xl font-bold text-gray-900">107,287</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Outstanding Amount</div>
                        <div className="text-2xl font-bold text-gray-900">₹489.46Cr</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Vehicles Sold</div>
                        <div className="text-2xl font-bold text-gray-900">24</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Cases Allocated</div>
                        <div className="text-2xl font-bold text-gray-900">88,712</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Surrendered Cases</div>
                        <div className="text-2xl font-bold text-gray-900">78</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">Total Reposition Cases</div>
                        <div className="text-2xl font-bold text-gray-900">31</div>
                      </div>
                    </div>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">{renderPortfolioWiseSummaryTable()}</div>
                      <div className="lg:col-span-2">{renderDPDWiseSummaryTable()}</div>
                      <div>{renderApplicationStatusSummaryTable()}</div>
                      <div>{renderRepossessionStatusSummaryTable()}</div>
                    </div>
                  </div>
                )}

                {/* Deposition Table - Show when deposition card is clicked */}
                {selectedCaseMetric === 'deposition' && (
                  <div ref={leaderboardTableRef} className="mb-8 w-full space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Deposition Data</h2>
                      <button
                        onClick={() => setSelectedCaseMetric(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        aria-label="Close deposition table"
                      >
                        Close
                      </button>
                    </div>
                    {renderDepositionTable()}
                  </div>
                )}

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