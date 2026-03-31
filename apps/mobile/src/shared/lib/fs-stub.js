// Stub for Node.js `fs` module — not available in React Native
exports.readFile = function (path, opts, cb) {
  const callback = typeof opts === 'function' ? opts : cb;
  if (callback) callback(new Error('fs.readFile not supported in React Native'));
};
exports.writeFile = function (path, data, opts, cb) {
  const callback = typeof opts === 'function' ? opts : cb;
  if (callback) callback(new Error('fs.writeFile not supported in React Native'));
};
exports.existsSync = function () { return false; };
exports.lstatSync = function () { throw new Error('fs.lstatSync not supported in React Native'); };
exports.renameSync = function () {};
exports.default = exports;
