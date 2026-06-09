/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://academic-engine:8081'}/api/:path*`,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
