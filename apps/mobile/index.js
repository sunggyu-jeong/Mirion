/**
 * @format
 */

// WalletConnect compat must be first
import '@walletconnect/react-native-compat';

// Polyfill globals required by @metamask/sdk and its dependencies
// These must be set before any lazy split bundles are evaluated.

// Buffer global (needed by @metamask/sdk, socket.io-client, etc.)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// crypto.getRandomValues (needed by uuid inside @metamask/sdk)
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function getRandomValues(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// process.nextTick (needed by some Node.js-style packages)
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
