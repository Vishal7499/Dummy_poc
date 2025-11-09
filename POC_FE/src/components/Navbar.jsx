import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import sarthiLogo from '/src/assets/Images/kotaklogo.png'
import { logoutApi } from '../utils/api'

const Navbar = ({ onMobileMenuClick, isSidebarCollapsed, onBellClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const getDashboardText = () => {
    if (!user) return 'Supervisor Dashboard'
    
    const role = user.role?.toLowerCase()
    const username = user.username?.toLowerCase()
    
    if (role === 'admin' || username === 'adminkotak') {
      return 'Admin Dashboard'
    } else if (role === 'staff' || username === 'staffuserr') {
      return 'Staff User Dashboard'
    } else {
      return 'Supervisor Dashboard'
    }
  }

  const handleLogout = async () => {
    try {
      if (user?.accessToken) {
        await logoutApi(user.accessToken)
      }
    } catch (e) {
      // ignore network/logout errors
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16" style={{borderBottomColor: '#e5e7eb'}}>
      <div className="px-4 h-full">
        <div className="flex justify-between items-center h-full">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Mobile Menu Button */}
                    <button
                      onClick={onMobileMenuClick}
                      className="lg:hidden p-2 rounded-lg transition-colors cursor-pointer"
                      style={{color: '#00005A'}}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    {/* Show logo and text when sidebar is collapsed */}
                    {isSidebarCollapsed && (
                      <>
                        <img src={sarthiLogo} alt="Sarthi Logo" className="w-40 h-6 sm:w-8 sm:h-8" style={{width: '50px', height: '50px'}} />
                        <div className="hidden sm:block">
                          <h1 className="text-base sm:text-lg font-semibold" style={{color: '#FA1432'}}> Kotak</h1>
                          <p className="text-xs" style={{color: '#00005A'}}>Sarthi Collection Kotak Bank</p>
                        </div>
                        <div className="block sm:hidden">
                          <h1 className="text-sm font-semibold" style={{color: '#00005A'}}>Sarthi</h1>
                          <p className="text-xs" style={{color: '#6b7280'}}>{getDashboardText()}</p>
                        </div>
                      </>
                    )}
                    
                    {/* Show welcome text when sidebar is OPEN */}
                    {!isSidebarCollapsed && (
                      <span className="text-base sm:text-md ml-65" style={{color: '#00005A', fontWeight: '500'}}>Welcome, {user?.name || "Admin User"}</span>
                    )}
                  </div>
           <div className="flex items-center space-x-2 sm:space-x-4">
             {/* Show welcome text when sidebar is collapsed */}
             {isSidebarCollapsed && (
               <>
                 <span className="hidden sm:inline text-sm" style={{color: '#00005A'}}>Welcome, {user?.name}</span>
                 <span className="sm:hidden text-xs" style={{color: '#00005A'}}>{user?.name?.split(' ')[0]}</span>
               </>
             )}
             
             {/* Bell Notification Icon */}
             <button
               onClick={onBellClick}
               className="relative p-2 rounded-lg transition-colors cursor-pointer"
               style={{color: '#00005A'}}
               onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
               onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
               {/* Notification Badge */}
               <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" style={{backgroundColor: '#FA1432'}}>3</span>
             </button>
             
             <button
               onClick={handleLogout}
               className="text-white px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer"
               style={{backgroundColor: '#FA1432'}}
               onMouseEnter={(e) => e.target.style.backgroundColor = '#d8122a'}
               onMouseLeave={(e) => e.target.style.backgroundColor = '#FA1432'}
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
