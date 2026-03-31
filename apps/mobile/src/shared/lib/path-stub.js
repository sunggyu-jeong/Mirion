// Stub for Node.js `path` module — not available in React Native
var sep = '/';
var delimiter = ':';

function join() {
  var parts = Array.prototype.slice.call(arguments);
  return parts.join('/').replace(/\/+/g, '/');
}
function resolve() {
  var parts = Array.prototype.slice.call(arguments);
  return parts.join('/').replace(/\/+/g, '/');
}
function dirname(p) {
  return p ? p.replace(/\/[^/]+$/, '') || '/' : '.';
}
function basename(p, ext) {
  var base = p ? p.split('/').pop() : '';
  if (ext && base.endsWith(ext)) base = base.slice(0, -ext.length);
  return base;
}
function extname(p) {
  var base = basename(p);
  var idx = base.lastIndexOf('.');
  return idx > 0 ? base.slice(idx) : '';
}
function normalize(p) {
  return p ? p.replace(/\/+/g, '/') : '.';
}
function isAbsolute(p) {
  return p ? p.charAt(0) === '/' : false;
}
function relative(from, to) {
  return to;
}

exports.sep = sep;
exports.delimiter = delimiter;
exports.join = join;
exports.resolve = resolve;
exports.dirname = dirname;
exports.basename = basename;
exports.extname = extname;
exports.normalize = normalize;
exports.isAbsolute = isAbsolute;
exports.relative = relative;
exports.posix = exports;
exports.default = exports;
