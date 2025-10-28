import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('ftd')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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

  return (
    <div className="h-screen font-['Montserrat'] flex flex-col" style={{background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)'}}>
      {/* Navbar */}
      <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Full height */}
        <div className="flex-shrink-0">
          <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />
        </div>
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
        {/* Collection Dashboard Header */}
      

        {/* Collection Dashboard Content */}
        <div className="bg-white min-h-screen p-4">
          <div className="flex gap-4">
            {/* Left Side - Filters */}
            <div className="w-64 bg-gray-50 border border-gray-200 rounded-lg p-4 h-fit">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Section 1: Filters</h3>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Staff</label>
                  <select className="w-full p-2 border border-gray-300 rounded text-xs">
                    <option>All Staff</option>
                    <option>Ramesh Kumar</option>
                    <option>Ankit Sharma</option>
                    <option>Priya Rao</option>
                    <option>Suresh Patel</option>
                    <option>Meena Iyer</option>
                  </select>
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

            {/* Right Side - Main Content */}
            <div className="flex-1">
              {/* Section 2: Staff Monitoring (Summary) */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Section 2: Staff Monitoring (Summary)</h2>
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-blue-600 text-xs">Collection Efficiency (%)</div>
                    <div className="text-lg font-bold text-blue-900">86.4%</div>
                    <div className="text-xs text-blue-500">Amount collected ÷ Total due</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-green-600 text-xs">PTP Conversion Rate (%)</div>
                    <div className="text-lg font-bold text-green-900">72.3%</div>
                    <div className="text-xs text-green-500">PTPs fulfilled ÷ Total PTPs</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-purple-600 text-xs">Visit Compliance Rate (%)</div>
                    <div className="text-lg font-bold text-purple-900">78.5%</div>
                    <div className="text-xs text-purple-500">Completed ÷ Planned visits</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-orange-600 text-xs">Staff Productivity Index</div>
                    <div className="text-lg font-bold text-orange-900">156</div>
                    <div className="text-xs text-orange-500">Weighted calls + visits</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 relative">
                    <div className="text-red-600 text-xs">Inactive/Non-performing Staff</div>
                    <div className="text-lg font-bold text-red-900">3</div>
                    <div className="text-xs text-red-500">0 calls or 0 visits</div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Customer Engagement */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Section 3: Customer Engagement</h2>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
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

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
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

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
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

              {/* Section 4: Payment Intent & Behavior */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Section 4: Payment Intent & Behavior</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">Top Overdue Accounts</h3>
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
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600"># Customers</span>
                        <span className="font-semibold text-green-800">234</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Promised Amount</span>
                        <span className="font-semibold text-green-800">₹89L</span>
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
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Collection Trend (Last 7 days)</h3>
                    <div className="h-48 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
                      <div className="text-center">
                        <div className="text-blue-600 text-sm font-medium">📊 Collection Trend Chart</div>
                        <div className="text-blue-500 text-xs mt-1">Line chart showing daily collection amounts</div>
                        <div className="text-blue-400 text-xs">Integration with Chart.js/D3.js</div>
                      </div>
                    </div>
                  </div>

                  {/* DPD Distribution Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">DPD Distribution</h3>
                    <div className="flex items-center space-x-4">
                      <div className="h-32 w-32 bg-gradient-to-br from-green-100 to-red-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <div className="text-gray-600 text-xs font-medium">📈</div>
                          <div className="text-gray-500 text-xs">Donut Chart</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-gray-700 text-xs">0-30 days (45%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded"></div>
                          <span className="text-gray-700 text-xs">31-60 days (25%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-gray-700 text-xs">61-90 days (18%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-gray-700 text-xs">90+ days (12%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Staff Leaderboard */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">Staff Leaderboard</h3>
                      <select className="bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                        <option>Sort by: Efficiency</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-600 border-b border-gray-200">
                            <th className="text-left py-1">Staff</th>
                            <th className="text-left py-1">Region</th>
                            <th className="text-left py-1">Calls</th>
                            <th className="text-left py-1">Visits</th>
                            <th className="text-left py-1">Collected</th>
                            <th className="text-left py-1">Efficiency</th>
                            <th className="text-left py-1">Escalations</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700">
                          <tr className="border-b border-gray-100">
                            <td className="py-1">Ramesh Kumar</td>
                            <td className="py-1">North</td>
                            <td className="py-1">45</td>
                            <td className="py-1">12</td>
                            <td className="py-1">₹2.5L</td>
                            <td className="py-1"><span className="text-green-600 font-semibold">92%</span></td>
                            <td className="py-1">1</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1">Ankit Sharma</td>
                            <td className="py-1">South</td>
                            <td className="py-1">38</td>
                            <td className="py-1">8</td>
                            <td className="py-1">₹1.8L</td>
                            <td className="py-1"><span className="text-red-600 font-semibold">67%</span></td>
                            <td className="py-1">3</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1">Priya Rao</td>
                            <td className="py-1">East</td>
                            <td className="py-1">42</td>
                            <td className="py-1">15</td>
                            <td className="py-1">₹2.2L</td>
                            <td className="py-1"><span className="text-green-600 font-semibold">88%</span></td>
                            <td className="py-1">0</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1">Suresh Patel</td>
                            <td className="py-1">West</td>
                            <td className="py-1">35</td>
                            <td className="py-1">6</td>
                            <td className="py-1">₹1.2L</td>
                            <td className="py-1"><span className="text-red-600 font-semibold">54%</span></td>
                            <td className="py-1">5</td>
                          </tr>
                          <tr>
                            <td className="py-1">Meena Iyer</td>
                            <td className="py-1">Central</td>
                            <td className="py-1">40</td>
                            <td className="py-1">10</td>
                            <td className="py-1">₹1.95L</td>
                            <td className="py-1"><span className="text-orange-600 font-semibold">80%</span></td>
                            <td className="py-1">2</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Side - Alerts and Actions */}
                <div className="space-y-4">
                  {/* Section 5: Allocation Monitoring */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Section 5: Allocation Monitoring</h3>
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
                        <button className="mt-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs transition-colors">
                          Auto Allocate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Delegation Tracking */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Section 6: Delegation Tracking</h3>
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
                        <button className="mt-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Alerts */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Live Alerts</h3>
                    <div className="space-y-2">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <div className="text-orange-800 text-xs">PTP missed - Customer #C-10234 (₹45,000)</div>
                        <div className="text-orange-600 text-xs mt-1">10:12</div>
                        <button className="mt-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs transition-colors">
                          View
                        </button>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                        <div className="text-red-800 text-xs">Escalation breach - Account #A-557 (DPD 95)</div>
                        <div className="text-red-600 text-xs mt-1">09:40</div>
                        <button className="mt-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors">
                          View
                        </button>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <div className="text-blue-800 text-xs">Unallocated cases &gt; threshold: 23</div>
                        <div className="text-blue-600 text-xs mt-1">08:20</div>
                        <button className="mt-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded text-xs font-medium transition-colors">
                        Reassign Case
                      </button>
                      <button className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded text-xs font-medium transition-colors">
                        Escalate to RM
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded text-xs font-medium transition-colors">
                        Send Payment Reminder
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded text-xs font-medium transition-colors">
                        Mark Paid
                      </button>
                    </div>
                  </div>

                  {/* Field Map */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Field Map</h3>
                    <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                      <div className="text-gray-500 text-center text-xs">
                        <div>Map Placeholder</div>
                        <div className="text-xs mt-1">(integrate with Leaflet / Google Maps)</div>
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