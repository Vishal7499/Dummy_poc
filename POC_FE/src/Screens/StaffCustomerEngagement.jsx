import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import StaffSidebar from '../components/StaffSidebar'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

// Dummy data matching the dashboard image
const dummyData = {
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
  },
  timelineData: [
    { date: '23-10-2025', value: 0, isHoliday: false },
    { date: '24-10-2025', value: 1, isHoliday: false },
    { date: '25-10-2025', value: 0, isHoliday: true },
    { date: '26-10-2025', value: 0, isHoliday: true },
    { date: '27-10-2025', value: 8, isHoliday: false },
    { date: '28-10-2025', value: 0, isHoliday: false },
    { date: '29-10-2025', value: 0, isHoliday: false }
  ]
};

const CustomerEngagement = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [selectedDays, setSelectedDays] = useState('Last 15 days');
  const [selectedDate, setSelectedDate] = useState('27-10-2025');
  const [expanded, setExpanded] = useState(true);
  const mainContentRef = React.useRef(null);
  const navigate = useNavigate();
  const timelineScrollRef = React.useRef(null);

  // Helpers for date parsing/formatting (DD-MM-YYYY)
  const parseDate = (str) => {
    const [dd, mm, yyyy] = str.split('-').map(Number)
    return new Date(yyyy, mm - 1, dd)
  }

  const formatDate = (dateObj) => {
    const dd = String(dateObj.getDate()).padStart(2, '0')
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const yyyy = dateObj.getFullYear()
    return `${dd}-${mm}-${yyyy}`
  }

  const getMonthDays = (dateStr) => {
    const base = parseDate(dateStr)
    const year = base.getFullYear()
    const month = base.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const total = last.getDate()
    const dataMap = new Map(dummyData.timelineData.map(d => [d.date, d]))
    const days = []
    for (let d = 1; d <= total; d++) {
      const dt = new Date(year, month, d)
      const key = formatDate(dt)
      const item = dataMap.get(key)
      days.push({
        date: key,
        value: item ? item.value : 0,
        isHoliday: item ? !!item.isHoliday : false,
      })
    }
    return days
  }

  const monthDays = getMonthDays(selectedDate)

  const scrollTimeline = (dir) => {
    const el = timelineScrollRef.current
    if (!el) return
    const amount = Math.floor(el.clientWidth * 0.8)
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Chart configuration
  const chartOptions = {
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
      categories: dummyData.chartData.dates,
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
  };

  const chartSeries = [{
    name: 'Engagement',
    data: dummyData.chartData.values
  }];

  // No external slider; using Tailwind horizontal scroll instead

  // Click outside handler to close sidebar
  React.useEffect(() => {
    const handleClickOutside = (event) => {
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

  return (
    <div className="h-screen font-['Montserrat'] flex" style={{background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'}}>
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-0 overflow-hidden'}`}>
        <StaffSidebar 
          isMobileOpen={isMobileSidebarOpen} 
          setIsMobileOpen={setIsMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>
      {!isSidebarCollapsed && (
        <div className="fixed inset-y-0 left-0 z-50 w-68 bg-white border-r border-gray-200 shadow-lg">
          <StaffSidebar 
            isMobileOpen={isMobileSidebarOpen} 
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>
      )}
      <div ref={mainContentRef} className="flex flex-col overflow-hidden flex-1">
        <Navbar 
          onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
          

            {/* Timeline */}
            <div className="p-4">
              <div className="flex items-center gap-2">
                <button onClick={() => scrollTimeline('left')} className="px-2 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">⟨</button>
                <div ref={timelineScrollRef} className="flex-1 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-2 min-w-max">
                    {monthDays.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(item.date)}
                        className={`relative px-4 py-3 rounded-lg border text-xs snap-start transition-colors shadow-sm ${selectedDate === item.date ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-700'} ${item.isHoliday ? 'ring-1 ring-red-200 pt-5' : ''}`}
                      >
                        {item.isHoliday && <span className="absolute top-1 left-2 z-10 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded shadow">Holiday</span>}
                        <div className="font-semibold text-base">{item.value}</div>
                        <div className="text-[11px] text-gray-500">{item.date}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => scrollTimeline('right')} className="px-2 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">⟩</button>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Total Engagement + Breakdown */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">Total Customers Engagement</div>
                    <div className="text-2xl font-bold text-gray-800">{dummyData.totalEngagement.toLocaleString()}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">💬</div>
                      <div className="text-sm font-semibold text-green-800">{dummyData.engagementBreakdown.whatsapp.toLocaleString()}</div>
                      <div className="text-xs text-green-700">WhatsApp</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">🔊</div>
                      <div className="text-sm font-semibold text-blue-800">{dummyData.engagementBreakdown.blaster.toLocaleString()}</div>
                      <div className="text-xs text-blue-700">Blaster</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">🤖</div>
                      <div className="text-sm font-semibold text-purple-800">{dummyData.engagementBreakdown.aiCalls.toLocaleString()}</div>
                      <div className="text-xs text-purple-700">AI Calls</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">📞</div>
                      <div className="text-sm font-semibold text-orange-800">{dummyData.engagementBreakdown.dialers.toLocaleString()}</div>
                      <div className="text-xs text-orange-700">Dialers</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">👤</div>
                      <div className="text-base font-semibold text-gray-800">{dummyData.customerMetrics.totalCustomers.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Total Customers</div>
                    </div>
                    <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">👥</div>
                      <div className="text-base font-semibold text-gray-800">{dummyData.customerMetrics.connectedCustomers.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Connected</div>
                    </div>
                    <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">💰</div>
                      <div className="text-base font-semibold text-gray-800">₹{dummyData.customerMetrics.amountPromised.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Amount Promised</div>
                    </div>
                    <div className="col-span-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-2xl">💳</div>
                      <div className="text-base font-semibold text-gray-800">₹{dummyData.customerMetrics.amountCollected.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Amount Collected</div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Customers Engagement</h4>
                    <select 
                      value={selectedDays} 
                      onChange={(e) => setSelectedDays(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Last 7 days">Last 7 days</option>
                      <option value="Last 15 days">Last 15 days</option>
                      <option value="Last 30 days">Last 30 days</option>
                    </select>
                  </div>
                  <Chart options={chartOptions} series={chartSeries} type="bar" height={260} />
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between border-b border-green-200 pb-2 mb-2">
                    <span className="text-sm font-semibold text-green-800"><span className="text-green-500 mr-2">●</span>Promised to Pay</span>
                    <div className="text-xl">📄</div>
                  </div>
                  <div className="text-xs text-gray-600">Accounts</div>
                  <div className="text-base font-semibold text-gray-900">{dummyData.statusCards.promisedToPay.accounts.toLocaleString()}</div>
                  <div className="mt-2 text-xs text-gray-600">Amount</div>
                  <div className="text-base font-semibold text-gray-900">₹{dummyData.statusCards.promisedToPay.amount.toLocaleString()}</div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between border-b border-red-200 pb-2 mb-2">
                    <span className="text-sm font-semibold text-red-800"><span className="text-red-500 mr-2">●</span>Refused to Pay</span>
                    <div className="text-xl">🔄</div>
                  </div>
                  <div className="text-xs text-gray-600">Accounts</div>
                  <div className="text-base font-semibold text-gray-900">{dummyData.statusCards.refusedToPay.accounts.toLocaleString()}</div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-2">
                    <span className="text-sm font-semibold text-blue-800"><span className="text-blue-500 mr-2">●</span>Already Paid</span>
                    <div className="text-xl">💰</div>
                  </div>
                  <div className="text-xs text-gray-600">Accounts</div>
                  <div className="text-base font-semibold text-gray-900">{dummyData.statusCards.alreadyPaid.accounts.toLocaleString()}</div>
                  <div className="mt-2 text-xs text-gray-600">Amount</div>
                  <div className="text-base font-semibold text-gray-900">₹{dummyData.statusCards.alreadyPaid.amount.toLocaleString()}</div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                    <span className="text-sm font-semibold text-gray-800"><span className="text-blue-500 mr-2">●</span>Wrong Number</span>
                    <div className="text-xl">📞</div>
                  </div>
                  <div className="text-xs text-gray-600">Accounts</div>
                  <div className="text-base font-semibold text-gray-900">{dummyData.statusCards.wrongNumber.accounts.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerEngagement;
