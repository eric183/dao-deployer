/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // experimental: {
  //   outputStandalone: true,
  // },
  serverRuntimeConfig: {
    TEST_DATA: process.env.NEXT_PUBLIC_TEST_DATA,
  },

  publicRuntimeConfig: {
    // Will be available on both server and client
    TEST_DATA: process.env.NEXT_PUBLIC_TEST_DATA,

    // staticFolder: '/static',
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: '/sdk/:path*',
  //       destination: 'https://api.example.com/sdk/:path*',
  //     },
  //   ];
  // },
};

// console.log(process.env.NEXT_PUBLIC_TEST_DATA);
module.exports = nextConfig;
// NEXT_PUBLIC_TEST_DATA
