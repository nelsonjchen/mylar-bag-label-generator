/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // serverExternalPackages: ['@react-pdf/renderer'], // Try disabling this
  transpilePackages: ['@react-pdf/renderer'],
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['got-scraping', 'header-generator'],
  },
  webpack: (config, { isServer, webpack }) => {
    config.resolve.alias.canvas = false;

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: 'buffer', // Polyfill buffer
        stream: 'stream-browserify', // Polyfill stream
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
