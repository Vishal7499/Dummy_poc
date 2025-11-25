import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import { adminGetAllocationDetails, adminUpdateAllocationDetails } from '../utils/api'

const AllocationManagement = () => {
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [selectedVertical, setSelectedVertical] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [allocations, setAllocations] = useState([])
  const [allAllocations, setAllAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verticals, setVerticals] = useState([])
  const [states, setStates] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [editingCell, setEditingCell] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)
  const isFetchingRef = useRef(false)

  // Fetch allocation details from API
  const fetchAllocationDetails = async () => {
    if (!user?.accessToken) {
      return
    }

    if (isFetchingRef.current) {
      return
    }

    try {
      isFetchingRef.current = true
      setLoading(true)
      setError(null)
      
      const data = await adminGetAllocationDetails(user.accessToken)
      
      // Handle response structure
      let allocationsData = []
      if (data.allocations && Array.isArray(data.allocations)) {
        allocationsData = data.allocations
      } else if (Array.isArray(data)) {
        allocationsData = data
      } else if (data.data && Array.isArray(data.data)) {
        allocationsData = data.data
      } else if (data.results && Array.isArray(data.results)) {
        allocationsData = data.results
      }
      
      // Store all data
      setAllAllocations(allocationsData)

      // Extract unique verticals and states for filter dropdowns
      if (allocationsData.length > 0) {
        const uniqueVerticals = [...new Set(allocationsData.map(a => a.vertical).filter(Boolean))].sort()
        const uniqueStates = [...new Set(allocationsData.map(a => a.state).filter(Boolean))].sort()
        setVerticals(uniqueVerticals)
        setStates(uniqueStates)
      }
    } catch (err) {
      console.error('Error fetching allocation details:', err)
      setError(err.message || 'Failed to fetch allocation details')
      setAllAllocations([])
      setAllocations([])
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }

  // Apply filters to allocations
  useEffect(() => {
    if (allAllocations.length === 0) return
    
    setFilterLoading(true)
    // Simulate filter processing delay
    setTimeout(() => {
      let filteredData = allAllocations
      if (selectedVertical) {
        filteredData = filteredData.filter(a => a.vertical === selectedVertical)
      }
      if (selectedState) {
        filteredData = filteredData.filter(a => a.state === selectedState)
      }
      setAllocations(filteredData)
      setCurrentPage(1) // Reset to first page when filters change
      setFilterLoading(false)
    }, 300)
  }, [allAllocations, selectedVertical, selectedState])

  // Pagination calculations
  const totalPages = Math.ceil(allocations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAllocations = allocations.slice(startIndex, endIndex)

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  // Initial fetch on component mount
  useEffect(() => {
    if (user?.accessToken) {
      fetchAllocationDetails()
    }
  }, [user?.accessToken])

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedVertical('')
    setSelectedState('')
  }

  // Handle cell edit
  const handleCellEdit = (caseId, field, currentValue) => {
    setEditingCell(`${caseId}-${field}`)
    setEditValues({ [field]: currentValue || '' })
  }

  // Handle cell save
  const handleCellSave = async (caseId, field) => {
    const newValue = editValues[field]
    setSaving(true)
    
    try {
      const payload = {
        case_id: caseId,
      }
      
      if (field === 'allocated_by_username') {
        payload.allocated_by_username = newValue
      } else if (field === 'allocated_to_username') {
        payload.allocated_to_username = newValue
      }
      
      await adminUpdateAllocationDetails(
        user.accessToken,
        caseId,
        field === 'allocated_by_username' ? newValue : undefined,
        field === 'allocated_to_username' ? newValue : undefined
      )
      
      // Update local state
      const updatedAllocations = allocations.map(a => 
        a.case_id === caseId 
          ? { ...a, [field]: newValue }
          : a
      )
      setAllocations(updatedAllocations)
      
      const updatedAllAllocations = allAllocations.map(a => 
        a.case_id === caseId 
          ? { ...a, [field]: newValue }
          : a
      )
      setAllAllocations(updatedAllAllocations)
      
      setEditingCell(null)
      setEditValues({})
    } catch (err) {
      console.error('Error updating allocation:', err)
      alert(err.message || 'Failed to update allocation')
    } finally {
      setSaving(false)
    }
  }

  // Handle cell cancel
  const handleCellCancel = () => {
    setEditingCell(null)
    setEditValues({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Small when closed, overlay when open */}
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-0 overflow-hidden'}`}>
          <AdminSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>
        
        {/* Overlay Sidebar when expanded */}
        {!isSidebarCollapsed && (
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
            <AdminSidebar
              isMobileOpen={isMobileSidebarOpen}
              setIsMobileOpen={setIsMobileSidebarOpen}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
          </div>
        )}

        {/* Main Content */}
        <div 
          className="flex-1 flex flex-col overflow-hidden relative transition-all duration-300"
          style={{
            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
              ? (isSidebarCollapsed ? '0px' : '256px')
              : '0px'
          }}
        >
          <Navbar
            onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto p-4" style={{ paddingTop: '80px' }}>
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Allocation Management</h1>
                <p className="text-sm text-gray-600">Manage client allocations to field collectors</p>
              </div>

              {/* Summary Cards - White Cards with Red Text */}
              {!loading && allocations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 relative">
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Cases</p>
                    <p className="text-2xl font-bold text-red-600">{allocations.length}</p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 relative">
                    <p className="text-xs font-medium text-gray-600 mb-1">Unique Parties</p>
                    <p className="text-2xl font-bold text-red-600">
                      {new Set(allocations.map(a => a.party_name).filter(Boolean)).size}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 relative">
                    <p className="text-xs font-medium text-gray-600 mb-1">Unique Collectors</p>
                    <p className="text-2xl font-bold text-red-600">
                      {new Set(allocations.map(a => a.allocated_to_username).filter(Boolean)).size}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 relative">
                    <p className="text-xs font-medium text-gray-600 mb-1">Unique Verticals</p>
                    <p className="text-2xl font-bold text-red-600">
                      {new Set(allocations.map(a => a.vertical).filter(Boolean)).size}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>
                  </div>
                </div>
              )}

              {/* Filters Section - Compact - Right Aligned */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 mb-3">
                <div className="flex flex-wrap gap-2.5 items-end justify-end">
                  <div className="min-w-[160px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Vertical</label>
                    <select
                      value={selectedVertical}
                      onChange={(e) => setSelectedVertical(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">All Verticals</option>
                      {verticals.map((vertical, idx) => (
                        <option key={idx} value={vertical}>
                          {vertical}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-[160px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    >
                      <option value="">All States</option>
                      {states.map((state, idx) => (
                        <option key={idx} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-0.5">
                    <button
                      onClick={handleResetFilters}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium h-[28px]"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg shadow-sm">
                  <p className="text-sm font-medium">Error: {error}</p>
                </div>
              )}

              {/* Table Section */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden relative">
                {loading ? (
                  <Loader message="Loading allocation details..." color="blue" size="md" />
                ) : filterLoading ? (
                  <Loader message="Applying filters..." color="blue" size="md" overlay={true} />
                ) : allocations.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600 text-sm font-medium">No allocation details found</p>
                      <p className="text-gray-500 text-xs mt-1">Try adjusting your filters or check back later</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">As On Date</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Case ID</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">APAC Card</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Party Name</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Vertical</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Product</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">City</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">State</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Pincode</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">DPD</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Allocated By</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Allocated To</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-white uppercase tracking-wider">Allocated On</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentAllocations.map((allocation, index) => (
                            <tr key={allocation.case_id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-150 border-b border-gray-100">
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-700 font-medium">{allocation.as_on_date || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs font-bold text-blue-600">{allocation.case_id || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-900 font-medium">{allocation.apac_card_number || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-xs text-gray-900 font-medium">{allocation.party_name || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {allocation.vertical || 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 py-2">
                                <div className="text-xs text-gray-700 max-w-xs truncate" title={allocation.product || 'N/A'}>
                                  {allocation.product || 'N/A'}
                                </div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-700">{allocation.city || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-700 font-medium">{allocation.state || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-600">{allocation.pincode || 'N/A'}</div>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                                  allocation.dpd === 0 ? 'bg-green-100 text-green-800' :
                                  allocation.dpd > 0 && allocation.dpd <= 30 ? 'bg-yellow-100 text-yellow-800' :
                                  allocation.dpd > 30 ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {allocation.dpd !== undefined && allocation.dpd !== null ? allocation.dpd : 'N/A'}
                                </span>
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                {editingCell === `${allocation.case_id}-allocated_by_username` ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editValues.allocated_by_username || ''}
                                      onChange={(e) => setEditValues({ allocated_by_username: e.target.value })}
                                      className="w-28 px-1.5 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleCellSave(allocation.case_id, 'allocated_by_username')
                                        } else if (e.key === 'Escape') {
                                          handleCellCancel()
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleCellSave(allocation.case_id, 'allocated_by_username')}
                                      disabled={saving}
                                      className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={handleCellCancel}
                                      disabled={saving}
                                      className="px-1.5 py-0.5 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="text-xs text-gray-700 cursor-pointer hover:text-blue-600 hover:underline"
                                    onClick={() => handleCellEdit(allocation.case_id, 'allocated_by_username', allocation.allocated_by_username)}
                                    title="Click to edit"
                                  >
                                    {allocation.allocated_by_username || 'N/A'}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                {editingCell === `${allocation.case_id}-allocated_to_username` ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editValues.allocated_to_username || ''}
                                      onChange={(e) => setEditValues({ allocated_to_username: e.target.value })}
                                      className="w-28 px-1.5 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleCellSave(allocation.case_id, 'allocated_to_username')
                                        } else if (e.key === 'Escape') {
                                          handleCellCancel()
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleCellSave(allocation.case_id, 'allocated_to_username')}
                                      disabled={saving}
                                      className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={handleCellCancel}
                                      disabled={saving}
                                      className="px-1.5 py-0.5 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div 
                                    className="text-xs text-gray-700 font-semibold cursor-pointer hover:text-blue-600 hover:underline"
                                    onClick={() => handleCellEdit(allocation.case_id, 'allocated_to_username', allocation.allocated_to_username)}
                                    title="Click to edit"
                                  >
                                    {allocation.allocated_to_username || 'N/A'}
                                  </div>
                                )}
                              </td>
                              <td className="px-2 py-2 whitespace-nowrap">
                                <div className="text-xs text-gray-600">{allocation.allocated_on || 'N/A'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-700 font-medium">Rows per page:</span>
                          <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-700">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(endIndex, allocations.length)}</span> of{' '}
                            <span className="font-semibold">{allocations.length}</span> results
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                    currentPage === page
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="px-1 text-gray-500 text-xs">...</span>
                            }
                            return null
                          })}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AllocationManagement








