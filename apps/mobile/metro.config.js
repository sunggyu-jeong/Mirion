const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

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
    resolveRequest: (context, moduleName, platform) => {
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
