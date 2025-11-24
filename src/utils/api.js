// All API calls now use dummy data - backend removed
// Import dummy data functions
import * as dummyData from './dummyData'

// Re-export all dummy data functions as API functions
export const loginApi = dummyData.loginApi
export const logoutApi = dummyData.logoutApi
export const dashboardApi = dummyData.dashboardApi
export const dashboardCollectionGraphApi = dummyData.dashboardCollectionGraphApi
export const dashboardDepositionApi = dummyData.dashboardDepositionApi
export const dashboardDataApi = dummyData.dashboardDataApi
export const dashboardCollectionDataApi = dummyData.dashboardCollectionDataApi
export const adminGetUsers = dummyData.adminGetUsers
export const adminCreateUser = dummyData.adminCreateUser
export const adminUpdateUser = dummyData.adminUpdateUser
export const adminDeleteUser = dummyData.adminDeleteUser
export const adminGetActivityLogs = dummyData.adminGetActivityLogs
export const adminGetDashboardStats = dummyData.adminGetDashboardStats
export const adminGetTodayUploadedFiles = dummyData.adminGetTodayUploadedFiles
export const adminGetMaintenanceStatus = dummyData.adminGetMaintenanceStatus
export const adminSetMaintenanceMode = dummyData.adminSetMaintenanceMode
export const adminGetAllocationDetails = dummyData.adminGetAllocationDetails
export const adminUpdateAllocationDetails = dummyData.adminUpdateAllocationDetails
export const adminBulkUploadCSV = dummyData.adminBulkUploadCSV


