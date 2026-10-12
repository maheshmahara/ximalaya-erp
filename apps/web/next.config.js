/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    allowedDevOrigins: [
      "103.254.186.194:55555",
      "103.254.186.194",
      "192.168.5.109:55555",
      "192.168.5.109",
      "localhost:55555",
      "localhost:3000"
    ]
  }
};

module.exports = nextConfig;
