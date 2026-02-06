// test-setup.ts - Setup file for convex-test with vitest
/// <reference types="vite/client" />

// Import all Convex functions for convex-test
export const modules = import.meta.glob("./**/*.ts");
