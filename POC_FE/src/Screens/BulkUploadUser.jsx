import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'

const BulkUploadUser = () => {
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    // Simulate upload
    setTimeout(() => {
      setUploading(false)
      setSuccess(`Successfully uploaded ${file.name}. 25 users imported.`)
      setFile(null)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} transition-all duration-300 fixed lg:static inset-y-0 left-0 z-50`}>
          <AdminSidebar
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar
            onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Users</h1>
                <p className="text-gray-600 mt-2">Upload a CSV file to import multiple users at once</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">CSV File Format</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Your CSV file should contain the following columns: Username, First Name, Last Name, Email, Mobile Number, Role
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <code className="text-sm text-gray-700">
                      Username,First Name,Last Name,Email,Mobile Number,Role<br/>
                      user1,John,Doe,john@example.com,9876543210,user<br/>
                      user2,Jane,Smith,jane@example.com,9876543211,supervisor
                    </code>
                  </div>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">CSV up to 10MB</p>
                        {file && (
                          <p className="text-sm text-gray-900 mt-2">{file.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/users')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default BulkUploadUser





