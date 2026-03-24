const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

const monorepoRoot = path.resolve(__dirname, '../..');

const aliases = {
  '@app': path.resolve(__dirname, 'src/app'),
  '@pages': path.resolve(__dirname, 'src/pages'),
  '@widgets': path.resolve(__dirname, 'src/widgets'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@entities': path.resolve(__dirname, 'src/entities'),
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@modules': path.resolve(__dirname, 'modules'),
};

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(monorepoRoot, 'node_modules'),
    ],
    unstable_conditionNames: ['require', 'default', 'react-native'],
    resolveRequest: (context, moduleName, platform) => {
      // Force zustand to use CJS builds — ESM builds contain import.meta which Hermes doesn't support
      if (moduleName.startsWith('zustand')) {
        const sub = moduleName.slice('zustand'.length); // e.g. '/middleware' or ''
        const cjsPath = path.resolve(monorepoRoot, 'node_modules/zustand' + (sub || '/index') + '.js');
        return { filePath: cjsPath, type: 'sourceFile' };
      }

      // Polyfill node:crypto for @metamask/sdk in React Native
      if (moduleName === 'node:crypto' || moduleName === 'crypto') {
        return {
          filePath: path.resolve(__dirname, 'src/shared/lib/crypto-polyfill.js'),
          type: 'sourceFile',
        };
      }

      // Shim @react-native-async-storage/async-storage with MMKV (required by @metamask/sdk)
      if (moduleName === '@react-native-async-storage/async-storage') {
        return {
          filePath: path.resolve(__dirname, 'src/shared/lib/async-storage-shim.js'),
          type: 'sourceFile',
        };
      }

      // Remap engine.io-client Node.js-specific files to browser equivalents.
      // Metro should do this automatically via the browser field, but explicit
      // remapping avoids any race condition or version quirk.
      if (context.originModulePath && context.originModulePath.includes('engine.io-client')) {
        const engineIoRoot = path.resolve(monorepoRoot, 'node_modules/engine.io-client');
        const nodeJsRemaps = {
          '../globals.node.js': path.join(engineIoRoot, 'build/cjs/globals.js'),
          './globals.node.js': path.join(engineIoRoot, 'build/cjs/globals.js'),
          './websocket.node.js': path.join(engineIoRoot, 'build/cjs/transports/websocket.js'),
          './polling-xhr.node.js': path.join(engineIoRoot, 'build/cjs/transports/polling-xhr.js'),
        };
        if (nodeJsRemaps[moduleName]) {
          return { filePath: nodeJsRemaps[moduleName], type: 'sourceFile' };
        }
      }

      // Stub out 'ws' (Node.js WebSocket library) — not compatible with React Native.
      // engine.io-client should use the global WebSocket instead.
      if (moduleName === 'ws') {
        return {
          filePath: path.resolve(__dirname, 'src/shared/lib/ws-stub.js'),
          type: 'sourceFile',
        };
      }

      // Fix for lazy split bundle URL normalization in monorepo:
      // When Metro serves split bundles with paths like /../../node_modules/pkg/...,
      // Node.js HTTP server normalizes ../../ away, causing Metro to resolve
      // ./node_modules/pkg/... relative to apps/mobile instead of monorepo root.
      if (moduleName.startsWith('./node_modules/')) {
        const basePath = path.resolve(monorepoRoot, moduleName.slice('./'.length));
        const tryExts = ['.js', '.ts', '.tsx', '.jsx', '/index.js', '/index.ts', '/index.tsx'];
        for (const ext of tryExts) {
          const filePath = basePath + ext;
          if (fs.existsSync(filePath)) {
            return { filePath, type: 'sourceFile' };
          }
        }
        // File not found with known extensions — let default resolver handle it
      }

      for (const [alias, aliasPath] of Object.entries(aliases)) {
        if (moduleName === alias || moduleName.startsWith(alias + '/')) {
          const resolved = aliasPath + moduleName.slice(alias.length);
          return context.resolveRequest(context, resolved, platform);
        }
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = withNativeWind(mergeConfig(getDefaultConfig(__dirname), config), {
  input: './global.css',
});
