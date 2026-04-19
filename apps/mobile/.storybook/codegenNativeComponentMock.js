const proxy = new Proxy(() => proxy, {
  get: () => proxy,
});

export default proxy;
export const commands = proxy;
export const TurboModuleRegistry = {
  get: () => proxy,
};
export const NativeModules = proxy;
export const ViewPropTypes = { style: proxy };
