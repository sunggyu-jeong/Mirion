const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
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
        const sub = moduleName.slice('zustand'.length);
        const cjsPath = path.resolve(monorepoRoot, 'node_modules/zustand' + (sub || '/index') + '.js');
        return { filePath: cjsPath, type: 'sourceFile' };
      }

      // Fix for lazy split bundle URL normalization in monorepo
      if (moduleName.startsWith('./node_modules/')) {
        const basePath = path.resolve(monorepoRoot, moduleName.slice('./'.length));
        const tryExts = ['.js', '.ts', '.tsx', '.jsx', '/index.js', '/index.ts', '/index.tsx'];
        for (const ext of tryExts) {
          const filePath = basePath + ext;
          if (fs.existsSync(filePath)) {
            return { filePath, type: 'sourceFile' };
          }
        }
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

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
