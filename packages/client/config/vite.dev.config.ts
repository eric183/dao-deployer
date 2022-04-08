import react from '@vitejs/plugin-react';
import path from 'path';
import ip from 'ip';
import os from 'os';
import { defineConfig } from 'vite';

const IS_PRODUCTION = process.env.NODE_ENV === 'development' ? false : true;

const modeInject = process.env.NODE_ENV;

const networkInterfaces = os.networkInterfaces();

const ipAddress = /^192\.168/.test(ip.address())
  ? ip.address()
  : networkInterfaces['WLAN 2']?.find((x) => x.family === 'IPv4')?.address;

export default defineConfig({
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.ts'),
  },
  root: path.resolve(__dirname, '../__dev__'),
  server: {
    port: 3031,
    proxy: {
      '/jssdk/ticket': 'https://develop.1024paas.com',
    },
  },
  // preview: {
  //   port: 8081,
  // },
  // mode: 'production',
  plugins: [react()],
  resolve: {
    alias: {
      vscode: require.resolve(
        '@codingame/monaco-languageclient/lib/vscode-compatibility',
      ),
      '~': path.resolve(__dirname, '../src'),
      'tailwind.config.js': path.resolve(__dirname, 'tailwind.config.js'),
    },
  },
  optimizeDeps: {
    include: ['tailwind.config.js'],
  },
  define: {
    'process.env.LOCAL_IP_HOST': JSON.stringify(ipAddress),
  },
  envDir: path.resolve(__dirname, '../..'),
});
