import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import './Dashboard.scss';

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

  // Timeline slider settings
  const timelineSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 2,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

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
          <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
              <div className="header-left">
                <button className="back-button">
                  ← Dashboard
                </button>
              </div>
              <div className="header-center">
                <h3 className="company-title">
                  AARTHSIDDHI SERVICES PRIVATE LTD
                </h3>
              </div>
              <div className="header-right">
                <button className="header-icon">🔍</button>
                <button className="header-icon">👤</button>
              </div>
            </div>

            {/* Timeline */}
            <div className="timeline-container">
              <div className="flex items-center justify-between gap-1">
                <button className="move-btn text-2xl">
                  ⟪
                </button>
                <button className="move-btn text-xl">
                  ⟨
                </button>
                
                <div className="slider-container" style={{ flex: 1, minWidth: 0 }}>
                  <Slider {...timelineSettings}>
                    {dummyData.timelineData.map((item, index) => (
                      <div
                        key={index}
                        className={`d-card ${index === dummyData.timelineData.length - 1 ? 'last-card' : ''}`}
                        onClick={() => setSelectedDate(item.date)}
                      >
                        <div
                          className={`timeline-card ${selectedDate === item.date ? 'selected' : ''} ${item.isHoliday ? 'holiday-card' : ''}`}
                        >
                          {item.isHoliday && <span className="ribbon">Holiday</span>}
                          <span className={`value ${selectedDate === item.date ? 'selected-text' : ''}`}>
                            {item.value}
                          </span>
                          <span className={`date ${selectedDate === item.date ? 'selected-text' : ''}`}>
                            {item.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
                
                <button className="move-btn text-xl">
                  ⟩
                </button>
                <button className="move-btn text-2xl">
                  ⟫
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
              {/* Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Left Side - Total Customers Engagement Card + Customer Metrics */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                  {/* Total Customers Engagement Card */}
                  <div className="customer-engagement flex-1">
                    {/* Total customer engagement */}
                    <div
                      className="total-container flex gap-1"
                      style={{ flexDirection: `${!expanded ? "column" : "row"}` }}
                    >
                      {/* <img
                        src="/api/placeholder/30/30"
                        alt="engagement-customer"
                        className="img-icon"
                      /> */}
                      <div className="flex justify-between" style={{ flex: 1 }}>
                        <span className={`title ${!expanded ? "down" : "up"}`}>
                          Total Customers Engagement
                        </span>
                        <span className="value">
                          {dummyData.totalEngagement.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Engagement breakdown */}
                    <div className="dropdown-container" style={{ padding: `${expanded ? "0.3rem 0.7rem" : "0.7rem"}` }}>
                      <button
                        className="arrow-container"
                        onClick={() => setExpanded(!expanded)}
                      >
                        <span className={`arrow ${!expanded ? "down" : "up"}`}></span>
                      </button>
                      {expanded && (
                        <div className="normal flex gap-1 justify-between items-end">
                          <div className="size-increase flex flex-col items-center flex-wrap justify-center">
                            <div className="img-div">
                              💬
                            </div>
                            <span className="engagement-value">
                              {dummyData.engagementBreakdown.whatsapp.toLocaleString()}
                            </span>
                            <span className="engagement-text">WhatsApp</span>
                          </div>
                          
                          <div className="size-increase flex flex-col items-center flex-wrap justify-center">
                            <div className="img-div">
                              🔊
                            </div>
                            <span className="engagement-value">
                              {dummyData.engagementBreakdown.blaster.toLocaleString()}
                            </span>
                            <span className="engagement-text">Blaster</span>
                          </div>
                          
                          <div className="size-increase flex flex-col items-center flex-wrap justify-center">
                            <div className="img-div">
                              🤖
                            </div>
                            <span className="engagement-value">
                              {dummyData.engagementBreakdown.aiCalls.toLocaleString()}
                            </span>
                            <span className="engagement-text">AI Calls</span>
                          </div>
                          
                          <div className="size-increase flex flex-col items-center flex-wrap justify-center">
                            <div className="img-div">
                              📞
                            </div>
                            <span className="engagement-value">
                              {dummyData.engagementBreakdown.dialers.toLocaleString()}
                            </span>
                            <span className="engagement-text">Dialers</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Metrics Box - Below Total Customers Engagement */}
                  <div className="customer-details flex-1">
                    <div className="flex gap-0 justify-evenly">
                      <div className="container flex gap-2">
                        <div
                          className="flex flex-col items-center gap-1 cursor-pointer"
                          style={{
                            borderRight: "1px solid black",
                            height: "100%",
                            padding: "0 1rem 0 0",
                          }}
                        >
                          <div className="customer-img-div">
                            👤
                          </div>
                          <span className="customer-value">
                            {dummyData.customerMetrics.totalCustomers.toLocaleString()}
                          </span>
                          <span className="customer-text">Total Customers</span>
                        </div>

                        <div
                          className="flex flex-col items-center gap-1"
                          style={{
                            borderRight: "1px solid black",
                            height: "100%",
                            padding: "0 1rem 0 0",
                          }}
                        >
                          <div className="customer-img-div">
                            👥
                          </div>
                          <span className="customer-value">
                            {dummyData.customerMetrics.connectedCustomers.toLocaleString()}
                          </span>
                          <span className="customer-text">
                            Total Customers Connected
                          </span>
                        </div>
                      </div>

                      <div className="container flex gap-2">
                        <div
                          className="flex flex-col items-center gap-1 customer-container"
                          style={{
                            borderRight: "1px solid black",
                            height: "100%",
                            padding: "0 1rem 0 0",
                          }}
                        >
                          <div className="customer-img-div">
                            💰
                          </div>
                          <span className="customer-value">
                            ₹{dummyData.customerMetrics.amountPromised.toLocaleString()}
                          </span>
                          <span className="customer-text">
                            Total Amount Promised by Customers
                          </span>
                        </div>

                        <div
                          className="flex flex-col items-center gap-1 customer-container"
                        >
                          <div className="customer-img-div">
                            💳
                          </div>
                          <span className="customer-value">
                            ₹{dummyData.customerMetrics.amountCollected.toLocaleString()}
                          </span>
                          <span className="customer-text">
                            Total Amount Collected from Customers
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Customer Engagement Chart */}
                <div className="lg:col-span-1">
                  <div className="chart-container">
                    <div className="chart-header flex justify-between">
                      <h4 className="chart-title">Customers Engagement</h4>
                      <select 
                        value={selectedDays} 
                        onChange={(e) => setSelectedDays(e.target.value)}
                        className="custom-select"
                      >
                        <option value="Last 7 days">Last 7 days</option>
                        <option value="Last 15 days">Last 15 days</option>
                        <option value="Last 30 days">Last 30 days</option>
                      </select>
                    </div>
                    <div className="x-scroll">
                      <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="bar"
                        height={260}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Status Cards */}
              <div className="mb-5">
                <div className="pay-container flex items-center gap-3">
                  <button className="move-btn text-3xl flex-shrink-0">
                    ⟨
                  </button>
                  <div style={{ flex: 1 }}>
                    <Slider
                      dots={true}
                      infinite={false}
                      speed={500}
                      slidesToShow={4}
                      slidesToScroll={2}
                      arrows={false}
                      draggable={true}
                      swipe={true}
                      touchMove={true}
                      cssEase="linear"
                      adaptiveHeight={true}
                      responsive={[
                      {
                        breakpoint: 1200,
                        settings: {
                          slidesToShow: 4,
                          slidesToScroll: 4,
                        },
                      },
                      {
                        breakpoint: 992,
                        settings: {
                          slidesToShow: 4,
                          slidesToScroll: 4,
                        },
                      },
                      {
                        breakpoint: 768,
                        settings: {
                          slidesToShow: 3,
                          slidesToScroll: 3,
                        },
                      },
                      {
                        breakpoint: 576,
                        settings: {
                          slidesToShow: 1,
                          slidesToScroll: 1,
                        },
                      },
                    ]}
                  >
                     {/* Promised to Pay */}
                     <div className="card">
                       <div
                         className="flex justify-between items-center"
                         style={{ borderBottom: "1px solid black" }}
                       >
                         <span className="title" style={{ color: '#10B981' }}>
                           <span className="text-green-500 mr-2">●</span> Promised to Pay
                         </span>
                         <div className="img-div">
                           📄
                         </div>
                       </div>
                       <p className="text">
                         Account:{" "}
                         <span style={{
                           color: "#1D3261",
                           fontSize: "16px",
                           marginInlineStart: "1rem",
                         }}>
                           {dummyData.statusCards.promisedToPay.accounts}
                         </span>
                       </p>
                       <p className="text">
                         Amount:{" "}
                         <span style={{
                           color: "#1D3261",
                           fontSize: "16px",
                           marginInlineStart: "1rem",
                         }}>
                           ₹{dummyData.statusCards.promisedToPay.amount.toLocaleString()}
                         </span>
                       </p>
                     </div>

                     {/* Refused to Pay */}
                     <div className="card">
                       <div
                         className="flex justify-between items-center"
                         style={{ borderBottom: "1px solid black" }}
                       >
                         <span className="title" style={{ color: '#EF4444' }}>
                           <span className="text-red-500 mr-2">●</span> Refused to Pay
                         </span>
                         <div className="img-div">
                           🔄
                         </div>
                       </div>
                       <p className="text">
                         Account:{" "}
                         <span style={{
                           color: "#1D3261",
                           fontSize: "16px",
                           marginInlineStart: "1rem",
                         }}>
                           {dummyData.statusCards.refusedToPay.accounts}
                         </span>
                       </p>
                     </div>

                     {/* Already Paid */}
                     <div className="card">
                       <div
                         className="flex justify-between items-center"
                         style={{ borderBottom: "1px solid black" }}
                       >
                         <span className="title" style={{ color: '#EF4444' }}>
                           <span className="text-red-500 mr-2">●</span> Already Paid
                         </span>
                         <div className="img-div">
                           💰
                         </div>
                       </div>
                       <p className="text">
                         Account:{" "}
                         <span style={{
                           color: "#1D3261",
                           fontSize: "16px",
                           marginInlineStart: "1rem",
                         }}>
                           {dummyData.statusCards.alreadyPaid.accounts}
                         </span>
                       </p>
                       <p className="text">
                         Amount:{" "}
                         <span style={{
                           color: "#1D3261",
                           fontSize: "16px",
                           marginInlineStart: "1rem",
                         }}>
                           ₹{dummyData.statusCards.alreadyPaid.amount.toLocaleString()}
                         </span>
                       </p>
                     </div>

                     {/* Wrong Number */}
                     <div className="card">
                       <div
                         className="flex justify-between items-center"
                         style={{ borderBottom: "1px solid black" }}
                       >
                         <span className="title" style={{ color: '#3B82F6' }}>
                           <span className="text-blue-500 mr-2">●</span> Wrong Number
                         </span>
                         <div className="img-div">
                           📞
                         </div>
                       </div>
                       <p className="text">
                         Account:{" "}
                         <span style={{
                           color: "#1D3261",
                           fontSize: "16px",
                           marginInlineStart: "1rem",
                         }}>
                           {dummyData.statusCards.wrongNumber.accounts}
                         </span>
                       </p>
                     </div>
                    </Slider>
                  </div>
                  <button className="move-btn text-3xl flex-shrink-0">
                    ⟩
                  </button>
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
