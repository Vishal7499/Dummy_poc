import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import sarthiLogo from '../assets/Images/sarthi_logo.png'

const Navbar = ({ onMobileMenuClick, isSidebarCollapsed, onBellClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="px-4 h-full">
        <div className="flex justify-between items-center h-full">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Mobile Menu Button */}
                    <button
                      onClick={onMobileMenuClick}
                      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    {/* Show logo and text when sidebar is collapsed */}
                    {isSidebarCollapsed && (
                      <>
                        <img src={sarthiLogo} alt="Sarthi Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
                        <div className="hidden sm:block">
                          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Sarthi Kotak POC</h1>
                          <p className="text-xs text-gray-600">Supervisor Dashboard</p>
                        </div>
                        <div className="block sm:hidden">
                          <h1 className="text-sm font-semibold text-gray-900">Sarthi</h1>
                          <p className="text-xs text-gray-600">Dashboard</p>
                        </div>
                      </>
                    )}
                    
                    {/* Show welcome text when sidebar is OPEN */}
                    {!isSidebarCollapsed && (
                      <span className="text-base sm:text-md text-gray-900 ml-65">Welcome, {user?.name || "Admin User"}</span>
                    )}
                  </div>
           <div className="flex items-center space-x-2 sm:space-x-4">
             {/* Show welcome text when sidebar is collapsed */}
             {isSidebarCollapsed && (
               <>
                 <span className="hidden sm:inline text-sm text-gray-700">Welcome, {user?.name}</span>
                 <span className="sm:hidden text-xs text-gray-700">{user?.name?.split(' ')[0]}</span>
               </>
             )}
             
             {/* Bell Notification Icon */}
             <button
               onClick={onBellClick}
               className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
             >
               <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
               {/* Notification Badge */}
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
             </button>
             
             <button
               onClick={handleLogout}
               className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
             >
               <span className="hidden sm:inline">Logout</span>
               <span className="sm:hidden">Out</span>
             </button>
           </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
