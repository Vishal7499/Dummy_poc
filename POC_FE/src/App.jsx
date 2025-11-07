import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import StaffProtectedRoute from './components/StaffProtectedRoute'
import Login from './Screens/Login'
import Dashboard from './Screens/Dashboard'
import StaffManagement from './Screens/StaffManagement'
import CustomerEngagement from './Screens/CustomerEngagement'
import StaffDashboard from './Screens/StaffDashboard'
import StaffCustomerEngagement from './Screens/StaffCustomerEngagement'
import AdminDashboard from './Screens/AdminDashboard'
import UserManagement from './Screens/UserManagement'
import AddUser from './Screens/AddUser'
import BulkUploadUser from './Screens/BulkUploadUser'
import UserActivityLogs from './Screens/UserActivityLogs'
import SystemSettings from './Screens/SystemSettings'
import BranchManagement from './Screens/BranchManagement'
import AllocationManagement from './Screens/AllocationManagement'
import IncentiveManagement from './Screens/IncentiveManagement'
import HierarchyManagement from './Screens/HierarchyManagement'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff" 
              element={
                <ProtectedRoute>
                  <StaffManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-engagement" 
              element={
                <ProtectedRoute>
                  <CustomerEngagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminProtectedRoute>
                  <UserManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/add" 
              element={
                <AdminProtectedRoute>
                  <AddUser />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users/bulk-upload" 
              element={
                <AdminProtectedRoute>
                  <BulkUploadUser />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/activity-logs" 
              element={
                <AdminProtectedRoute>
                  <UserActivityLogs />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminProtectedRoute>
                  <SystemSettings />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/branches" 
              element={
                <AdminProtectedRoute>
                  <BranchManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/allocations" 
              element={
                <AdminProtectedRoute>
                  <AllocationManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/incentives" 
              element={
                <AdminProtectedRoute>
                  <IncentiveManagement />
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/hierarchy" 
              element={
                <AdminProtectedRoute>
                  <HierarchyManagement />
                </AdminProtectedRoute>
              } 
            />
            
            {/* Staff Routes */}
            <Route 
              path="/staff/dashboard" 
              element={
                <StaffProtectedRoute>
                  <StaffDashboard />
                </StaffProtectedRoute>
              } 
            />
            <Route 
              path="/staff/management" 
              element={
                <StaffProtectedRoute>
                  <StaffManagement />
                </StaffProtectedRoute>
              } 
            />
            <Route 
              path="/staff/customer-engagement" 
              element={
                <StaffProtectedRoute>
                  <StaffCustomerEngagement />
                </StaffProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
