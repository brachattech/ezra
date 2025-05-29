/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Só ativa em produção
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
