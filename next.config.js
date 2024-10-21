/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/api/auth/login',
          destination: '/sign-in',
          permanent: true,
        },
        // {
        //   source: '/sign-up',
        //   destination: '/sign-up',
        //   permanent: true,
        // },
      ]
    },
  
    webpack: (
      config,
      { buildId, dev, isServer, defaultLoaders, webpack }
    ) => {
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
      return config
  },
    typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  }
  
  module.exports = nextConfig