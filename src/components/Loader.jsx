import React from 'react'

const Loader = ({ 
  message = 'Loading...', 
  size = 'md', 
  color = 'blue',
  fullScreen = false,
  overlay = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4'
  }

  const colorClasses = {
    blue: 'border-blue-600',
    red: 'border-red-600',
    green: 'border-green-600',
    gray: 'border-gray-600',
    purple: 'border-purple-600'
  }

  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
        style={{ borderTopColor: 'transparent' }}
      ></div>
      {message && (
        <p className={`text-sm font-medium text-gray-600 ${size === 'lg' ? 'text-base' : ''}`}>
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
        {loaderContent}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-40 rounded-lg">
        {loaderContent}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      {loaderContent}
    </div>
  )
}

export default Loader

