import { useEffect, useRef, useState } from 'react';

interface VersionInfo {
  version: string;
  timestamp: string;
}

export function useDeploymentDetection() {
  const [hasNewDeployment, setHasNewDeployment] = useState(false);
  const currentVersionRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkForUpdates = async () => {
    try {
      const response = await fetch('/api/version', { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) return;

      const data: VersionInfo = await response.json();
      
      // Initialize current version on first load
      if (currentVersionRef.current === null) {
        currentVersionRef.current = data.version;
        return;
      }

      // Check if version has changed
      if (currentVersionRef.current !== data.version) {
        setHasNewDeployment(true);
        // Stop checking once we detect an update
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.log('Failed to check for deployment updates:', error);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const dismissNotification = () => {
    setHasNewDeployment(false);
  };

  useEffect(() => {
    // Initial check
    checkForUpdates();

    // Set up periodic checking (every 5 minutes)
    intervalRef.current = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    hasNewDeployment,
    refreshPage,
    dismissNotification,
  };
}