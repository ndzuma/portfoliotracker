# Deployment Notification System - Testing Guide

This guide explains how to test the deployment notification system that alerts users when a new version of the application has been deployed.

## 🔧 System Overview

The deployment notification system consists of:
- **Version API** (`/api/version`) - Returns current deployment version
- **Detection Hook** (`useDeploymentDetection`) - Polls for version changes every 5 minutes
- **Notification Provider** (`DeploymentNotificationProvider`) - Shows Sonner toast notifications
- **Railway Integration** - Uses Git commit SHA for version tracking

## 🧪 Testing Methods

### 1. Direct API Testing

Test the version endpoint directly to verify it's working:

```bash
# Test locally (development)
curl http://localhost:3000/api/version

# Test on Railway (production)
curl https://your-railway-app.railway.app/api/version
```

**Expected Response:**
```json
{
  "version": "0.1.0-abc12345",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "buildId": "abc12345678901234567890"
}
```

### 2. Local Development Testing

#### Option A: Simulate Version Changes
1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser dev tools** and go to the Network tab

3. **Monitor the version polling** - you should see requests to `/api/version` every 5 minutes

4. **Simulate a version change:**
   - Edit the `BUILD_ID` in `/app/api/version/route.ts`
   - Change it to a different value temporarily
   - Save the file (hot reload will update the endpoint)
   - Wait for the next poll or refresh to see the notification

#### Option B: Manual Testing with Console
1. **Open browser dev tools** → Console tab
2. **Manually trigger the version check:**
   ```javascript
   // Simulate a new deployment by changing the version
   fetch('/api/version', { 
     cache: 'no-store',
     headers: { 'Cache-Control': 'no-cache' }
   })
   .then(r => r.json())
   .then(console.log);
   ```

#### Option C: Environment Variable Testing
1. **Set a custom BUILD_ID:**
   ```bash
   BUILD_ID=test-version-123 npm run dev
   ```
2. **Change the BUILD_ID and restart:**
   ```bash
   BUILD_ID=test-version-456 npm run dev
   ```
3. The system should detect the version change

### 3. Railway Production Testing

#### Option A: Deploy Different Versions
1. **Make a small change** (e.g., update a comment)
2. **Commit and push to trigger Railway deployment:**
   ```bash
   git add .
   git commit -m "Test deployment notification"
   git push
   ```
3. **Monitor your app** - users should see the notification after the new deployment

#### Option B: Monitor Real Deployments
1. **Keep the app open** in a browser tab
2. **Deploy a new version** via Railway
3. **Wait 5 minutes** (or less) for the notification to appear

### 4. Browser Developer Testing

#### Monitor Network Requests
1. **Open dev tools** → Network tab
2. **Filter by "version"** to see the polling requests
3. **Verify polling frequency** - should be every 5 minutes (300,000ms)

#### Check Console Logs
1. **Open dev tools** → Console tab
2. **Look for deployment detection logs** (if any errors occur)

#### Inspect Toast Notifications
1. **Trigger a notification** using any method above
2. **Verify the toast appears** with:
   - Title: "New version available!"
   - Description: "A new version of the app has been deployed."
   - Refresh button with icon
   - Close button

### 5. User Experience Testing

#### Test Notification Behavior
1. **Trigger notification** using any method
2. **Verify it's persistent** (duration: Infinity)
3. **Test refresh button** - should reload the page
4. **Test dismiss button** - should close the notification
5. **Verify polling stops** after notification is shown

#### Test Different Scenarios
1. **Multiple tabs** - notification should appear in all tabs
2. **Background tabs** - polling should continue
3. **Network offline** - should handle gracefully
4. **Slow network** - should not cause issues

## 🚀 Quick Testing Script

Create a quick test to verify the system:

```javascript
// Run this in browser console to test the system
async function testDeploymentNotification() {
  console.log('🧪 Testing deployment notification system...');
  
  // Test 1: Check version endpoint
  try {
    const response = await fetch('/api/version', { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const version = await response.json();
    console.log('✅ Version API working:', version);
  } catch (error) {
    console.error('❌ Version API failed:', error);
  }
  
  // Test 2: Check if hook is running
  const hasDetection = window.performance.getEntriesByName('/api/version').length > 0;
  console.log(hasDetection ? '✅ Detection hook is polling' : '⚠️ No polling detected yet');
  
  // Test 3: Simulate notification (for testing UI only)
  if (window.confirm('Show test notification?')) {
    // This would need to be implemented in your component for testing
    console.log('📱 Test notification would appear here');
  }
  
  console.log('🏁 Testing complete!');
}

// Run the test
testDeploymentNotification();
```

## 🔍 Troubleshooting

### Common Issues

1. **No notifications appearing:**
   - Check if Sonner is properly installed and configured
   - Verify the version endpoint is returning different values
   - Check browser console for errors

2. **Polling not working:**
   - Verify the useDeploymentDetection hook is being used
   - Check if the component is properly mounted
   - Look for JavaScript errors preventing the hook from running

3. **Railway integration issues:**
   - Verify `RAILWAY_GIT_COMMIT_SHA` is available in production
   - Check railway.toml configuration
   - Ensure the BUILD_ID is being set correctly

### Debug Commands

```bash
# Check Railway environment variables
railway variables

# Test local build with Railway variables
BUILD_ID=$RAILWAY_GIT_COMMIT_SHA npm run build

# Check git commit SHA
git rev-parse HEAD
```

## 📱 Manual Testing Checklist

- [ ] Version API responds correctly
- [ ] Polling happens every 5 minutes
- [ ] Notification appears on version change
- [ ] Refresh button works
- [ ] Dismiss button works
- [ ] Polling stops after notification
- [ ] Multiple tabs receive notification
- [ ] Works in both light/dark themes
- [ ] Mobile responsive
- [ ] Handles network errors gracefully

## 🎯 Automated Testing Ideas

For future implementation, consider these automated tests:

1. **Unit Tests:**
   - Test version API endpoint
   - Test useDeploymentDetection hook
   - Test notification component

2. **Integration Tests:**
   - Test version change detection
   - Test notification display
   - Test refresh functionality

3. **E2E Tests:**
   - Test full deployment notification flow
   - Test user interactions with notification
   - Test across different browsers

## 🔗 Related Files

- `/app/api/version/route.ts` - Version endpoint
- `/hooks/useDeploymentDetection.ts` - Detection hook
- `/components/DeploymentNotificationProvider.tsx` - Notification provider
- `/app/layout.tsx` - Provider integration
- `/railway.toml` - Railway configuration