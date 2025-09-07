"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { useDeploymentDetection } from '@/hooks/useDeploymentDetection';

export function DeploymentNotificationProvider() {
  const { hasNewDeployment, refreshPage, dismissNotification } = useDeploymentDetection();

  useEffect(() => {
    if (hasNewDeployment) {
      toast('New version available!', {
        description: 'A new version of the app has been deployed.',
        duration: Infinity, // Keep it visible until user acts
        action: (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={refreshPage}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        ),
        onDismiss: dismissNotification,
        closeButton: true,
      });
    }
  }, [hasNewDeployment, refreshPage, dismissNotification]);

  return null; // This component doesn't render anything visible
}