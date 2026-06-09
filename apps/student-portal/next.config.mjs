/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway:3000'}/:path*`,
      },
    ];
  },
  output: 'standalone',
};

export default nextConfig;
