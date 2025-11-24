import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import sarthiLogo from '/src/assets/Images/sarthi_logo.png'
import { loginApi } from '../utils/api'

const Login = () => {
  const [isActive, setIsActive] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check maintenance mode before login
    const maintenanceMode = localStorage.getItem('maintenanceMode') === 'true'
    
    try {
      const data = await loginApi({ username: formData.email, password: formData.password })
      console.log('Login response data:', data)
      
      if (!data.username || !data.tokens?.access) {
        throw new Error('Invalid response format from server')
      }
      
      const userData = {
        username: data.username,
        role: data.role,
        accessToken: data.tokens?.access,
        refreshToken: data.tokens?.refresh,
        name: data.username,
      }
      login(userData)
      
      // If maintenance mode is enabled and user is not admin, show maintenance page
      if (maintenanceMode && data.role !== 'admin') {
        navigate('/maintenance')
        return
      }
      
      // Route based on role: admin goes to admin dashboard, supervisor goes to supervisor dashboard, others go to normal dashboard
      if (data.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (data.role === 'supervisor') {
        navigate('/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.message || 'Invalid credentials or server error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Sign up not in use

  return (
    <div className="min-h-screen flex items-center justify-center font-['Montserrat'] p-4" style={{background: 'linear-gradient(to right, #e2e2e2, #c9d6ff)', minHeight: '100vh'}}>
      <div className={`bg-white relative overflow-hidden transition-all duration-700 ease-in-out ${isActive ? 'active' : ''}`} style={{boxShadow: '0 5px 15px rgba(0, 0, 0, 0.35)', borderRadius: '30px', width: '100%', maxWidth: '768px', minHeight: '480px'}}>
        {/* Sign In Form Only */}
        <div className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out z-20 ${isActive ? 'transform translate-x-full' : 'transform translate-x-0'}`}>
          <form onSubmit={handleSignIn} className="bg-white flex flex-col items-center justify-center h-full" style={{padding: '0 40px'}}>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h1>
            
            <div className="flex items-center justify-center" style={{margin: '0px 0'}}>
              <a href="#" className="flex items-center justify-center w-70 h-20" >
              <img src={sarthiLogo} alt="Sarthi Logo" className="mb-" style={{width: '200px', height: 'auto'}} />

              </a>
              
            </div>
            
            
            <input
              type="text"
              name="email"
              placeholder="UserID"
              value={formData.email}
              onChange={handleChange}
              className="w-full outline-none"
              style={{backgroundColor: '#eee', border: 'none', margin: '8px 0', padding: '10px 15px', fontSize: '13px', borderRadius: '8px', width: '100%'}}
              required
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full outline-none"
                style={{backgroundColor: '#eee', border: 'none', margin: '8px 0', padding: '10px 15px', paddingRight: '45px', fontSize: '13px', borderRadius: '8px', width: '100%'}}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash text-sm"></i>
                ) : (
                  <i className="fas fa-eye text-sm"></i>
                )}
              </button>
            </div>
            
            <a href="#" className="no-underline" style={{color: '#333', fontSize: '13px', margin: '15px 0 10px'}}>Forget Your Password?</a>
            
            <button
              type="submit"
              disabled={loading}
              className="text-white border border-transparent rounded-lg font-semibold uppercase cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{backgroundColor: '#FA1432', fontSize: '12px', padding: '10px 45px', letterSpacing: '0.5px', marginTop: '10px'}}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#00005A')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#FA1432')}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Toggle Container (visual only) */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-50 ${isActive ? 'transform -translate-x-full' : 'transform translate-x-0'}`} style={{borderRadius: isActive ? '0 150px 100px 0' : '150px 0 0 100px'}}>
          <div className={`text-white relative h-full w-full transform transition-all duration-700 ease-in-out ${isActive ? 'translate-x-1/2' : 'translate-x-0'}`} style={{background: 'linear-gradient(to right, #C33764, #1D2671)', left: '-100%', width: '200%'}}>
            
            {/* Toggle Left Panel */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center text-center top-0 transform transition-all duration-700 ease-in-out ${isActive ? 'translate-x-0' : '-translate-x-full'}`} style={{padding: '0 30px'}}>
              <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
              <p style={{fontSize: '14px', lineHeight: '20px', letterSpacing: '0.3px', margin: '10px 0'}}>Enter your personal details to use Sarthi Collection Kotak Bank </p>
              <button
                onClick={() => setIsActive(false)}
                className="text-white rounded-lg font-semibold uppercase cursor-pointer transition-colors"
                style={{backgroundColor: 'transparent', border: '1px solid #fff', fontSize: '12px', padding: '10px 45px', letterSpacing: '0.5px', marginTop: '10px'}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#C33764';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#fff';
                }}
              >
                Sign In
              </button>
            </div>
            
            {/* Toggle Right Panel (kept for layout symmetry) */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center text-center top-0 right-0 transform transition-all duration-700 ease-in-out ${isActive ? 'translate-x-full' : 'translate-x-0'}`} style={{padding: '0 30px'}}>
              <h1 className="text-2xl font-bold mb-4">Welcome To Sarthi Collection Kotak Bank!</h1>
              <p style={{fontSize: '14px', lineHeight: '20px', letterSpacing: '0.3px', margin: '10px 0'}}>Enter your personal details to use Sarthi Collection Kotak Bank</p>
              <button
                onClick={() => setIsActive(true)}
                className="text-white rounded-lg font-semibold uppercase cursor-pointer transition-colors"
                style={{backgroundColor: 'transparent', border: '1px solid #fff', fontSize: '12px', padding: '10px 45px', letterSpacing: '0.5px', marginTop: '10px'}}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.color = '#C33764';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#fff';
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm z-50">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login