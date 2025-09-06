# BYOAI (Bring Your Own AI) Feature Design

## Overview

The BYOAI feature allows Portfolio Tracker users to choose how AI capabilities are provided within the application. This enables users to:

1. Use the default AI service provided by Portfolio Tracker
2. Connect to [OpenRouter](https://openrouter.ai) to access various LLM models
3. Self-host their own AI models and connect through a secure tunnel

## User Settings Interface

The BYOAI feature is integrated into the Settings page, providing users with a seamless way to configure their AI provider preferences.

### Configuration Options

#### 1. AI Provider Selection
Users can select from three provider types:
- **Default**: Uses Portfolio Tracker's hosted AI service
- **OpenRouter**: Connects to OpenRouter for access to various AI models
- **Self-Hosted**: Uses the user's own AI model through a secure tunnel

#### 2. OpenRouter Configuration
When OpenRouter is selected, users need to provide:
- **API Key**: User's OpenRouter API key
- **Preferred Model**: Selection of available models (GPT-4, Claude, etc.)
- **Fallback Option**: Toggle to use default AI if OpenRouter fails

#### 3. Self-Hosted Configuration
When Self-Hosted is selected, users need to provide:
- **Tunnel ID**: Unique identifier for the secure tunnel
- **Self-Hosted URL** (Optional): Direct URL to the model API if publicly accessible
- **Authentication Key**: Key for authenticating with the self-hosted model

## Data Model

### User Preferences Schema Extension

```javascript
{
  // Existing user preferences...
  aiProvider: string, // "default" | "openrouter" | "self-hosted"
  openRouterApiKey: string, // Encrypted at rest
  openRouterModelPreference: string, // Model ID
  fallbackToDefault: boolean,
  tunnelId: string,
  selfHostedUrl: string, // Optional
  selfHostedAuthKey: string, // Encrypted at rest
}
```

## Security Considerations

1. **API Key Storage**: All API keys are encrypted before being stored in the database
2. **Secure Tunnel**: The tunnel connection between Portfolio Tracker and self-hosted models uses TLS/SSL
3. **Authentication**: Proper authentication mechanisms for tunnel connections
4. **Access Control**: Users can only access their own AI configuration settings

## Technical Implementation

### Backend Components

1. **AI Provider Router**
   - Routes requests to the appropriate AI provider based on user preferences
   - Handles fallback logic if primary provider fails

2. **OpenRouter Connector**
   - Authenticates with OpenRouter using the user's API key
   - Formats requests according to OpenRouter's API specifications
   - Parses responses for use in Portfolio Tracker

3. **Self-Hosted Tunnel Service**
   - Manages secure connections to users' self-hosted models
   - Provides client software for users to install on their model-hosting devices
   - Handles authentication and encryption

### Request Flow

```
User Request → AI Provider Router → Selected Provider → Response
                                 ↘ Fallback Provider (if enabled and primary fails)
```

## User Experience

1. **Default Experience**: Users start with the default AI provider without configuration
2. **Easy Setup**: Simple configuration flow for connecting to OpenRouter or self-hosted models
3. **Connection Testing**: Users can test their connection before saving settings
4. **Clear Documentation**: Comprehensive guides for setting up each provider type

## Implementation Plan

### Phase 1: OpenRouter Integration
- Implement OpenRouter connector
- Add OpenRouter settings UI
- Create API key storage and encryption system

### Phase 2: Self-Hosted Tunnel
- Develop tunnel service architecture
- Create tunnel client software
- Implement tunnel management in backend
- Add self-hosted settings UI

### Phase 3: Testing and Refinement
- Test all provider types with real-world scenarios
- Optimize performance and reliability
- Implement monitoring and error handling

## API Reference

### AI Provider Selection API
```javascript
// Set AI provider
POST /api/user-preferences/ai-provider
{
  aiProvider: "openrouter",
  openRouterApiKey: "or-xxxxx",
  openRouterModelPreference: "gpt-4",
  fallbackToDefault: true
}

// Test connection
POST /api/ai/test-connection
{
  provider: "openrouter",
  apiKey: "or-xxxxx",
  modelId: "gpt-4"
}
```

### Self-Hosted Tunnel API
```javascript
// Register tunnel
POST /api/tunnel/register
{
  userId: "user-123",
  modelInfo: {
    name: "My Custom Model",
    capabilities: ["text-generation", "embeddings"]
  }
}

// Tunnel connection status
GET /api/tunnel/status/:tunnelId
```

## Security Measures

1. **API Key Handling**:
   - API keys are never logged or exposed in client-side code
   - Keys are encrypted before storage using industry-standard encryption
   - Keys are transmitted over secure connections only

2. **Tunnel Security**:
   - End-to-end encryption for all tunnel traffic
   - Certificate validation for tunnel connections
   - Regular rotation of tunnel authentication tokens

3. **Access Controls**:
   - Rate limiting to prevent abuse
   - User authentication required for all AI configuration changes
   - Proper validation of all user inputs

## FAQ for Users

### General Questions
- **What is BYOAI?** BYOAI allows you to use your preferred AI provider with Portfolio Tracker
- **Is BYOAI included in all plans?** Self-hosting requires a Pro subscription

### OpenRouter
- **What is OpenRouter?** OpenRouter is a unified API for accessing various AI models
- **Do I need an OpenRouter account?** Yes, you'll need to create an account and get an API key

### Self-Hosting
- **What models can I self-host?** Any model with an OpenAI-compatible API
- **What are the requirements?** A server with GPU capabilities and our tunnel software installed
- **Is my data private?** Yes, with self-hosting all your data stays on your infrastructure