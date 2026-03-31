/**
 * @format
 */

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import '@walletconnect/react-native-compat';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (typeof global.process === 'undefined') {
  global.process = {};
}
if (typeof global.process.nextTick !== 'function') {
  global.process.nextTick = function nextTick(fn) {
    setTimeout(fn, 0);
  };
}

import './global.css';

import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
