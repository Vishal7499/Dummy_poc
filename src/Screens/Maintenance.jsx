import React from 'react'
import sarthiLogo from '/src/assets/Images/sarthi_logo.png'

const Maintenance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src={sarthiLogo} 
              alt="Sarthi Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Maintenance Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-yellow-100 rounded-full p-6">
              <svg 
                className="w-16 h-16 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Website Under Maintenance
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            We're currently performing scheduled maintenance to improve your experience.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What's happening?</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Our team is working hard to bring you an improved experience. We'll be back online shortly.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>We apologize for any inconvenience.</p>
            <p>Please check back soon.</p>
          </div>

          {/* Refresh Button */}
          <div className="mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Maintenance



