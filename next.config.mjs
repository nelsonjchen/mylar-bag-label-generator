/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ensure react-pdf is transpiled for the browser
  transpilePackages: ['@react-pdf/renderer'],
  // Do NOT add @react-pdf/renderer to serverExternalPackages for client-side rendering
  serverExternalPackages: ['got-scraping', 'header-generator'],

  experimental: {
    // This is often needed for react-pdf in refined Next.js environments
  },
  webpack: (config, { isServer, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: 'buffer',
        stream: 'stream-browserify',
        zlib: 'browserify-zlib',
        util: 'util',
        assert: 'assert',
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};

export default nextConfig;
