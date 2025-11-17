import React, { createContext, useContext } from 'react';
import { useActivityTracker } from '../hooks/useActivityTracker';
import { useAuth } from './AuthContext';

const ActivityTrackerContext = createContext(null);

export const ActivityTrackerProvider = ({ children, apiBaseUrl }) => {
  const { user } = useAuth(); // Get auth token from your auth context
  const authToken = user?.accessToken || null;
  const activityTracker = useActivityTracker(apiBaseUrl, authToken);

  return (
    <ActivityTrackerContext.Provider value={activityTracker}>
      {children}
    </ActivityTrackerContext.Provider>
  );
};

export const useActivityTrackerContext = () => {
  const context = useContext(ActivityTrackerContext);
  if (!context) {
    throw new Error('useActivityTrackerContext must be used within ActivityTrackerProvider');
  }
  return context;
};









