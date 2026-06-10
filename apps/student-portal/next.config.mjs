/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://api-gateway:3000'}/api/:path*`,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
