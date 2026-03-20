module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    ...(process.env.NODE_ENV !== 'test' ? ['nativewind/babel'] : []),
  ],
};
