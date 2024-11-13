import type { Configuration as WebpackConfig } from 'webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config: WebpackConfig) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          canvas: false,
          encoding: false
        }
      }
    };
  }
};

export default nextConfig;