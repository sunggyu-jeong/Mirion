module.exports = {
  presets: [
    'module:@react-native/babel-preset',
  ],
  plugins: [
    'babel-plugin-transform-import-meta',
    ...(process.env.NODE_ENV !== 'test' ? ['react-native-reanimated/plugin'] : []),
  ],
};
