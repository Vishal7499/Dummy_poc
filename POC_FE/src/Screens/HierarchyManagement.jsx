import React, { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import Navbar from '../components/Navbar'

const HierarchyManagement = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const hierarchy = [
    { id: 1, name: 'Admin', level: 1, parent: null, users: 1 },
    { id: 2, name: 'Regional Manager', level: 2, parent: 'Admin', users: 5 },
    { id: 3, name: 'Branch Manager', level: 3, parent: 'Regional Manager', users: 15 },
    { id: 4, name: 'Supervisor', level: 4, parent: 'Branch Manager', users: 30 },
    { id: 5, name: 'Field Collector', level: 5, parent: 'Supervisor', users: 100 }
  ]

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
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg">
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

          <main className="flex-1 overflow-y-auto p-6" style={{ paddingTop: '80px' }}>
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hierarchy Management</h1>
                  <p className="text-gray-600 mt-2">Manage organizational hierarchy and reporting structure</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer">
                  Add Level
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="space-y-4">
                  {hierarchy.map((level) => (
                    <div key={level.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          level.level === 1 ? 'bg-purple-500' :
                          level.level === 2 ? 'bg-blue-500' :
                          level.level === 3 ? 'bg-green-500' :
                          level.level === 4 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {level.level}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{level.name}</h3>
                          <p className="text-sm text-gray-500">Reports to: {level.parent || 'None'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{level.users} users</span>
                        <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default HierarchyManagement








