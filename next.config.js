/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb']
  }
}

module.exports = nextConfig
