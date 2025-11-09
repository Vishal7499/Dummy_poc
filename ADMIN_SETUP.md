# Admin Panel Setup Guide

## Overview
A comprehensive admin panel has been created for managing users and system settings. The admin panel includes multiple screens for user management, activity monitoring, and system configuration.

## Admin User Setup

### Creating the Admin User

To create the admin user with credentials:
- **Username:** `adminkotak`
- **Password:** `1234`

Run the following script from the backend directory:

```bash
cd SONATA_KOTAK_POC_BE
python create_admin_user.py
```

This will create the admin user in the database.

## Features Implemented

### 1. Admin Dashboard (`/admin/dashboard`)
- Overview statistics (Total Users, Active Users, Inactive Users, Recent Logins)
- Quick action buttons for common tasks
- System overview cards

### 2. User Management (`/admin/users`)
- **View Users:** List all users with search functionality
- **Add User:** Create new user accounts with full details
- **Edit User:** Update user information including password
- **Delete User:** Soft delete users (sets is_active to false)
- Search and filter capabilities

### 3. User Activity Logs (`/admin/activity-logs`)
- View login/logout history
- Filter by status (All, Active Sessions, Logged Out)
- Session duration tracking
- Real-time activity monitoring

### 4. System Settings (`/admin/settings`)
- Security settings (Session timeout, Password requirements)
- Two-factor authentication toggle
- Email notification settings
- System maintenance mode

## Admin Routes

All admin routes are protected and require admin authentication:

- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/add` - Add new user
- `/admin/activity-logs` - Activity logs
- `/admin/settings` - System settings
- `/admin/branches` - Branch management (placeholder)
- `/admin/allocations` - Allocation management (placeholder)
- `/admin/incentives` - Incentive management (placeholder)
- `/admin/hierarchy` - Hierarchy management (placeholder)

## Backend API Endpoints

### Admin User Management APIs

1. **GET** `/admin/users/` - List all users
2. **POST** `/admin/users/create/` - Create new user
3. **PUT** `/admin/users/<username>/` - Update user
4. **DELETE** `/admin/users/<username>/delete/` - Delete user
5. **GET** `/admin/activity-logs/` - Get activity logs

All endpoints require:
- JWT authentication token
- Admin role or username 'adminkotak'

## Security Features

1. **Admin-Only Access:** All admin routes are protected by `AdminProtectedRoute`
2. **Role-Based Access:** Backend checks for admin role or username
3. **Password Encryption:** All passwords are hashed using Django's password hashing
4. **Soft Delete:** Users are deactivated rather than permanently deleted
5. **Admin Protection:** Cannot delete the main admin user (adminkotak)

## UI/UX Features

1. **Responsive Design:** Works on desktop and mobile devices
2. **Dark Blue Theme:** Admin sidebar uses dark blue theme matching the reference screenshots
3. **Modal Forms:** Add/Edit user forms in modal dialogs
4. **Search Functionality:** Real-time search across user fields
5. **Status Indicators:** Color-coded status badges (Active/Inactive, Admin/User)
6. **Loading States:** Loading indicators for async operations
7. **Error Handling:** User-friendly error messages

## Usage Instructions

1. **Login as Admin:**
   - Use username: `adminkotak` and password: `1234`
   - You will be automatically redirected to `/admin/dashboard`

2. **Manage Users:**
   - Navigate to "View Users" from the sidebar
   - Click "Add User" to create new users
   - Click "Edit" on any user to update their information
   - Click "Delete" to deactivate a user (admin user cannot be deleted)

3. **Monitor Activity:**
   - Go to "User Activity Logs" to see login history
   - Filter by status to see active sessions or logged out users

4. **Configure Settings:**
   - Access "System Settings" to configure security and notification preferences

## Notes

- The admin user (`adminkotak`) cannot be deleted for security reasons
- All user passwords are encrypted before storage
- User deletion is a soft delete (sets is_active to false)
- The admin panel maintains the same theme and styling as the main application
- All existing functionality remains intact for regular users





