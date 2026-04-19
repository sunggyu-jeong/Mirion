import { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: '',
      },
    },
  },
  async viteFinal(config) {
    const src = path.resolve(__dirname, '../src');

    return mergeConfig(config, {
      plugins: [
        // React Native 파일들에서 Flow 구문을 제거하기 위한 Babel 처리
        require('@vitejs/plugin-react')({
          babel: {
            plugins: [
              ['@babel/plugin-transform-flow-strip-types', { allowDeclareFields: true }],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-export-default-from',
              'react-native-reanimated/plugin',
            ],
            presets: ['@babel/preset-flow'],
          },
        }),
      ],
      resolve: {
        alias: [
          { find: /^react$/, replacement: path.resolve(__dirname, '../node_modules/react') },
          {
            find: /^react-dom$/,
            replacement: path.resolve(__dirname, '../node_modules/react-dom'),
          },
          { find: /^react-native$/, replacement: path.resolve(__dirname, 'react-native-alias.js') },
          { find: /^react-native-svg$/, replacement: 'react-native-svg' },
          {
            find: /^react-native-config$/,
            replacement: path.resolve(__dirname, 'codegenNativeComponentMock.js'),
          },
          {
            find: /^react-native\/Libraries\/.*$/,
            replacement: path.resolve(__dirname, 'codegenNativeComponentMock.js'),
          },
          { find: '@app', replacement: path.resolve(src, 'app') },
          { find: '@pages', replacement: path.resolve(src, 'pages') },
          { find: '@widgets', replacement: path.resolve(src, 'widgets') },
          { find: '@features', replacement: path.resolve(src, 'features') },
          { find: '@entities', replacement: path.resolve(src, 'entities') },
          { find: '@shared', replacement: path.resolve(src, 'shared') },
        ],
      },
      define: {
        global: 'window',
        __DEV__: JSON.stringify(true),
        process: JSON.stringify({ env: {} }),
      },
      optimizeDeps: {
        exclude: ['react-native', 'react-native-config'],
        include: [
          'react-native-reanimated',
          'react-native-gesture-handler',
          '@gorhom/bottom-sheet',
          'react-native-safe-area-context',
        ],
      },
    });
  },
};

export default config;
