import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@app': path.resolve(__dirname, '../../src')
    },
    extensions: ['.web.js', '.js', '.jsx', '.json']
  },
  optimizeDeps: {
    exclude: ['react-native-safe-area-context']
  }
});
