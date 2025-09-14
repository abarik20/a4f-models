/**
 * next.config.js
 * Rewrites to expose API endpoints at top-level paths
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Map top-level paths to API routes
      { source: '/chat', destination: '/api/chat' },
      { source: '/chat/:path*', destination: '/api/chat/:path*' },

      { source: '/image', destination: '/api/image' },
      { source: '/image/:path*', destination: '/api/image/:path*' },

      { source: '/audio', destination: '/api/audio' },
      { source: '/audio/:path*', destination: '/api/audio/:path*' },

      { source: '/embeddings', destination: '/api/embedding' },
      { source: '/embeddings/:path*', destination: '/api/embedding/:path*' }
    ];
  }
};

module.exports = nextConfig;
