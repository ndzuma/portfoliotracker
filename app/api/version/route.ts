import { NextResponse } from 'next/server';

// Use build timestamp for version tracking
// In production, this could be set by Railway's build process using environment variables
const BUILD_ID = process.env.BUILD_ID || process.env.RAILWAY_GIT_COMMIT_SHA || Date.now().toString();
const PACKAGE_VERSION = '0.1.0'; // Hardcoded for simplicity, could be dynamic

export async function GET() {
  return NextResponse.json({
    version: `${PACKAGE_VERSION}-${BUILD_ID.slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    buildId: BUILD_ID,
  });
}