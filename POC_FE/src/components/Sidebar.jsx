import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import sarthiLogo from '/src/assets/Images/kotaklogo.png'

const Sidebar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Staff Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      path: '/staff',
      active: location.pathname === '/staff'
    },
    {
      name: 'Customer Engagement',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      path: '/customer-engagement',
      active: location.pathname === '/customer-engagement'
    },
    {
      name: 'Payment Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/payments',
      active: location.pathname === '/payments'
    },
    {
      name: 'Reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: '/reports',
      active: location.pathname === '/reports'
    },
    {
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/settings',
      active: location.pathname === '/settings'
    }
  ]

  const handleNavigation = (path) => {
    navigate(path)
    // Close mobile sidebar after navigation
    if (setIsMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
       {/* Sidebar */}
       <div className="bg-white border-r border-gray-200 h-screen flex flex-col w-full" style={{borderRightColor: '#e5e7eb'}}>
         {/* Header with Toggle */}
         <div className="flex items-center p-4 border-b border-gray-200 h-16" style={{borderBottomColor: '#e5e7eb'}}>
           <button
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="p-2 rounded-lg transition-colors cursor-pointer"
             style={{color: '#00005A'}}
             onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
             onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
           </button>
           
                  {/* Logo and Title - Always show logo, text only when expanded */}
                  <div className={`flex items-center space-x-2 ${isCollapsed ? 'ml-0' : 'ml-0'}`}>
                    <img src={sarthiLogo} alt="Sarthi Logo" className="w-10 h-12" />
                    {!isCollapsed && (
                      <div>
                        <h1 className="text-base font-semibold" style={{color: '#FA1432'}}>Kotak</h1>
                        <p className="text-[10px]" style={{color: '#00005A'}}>Sarthi Collection Kotak Bank</p>
                      </div>
                    )}
                  </div>
           
           {/* Mobile Close Button */}
           <button
             onClick={() => setIsMobileOpen(false)}
             className="absolute top-4 right-4 p-2 rounded-lg transition-colors lg:hidden cursor-pointer"
             style={{color: '#00005A'}}
             onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
             onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
         </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                          <button
                            onClick={() => handleNavigation(item.path)}
                            className={`w-full flex items-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              isCollapsed 
                                ? 'justify-center px-3 py-3' 
                                : 'px-3 py-3'
                            }`}
                            style={item.active ? {
                              backgroundColor: '#ffffff',
                              color: '#FA1432',
                              border: '1px solid #FA1432',
                              fontWeight: '600'
                            } : {
                              color: '#374151'
                            }}
                            onMouseEnter={(e) => {
                              if (!item.active) {
                                e.target.style.backgroundColor = '#f9fafb'
                                e.target.style.color = '#00005A'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!item.active) {
                                e.target.style.backgroundColor = 'transparent'
                                e.target.style.color = '#374151'
                              }
                            }}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className={`${isCollapsed ? '' : 'mr-3'}`} style={item.active ? {color: '#FA1432'} : {}}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

       {/* Bottom Section */}
       <div className="flex-shrink-0 p-4 border-t border-gray-200" style={{borderTopColor: '#e5e7eb'}}>
         <div className="text-xs text-center" style={{color: '#6b7280'}}>
         Sarthi Kotak POC v1.0
         </div>
       </div>
      </div>
    </>
  )
}

export default Sidebar
