/**
 * @format
 */

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';

const STORYBOOK_ENABLED = process.env.STORYBOOK_ENABLED === 'true';

if (STORYBOOK_ENABLED) {
  const StorybookUI = require('./.rnstorybook').default;
  AppRegistry.registerComponent(appName, () => StorybookUI);
} else {
  const App = require('./App').default;
  AppRegistry.registerComponent(appName, () => App);
}
