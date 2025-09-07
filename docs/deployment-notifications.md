# Deployment Notification System

This system automatically notifies users when a new version of the application has been deployed, showing a Sonner toast notification with a refresh button.

## How it Works

### 1. Version Tracking (`/api/version`)
- Provides a REST endpoint that returns the current deployment version
- Uses Railway's `RAILWAY_GIT_COMMIT_SHA` environment variable in production
- Falls back to timestamp-based versioning in development

### 2. Deployment Detection Hook (`useDeploymentDetection`)
- Polls the version endpoint every 5 minutes
- Compares current version with the last known version
- Triggers notification when a version change is detected
- Automatically stops polling once a new deployment is detected

### 3. Notification Component (`DeploymentNotificationProvider`)
- Uses Sonner to display user-friendly toast notifications
- Shows "New version available!" message with description
- Includes a refresh button that reloads the page
- Notification persists until user takes action

### 4. Integration
- Added to the root layout for app-wide coverage
- Non-intrusive - doesn't affect app performance or user experience
- Works automatically without any user configuration

## Production Setup

### Railway Configuration
The `railway.toml` has been updated to set the build ID:
```toml
buildCommand = "BUILD_ID=$RAILWAY_GIT_COMMIT_SHA pnpm install --no-frozen-lockfile && npx convex deploy --cmd 'npm run build'"
```

This ensures each deployment gets a unique identifier based on the Git commit SHA.

### GitHub Integration
Since Railway automatically deploys from GitHub:
1. When you push to your main branch
2. Railway triggers a new deployment
3. The new deployment gets a unique build ID
4. Users visiting the app will be notified of the new version

## Testing

### Development Testing
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/api/version` to see the current version
3. The notification system is active and checking for updates

### Manual Testing
You can manually test the notification by:
1. Loading the app in a browser
2. Changing the version API response
3. Waiting for the next check cycle (5 minutes) or refreshing

## Technical Details

### Files Added/Modified
- `app/api/version/route.ts` - Version tracking endpoint
- `hooks/useDeploymentDetection.ts` - Deployment detection logic
- `components/DeploymentNotificationProvider.tsx` - Notification UI
- `app/layout.tsx` - Integration into app structure
- `railway.toml` - Production build configuration

### Dependencies Used
- **Sonner** (already installed) - For toast notifications
- **Lucide React** (already installed) - For refresh icon
- No additional dependencies required

### Performance Impact
- Minimal: Only makes one API call every 5 minutes
- Stops polling once update is detected
- Uses lightweight JSON endpoint
- No impact on initial page load

## Customization

### Polling Interval
Change the check frequency in `useDeploymentDetection.ts`:
```typescript
// Current: 5 minutes
setInterval(checkForUpdates, 5 * 60 * 1000);

// Example: 2 minutes  
setInterval(checkForUpdates, 2 * 60 * 1000);
```

### Notification Message
Customize the toast in `DeploymentNotificationProvider.tsx`:
```typescript
toast('Custom message!', {
  description: 'Your custom description here.',
  // ... other options
});
```

### Version Format
Modify version format in `/api/version/route.ts`:
```typescript
return NextResponse.json({
  version: `v${PACKAGE_VERSION}-${BUILD_ID.slice(0, 8)}`,
  // ... other fields
});
```

## Security Considerations

- The version endpoint only exposes build metadata, not sensitive information
- No user data or credentials are involved
- Polling happens client-side and respects browser limitations
- Rate limiting can be added if needed in production

## Future Enhancements

- Add WebSocket support for real-time notifications
- Integrate with Railway webhooks for instant notifications  
- Add deployment changelog/release notes
- Support for A/B testing and gradual rollouts
- User preferences for notification timing