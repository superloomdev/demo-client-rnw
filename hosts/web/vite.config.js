import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import path from 'path';
import { computeBuildIdentity } from '../../scripts/build-identity.js';

const webNodeModules = path.resolve(__dirname, 'node_modules');

// Browser stub for node:module - helper-utils uses createRequire for JSON
// loading which is not needed in the browser bundle.
const nodeModuleStub = path.resolve(__dirname, 'node-module-stub.js');

// Compute the build identity for this build
const buildIdentity = computeBuildIdentity(path.resolve(__dirname, '../..'));

// Vite plugin: serve /__identity as JSON in both dev and preview
function identityPlugin (identity) {
  return {
    name: 'build-identity',
    configureServer (server) {
      server.middlewares.use('/__identity', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ identity: identity }));
      });
    },
    configurePreviewServer (server) {
      server.middlewares.use('/__identity', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ identity: identity }));
      });
    }
  };
}

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
    react(),
    identityPlugin(buildIdentity)
  ],
  define: {
    __BUILD_IDENTITY__: JSON.stringify(buildIdentity)
  },
  resolve: {
    alias: [
      { find: 'react-native', replacement: path.resolve(webNodeModules, 'react-native-web') },
      { find: 'react-native-safe-area-context', replacement: path.resolve(webNodeModules, 'react-native-safe-area-context') },
      { find: /@superloomdev\/(.*)/, replacement: path.resolve(webNodeModules, '@superloomdev/$1') },
      { find: '@app', replacement: path.resolve(__dirname, '../../src') },
      { find: 'node:module', replacement: nodeModuleStub }
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
  },
  preview: {
    allowedHosts: ['host.docker.internal', 'localhost', '127.0.0.1']
  }
});
