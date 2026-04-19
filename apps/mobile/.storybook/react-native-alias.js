import * as ReactNativeWeb from 'react-native-web';

export const TurboModuleRegistry = {
  get: () => null,
};

export const NativeModules = ReactNativeWeb.NativeModules || {};
export const ViewPropTypes = { style: () => null };

// 나머지는 react-native-web의 모든 것을 내보냄
export * from 'react-native-web';
export default ReactNativeWeb.default;
