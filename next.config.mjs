/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Fix for large string serialization issue
    config.cache = {
      ...config.cache,
      cacheDirectory: config.cache.cacheDirectory,
      type: "filesystem",
      buildDependencies: config.cache.buildDependencies,
      cacheCompression: false,
      maxMemoryGenerations: 1,
    };
    return config;
  },
};

export default nextConfig;
