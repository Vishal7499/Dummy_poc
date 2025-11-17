import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Advanced Activity Tracker Hook
 * Tracks user activity, handles session timeout, and records section visits
 */
export const useActivityTracker = (apiBaseUrl, authToken) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const timerRef = useRef(null);
  const activityTimerRef = useRef(null);
  const sectionTimerRef = useRef(null);
  const lastSectionRef = useRef(null);
  const sectionStartTimeRef = useRef(null);
  
  const settingsRef = useRef({
    sessionTimeoutMinutes: 15,
    activityTrackingEnabled: true,
    activityTrackingInterval: 30,
  });

  // Fetch system settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/system/settings/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const settings = {};
        
        data.settings.forEach(setting => {
          const key = setting.setting_key;
          const value = setting.setting_value;
          const dataType = setting.data_type;
          
          // Convert based on data type
          if (dataType === 'INTEGER') {
            settings[key] = parseInt(value, 10);
          } else if (dataType === 'BOOLEAN') {
            settings[key] = value.toLowerCase() === 'true';
          } else {
            settings[key] = value;
          }
        });
        
        settingsRef.current = {
          sessionTimeoutMinutes: settings.SESSION_TIMEOUT_MINUTES || 15,
          activityTrackingEnabled: settings.ACTIVITY_TRACKING_ENABLED !== false,
          activityTrackingInterval: settings.ACTIVITY_TRACKING_INTERVAL_SECONDS || 30,
        };
        
        return settingsRef.current;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
    return settingsRef.current;
  }, [apiBaseUrl, authToken]);

  // Track section visit
  const trackSectionVisit = useCallback(async (sectionName, sectionBackendName = null, sectionId = null, timeSpent = 0) => {
    if (!settingsRef.current.activityTrackingEnabled || !authToken) return;

    try {
      await fetch(`${apiBaseUrl}/activity/track-section/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_name: sectionName,
          section_backend_name: sectionBackendName,
          section_id: sectionId,
          time_spent_seconds: timeSpent,
        }),
      });
    } catch (error) {
      console.error('Error tracking section visit:', error);
    }
  }, [apiBaseUrl, authToken]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    // Track final section visit if needed
    if (lastSectionRef.current && sectionStartTimeRef.current) {
      const timeSpent = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
      await trackSectionVisit(
        lastSectionRef.current,
        null,
        null,
        timeSpent
      );
    }

    // Clear local storage
    localStorage.clear();
    
    // Navigate to login
    navigate('/login', { replace: true });
  }, [navigate, trackSectionVisit]);

  // Reset session timeout timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const timeoutMs = settingsRef.current.sessionTimeoutMinutes * 60 * 1000;
    timerRef.current = setTimeout(() => {
      console.log('Session timeout - logging out');
      handleLogout();
    }, timeoutMs);
  }, [handleLogout]);

  // Track activity periodically
  const trackActivity = useCallback(async () => {
    if (!settingsRef.current.activityTrackingEnabled || !authToken) return;
    // Activity is tracked automatically by backend on API calls
    // This is just for periodic tracking if needed
  }, [authToken]);

  // Track current section
  const trackCurrentSection = useCallback(() => {
    const currentPath = location.pathname;
    const sectionName = currentPath.split('/').filter(Boolean).join('/') || 'home';
    
    // If section changed, track the previous one
    if (lastSectionRef.current && lastSectionRef.current !== sectionName) {
      if (sectionStartTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
        trackSectionVisit(
          lastSectionRef.current,
          null,
          null,
          timeSpent
        );
      }
    }
    
    // Update current section
    lastSectionRef.current = sectionName;
    sectionStartTimeRef.current = Date.now();
    
    // Track new section visit
    trackSectionVisit(sectionName, null, null, 0);
  }, [location.pathname, trackSectionVisit]);

  // Initialize
  useEffect(() => {
    // Fetch settings on mount
    fetchSettings().then(settings => {
      // Start session timeout timer
      resetTimer();
      
      // Start activity tracking interval
      if (settings.activityTrackingEnabled) {
        activityTimerRef.current = setInterval(() => {
          trackActivity();
        }, settings.activityTrackingInterval * 1000);
      }
    });

    // Track initial section
    trackCurrentSection();

    // Listen to user activity events
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Note: Section tracking on route change is handled by the useEffect below

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
      
      if (sectionTimerRef.current) {
        clearInterval(sectionTimerRef.current);
      }
      
      // Track final section visit
      if (lastSectionRef.current && sectionStartTimeRef.current) {
        const timeSpent = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
        trackSectionVisit(
          lastSectionRef.current,
          null,
          null,
          timeSpent
        );
      }
    };
  }, [fetchSettings, resetTimer, trackActivity, trackCurrentSection, navigate]);

  // Update section tracking when location changes
  useEffect(() => {
    trackCurrentSection();
  }, [location.pathname, trackCurrentSection]);

  // Periodic section time tracking
  useEffect(() => {
    if (settingsRef.current.activityTrackingEnabled) {
      sectionTimerRef.current = setInterval(() => {
        if (lastSectionRef.current && sectionStartTimeRef.current) {
          const timeSpent = Math.floor((Date.now() - sectionStartTimeRef.current) / 1000);
          // Update time spent every 30 seconds
          if (timeSpent >= 30) {
            trackSectionVisit(
              lastSectionRef.current,
              null,
              null,
              30
            );
            sectionStartTimeRef.current = Date.now();
          }
        }
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (sectionTimerRef.current) {
        clearInterval(sectionTimerRef.current);
      }
    };
  }, [trackSectionVisit]);

  return {
    resetTimer,
    trackSectionVisit,
    getSettings: () => settingsRef.current,
  };
};









