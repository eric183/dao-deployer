import react from '@vitejs/plugin-react';
import path from 'path';
import ip from 'ip';
import os from 'os';
import { defineConfig } from 'vite';
import { execSync } from 'child_process';

// const LIBRARY_NAME = 'DaoPaaS';

// const CURRENT_BRANCH = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
// const CURRENT_BRANCH = execSync('git branch --show-current').toString();

const IS_PRODUCTION = process.env.NODE_ENV === 'development' ? false : true;

const modeInject = process.env.NODE_ENV;
// const modeInject = IS_PRODUCTION ? 'production' : 'development';
// console.log(ip.address('private'));

const networkInterfaces = os.networkInterfaces();

const ipAddress = /^192\.168/.test(ip.address())
  ? ip.address()
  : networkInterfaces['WLAN 2']?.find((x) => x.family === 'IPv4')?.address;

export default defineConfig({
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'),
  },
  root: path.resolve(__dirname, '../src'),
  server: {
    port: 3030,
    proxy: {
      '/jssdk/ticket': 'https://develop.1024paas.com',
      '/api/replaylist': 'http://localhost:3000',
    },
  },
  // preview: {
  //   port: 8080,
  // },
  // mode: 'production',
  mode: modeInject,
  // mode: IS_PRODUCTION ? 'production' : 'development',
  plugins: [react()],
  resolve: {
    alias: {
      vscode: require.resolve(
        '@codingame/monaco-languageclient/lib/vscode-compatibility',
      ),
      '~': path.resolve(__dirname, '../src'),
    },
  },

  define: {
    'process.env.LOCAL_IP_HOST': JSON.stringify(ipAddress),
    // 'process.env.CURRENT_BRANCH': JSON.stringify(CURRENT_BRANCH),
    // 'process.env.CURRENT_BRANCH': JSON.stringify(ipAddress),
  },
  envDir: path.resolve(__dirname, '../..'),
  // logLevel: 'error',

  build: {
    emptyOutDir: true,
    outDir: path.resolve(__dirname, '..', 'dist'),
    // minify: false,

    lib: {
      // bundle.tsx
      entry: path.resolve(
        __dirname,
        '..',
        IS_PRODUCTION ? 'src/_bundle.tsx' : 'src/app.tsx',
      ),
      // entry: path.resolve(__dirname, '..', 'src/test.tsx'),
      name: 'DaoPaaS',
      fileName: (format) => `DaoPaaS.${format}.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,

        // entryFileNames: `assets/[name].${IS_PRODUCTION ? 'js' : 'jsx'}`,
        // entryFileNames: `[name].js`,
        // chunkFileNames: `[name].js`,
        // assetFileNames: `[name].[ext]`,
        // // globals: {
        //   '@knight-lab/timelinejs': 'TL',
        // },
      },
    },
  },
});
