import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { adminGetTodayUploadedFiles, adminBulkUploadCSV } from '../utils/api'

const BulkUploadUser = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [logs, setLogs] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [filesError, setFilesError] = useState('')
  const [showStatusPopup, setShowStatusPopup] = useState(true)
  const [showLogs, setShowLogs] = useState(false)
  const [logsPage, setLogsPage] = useState(1)
  const logsPerPage = 50
  const logsSectionRef = useRef(null)

  // Required daily files
  const requiredFiles = [
    'KMBL_Allocation.csv',
    'KMBL_Settlement.csv',
    'KMBL_Reposition.csv',
    'KMBL_Legal.csv',
    'KMBL_Feedback.csv',
    'KMBL_Deposition.csv',
    'KMBL_Collection.csv'
  ]

  // Check which files are uploaded and which are pending
  const getFileStatus = () => {
    const uploadedFileNames = uploadedFiles.map(f => f.file_name)
    const uploaded = requiredFiles.filter(file => uploadedFileNames.includes(file))
    const pending = requiredFiles.filter(file => !uploadedFileNames.includes(file))
    
    return { uploaded, pending }
  }

  // Fetch today's uploaded files
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      if (!user?.accessToken) return

      setLoadingFiles(true)
      setFilesError('')
      try {
        const data = await adminGetTodayUploadedFiles(user.accessToken)
        setUploadedFiles(data.files || [])
        setLogs(data.logs || [])
      } catch (err) {
        console.error('Error fetching uploaded files:', err)
        setFilesError(err.message || 'Failed to load uploaded files')
      } finally {
        setLoadingFiles(false)
      }
    }

    fetchUploadedFiles()
  }, [user?.accessToken])

  // Auto-scroll to logs section when logs are shown
  useEffect(() => {
    if (showLogs && logsSectionRef.current) {
      setTimeout(() => {
        logsSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }, 200)
    }
  }, [showLogs])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    if (!user?.accessToken) {
      setError('Authentication required. Please log in again.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await adminBulkUploadCSV(user.accessToken, file)
      
      // Handle different response scenarios
      if (response.status === 'skipped') {
        // File was already uploaded
        setSuccess(`File "${response.file_name || file.name}" was already uploaded previously.`)
      } else if (response.rows_inserted !== undefined) {
        // Successful upload with row count
        const rowCount = response.rows_inserted || 0
        setSuccess(
          `Successfully uploaded ${response.detected_file || file.name}. ` +
          `${rowCount.toLocaleString()} row${rowCount !== 1 ? 's' : ''} imported.`
        )
      } else {
        // Generic success message
        setSuccess(response.message || `Successfully uploaded ${file.name}`)
      }
      
      setFile(null)
      
      // Refresh uploaded files list
      try {
        const data = await adminGetTodayUploadedFiles(user.accessToken)
        setUploadedFiles(data.files || [])
        setLogs(data.logs || [])
        setFilesError('')
      } catch (refreshErr) {
        console.error('Error refreshing files:', refreshErr)
        // Don't show error for refresh failure, just log it
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      // Handle both string and Date object
      const date = typeof timestamp === 'string' ? new Date(timestamp.replace(' ', 'T')) : new Date(timestamp)
      if (isNaN(date.getTime())) {
        // Try parsing as is
        return timestamp
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch (e) {
      return timestamp
    }
  }

  // Truncate file hash for display
  const truncateHash = (hash, length = 20) => {
    if (!hash) return 'N/A'
    return hash.length > length ? `${hash.substring(0, length)}...` : hash
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
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Bulk Upload</h1>
                <p className="text-sm text-gray-600 mt-1">Upload a CSV file to import multiple users at once</p>
              </div>

              {/* Status Notification Banner */}
              {showStatusPopup && !loadingFiles && (() => {
                const { uploaded, pending } = getFileStatus()
                const allUploaded = pending.length === 0
                
                return (
                  <div className={`mb-4 rounded-lg border-l-4 p-3 ${
                    allUploaded 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-yellow-50 border-yellow-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {allUploaded ? (
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${
                              allUploaded ? 'text-green-800' : 'text-yellow-800'
                            }`}>
                              {allUploaded ? 'All Required Files Uploaded' : 'Pending Files Remaining'}
                            </h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              allUploaded 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {uploaded.length}/{requiredFiles.length}
                            </span>
                          </div>
                          {!allUploaded && (
                            <p className="text-xs text-yellow-700">
                              {pending.length} file{pending.length > 1 ? 's' : ''} still need to be uploaded: {pending.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowStatusPopup(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
                        aria-label="Close"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })()}

              {error && (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {/* Upload Form Section - Moved to Top */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">CSV File Format</h2>
                  <p className="text-sm text-gray-600">Select CSV File</p>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                      <div className="space-y-2 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV up to 10MB</p>
                        {file && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setError('')
                        setSuccess('')
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        'Upload & Import'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Today's Uploaded Files Section - Below Upload Form */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Uploaded Files</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
                    </span>
                    {logs.length > 0 && (
                      <button
                        onClick={() => {
                          setShowLogs(!showLogs)
                          setLogsPage(1)
                        }}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          showLogs 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showLogs ? 'Hide Logs' : `Show Logs (${logs.length})`}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (user?.accessToken) {
                          setLoadingFiles(true)
                          adminGetTodayUploadedFiles(user.accessToken)
                            .then(data => {
                              setUploadedFiles(data.files || [])
                              setLogs(data.logs || [])
                              setFilesError('')
                            })
                            .catch(err => {
                              console.error('Error refreshing files:', err)
                              setFilesError(err.message || 'Failed to refresh files')
                            })
                            .finally(() => setLoadingFiles(false))
                        }
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      title="Refresh"
                    >
                      ↻
                    </button>
                  </div>
                </div>

                {loadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading files...</span>
                  </div>
                ) : filesError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {filesError}
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No files uploaded today
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">File Name</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">ID</th>
                          <th className="text-right py-2 px-3 font-semibold text-gray-700">Count</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Date/Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {uploadedFiles.map((fileItem, index) => (
                          <tr 
                            key={fileItem.id || index} 
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <td className="py-2 px-3 font-medium text-gray-900">{fileItem.file_name || 'N/A'}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                                {fileItem.folder_name || 'Unknown'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-xs text-gray-600">
                              {truncateHash(fileItem.file_hash, 20)}
                            </td>
                            <td className="py-2 px-3 text-right font-medium text-gray-900">
                              {fileItem.inserted_row_count ? fileItem.inserted_row_count.toLocaleString() : '0'}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {formatTimestamp(fileItem.uploaded_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Logs Section */}
              {showLogs && logs.length > 0 && (
                <div ref={logsSectionRef} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Upload Logs</h2>
                    <span className="text-xs text-gray-500">
                      {logs.length} {logs.length === 1 ? 'log entry' : 'log entries'}
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Timestamp</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Level</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Message</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Process Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {logs
                          .slice((logsPage - 1) * logsPerPage, logsPage * logsPerPage)
                          .map((log, index) => (
                            <tr 
                              key={log.log_id || index} 
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-2 px-3 text-gray-600 font-mono text-xs">
                                {formatTimestamp(log.log_timestamp)}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  log.log_level === 'ERROR' || log.log_level === 'CRITICAL'
                                    ? 'bg-red-100 text-red-800'
                                    : log.log_level === 'WARNING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : log.log_level === 'INFO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {log.log_level || 'INFO'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-700 max-w-md">
                                <div className="truncate" title={log.log_message || 'N/A'}>
                                  {log.log_message || 'N/A'}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {log.process_date || 'N/A'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Logs Pagination */}
                  {logs.length > logsPerPage && (
                    <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                      <div className="text-xs text-gray-600">
                        Showing {((logsPage - 1) * logsPerPage) + 1} to {Math.min(logsPage * logsPerPage, logs.length)} of {logs.length} logs
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                          disabled={logsPage === 1}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <span className="px-2 py-1 text-xs text-gray-700">
                          Page {logsPage} of {Math.ceil(logs.length / logsPerPage)}
                        </span>
                        <button
                          onClick={() => setLogsPage(prev => Math.min(Math.ceil(logs.length / logsPerPage), prev + 1))}
                          disabled={logsPage >= Math.ceil(logs.length / logsPerPage)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  )
}

export default BulkUploadUser








