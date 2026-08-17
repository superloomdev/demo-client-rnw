import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import path from 'path';

const webNodeModules = path.resolve(__dirname, 'node_modules');

export default defineConfig({
  plugins: [
    commonjs(),
    {
      name: 'js-jsx-loader',
      enforce: 'pre',
      async transform (file, id) {
        if (/\/src\/.*\.js$/.test(id) && !id.includes('node_modules')) {
          const result = await transformWithEsbuild(file, id, {
            loader: 'jsx',
            jsx: 'automatic',
            sourcemap: true
          });
          return {
            code: result.code,
            map: result.map
          };
        }
        return null;
      }
    },
    react()
  ],
  resolve: {
    alias: [
      { find: 'react-native', replacement: path.resolve(webNodeModules, 'react-native-web') },
      { find: 'react-native-safe-area-context', replacement: path.resolve(webNodeModules, 'react-native-safe-area-context') },
      { find: /@superloomdev\/(.*)/, replacement: path.resolve(webNodeModules, '@superloomdev/$1') },
      { find: '@app', replacement: path.resolve(__dirname, '../../src') }
    ],
    extensions: ['.web.js', '.js', '.jsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    },
    exclude: ['react-native-safe-area-context']
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, '../..')]
    }
  }
});
