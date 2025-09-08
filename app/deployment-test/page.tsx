"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, PlayCircle, TestTube, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VersionInfo {
  version: string;
  timestamp: string;
  buildId: string;
}

export default function DeploymentTestPage() {
  const [currentVersion, setCurrentVersion] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [lastPollTime, setLastPollTime] = useState<string>('');

  const fetchVersion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data: VersionInfo = await response.json();
      setCurrentVersion(data);
      setPollCount(prev => prev + 1);
      setLastPollTime(new Date().toLocaleTimeString());
      return data;
    } catch (error) {
      console.error('Failed to fetch version:', error);
      toast.error('Failed to fetch version info');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = () => {
    toast('New version available!', {
      description: 'A new version of the app has been deployed.',
      duration: Infinity,
      action: (
        <Button
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      ),
      closeButton: true,
    });
  };

  const simulateVersionChange = () => {
    toast('🧪 Simulated Deployment Detected!', {
      description: 'This is a test notification to demo the UI.',
      duration: 5000,
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.dismiss()}
          className="flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Dismiss
        </Button>
      ),
    });
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          🚀 Deployment Notification System
          <Badge variant="secondary">Test Page</Badge>
        </h1>
        <p className="text-muted-foreground">
          Test and monitor the automatic deployment notification system
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Version Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Current Version Info
            </CardTitle>
            <CardDescription>
              API endpoint status and version details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentVersion ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Version</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {currentVersion.version}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Build ID</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {currentVersion.buildId.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {new Date(currentVersion.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-muted-foreground">No version data available</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={fetchVersion} 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Refresh Version
              </Button>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Polls: {pollCount}
              </Badge>
              {lastPollTime && (
                <Badge variant="outline">
                  Last: {lastPollTime}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Testing Controls
            </CardTitle>
            <CardDescription>
              Test the notification system manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={testNotification} size="sm">
                <PlayCircle className="h-4 w-4 mr-2" />
                Demo Notification
              </Button>
              
              <Button onClick={simulateVersionChange} variant="outline" size="sm">
                🧪 Test API
              </Button>
              
              <Button 
                onClick={() => window.open('/api/version', '_blank')} 
                variant="outline" 
                size="sm"
              >
                🔗 Test API
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Implementation Complete
            </CardTitle>
            <CardDescription>
              All components are installed and configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Version API:</strong> <code>/api/version</code> endpoint created
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Detection Hook:</strong> Polls for updates every 5 minutes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Sonner Integration:</strong> Shows elegant toast notifications
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Railway Support:</strong> Uses Git commit SHA for version tracking
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>User Experience:</strong> Non-intrusive with refresh button
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 How to Test</CardTitle>
            <CardDescription>
              Follow these steps to test the deployment notification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">1. Local Testing (Development)</h4>
                <p className="text-sm text-muted-foreground">
                  Use the "Demo Notification" button above to see the notification UI.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">2. API Testing</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Click "Test API" to verify the version API is working correctly.
                </p>
                <code className="text-xs bg-muted p-1 rounded">
                  curl {typeof window !== 'undefined' ? window.location.origin : ''}/api/version
                </code>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">3. Railway Production Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Deploy a new version to Railway. Users will see the notification within 5 minutes.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">4. Monitor Network Requests</h4>
                <p className="text-sm text-muted-foreground">
                  Open browser dev tools → Network tab and filter by "version" to see polling requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}