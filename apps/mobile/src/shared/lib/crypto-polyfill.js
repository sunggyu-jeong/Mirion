'use strict';

// Polyfill for node:crypto — required by @metamask/sdk in React Native
// Uses @noble/hashes (pure JS, already a transitive dep) and global.crypto

const { sha256 } = require('@noble/hashes/sha256');
const { sha512 } = require('@noble/hashes/sha512');
const { sha1 } = require('@noble/hashes/sha1');
const { hmac } = require('@noble/hashes/hmac');

function toBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return new Uint8Array(data);
}

function randomBytes(size) {
  const bytes = new Uint8Array(size);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(bytes);
}

class Hash {
  constructor(algorithm) {
    this._algorithm = algorithm.toLowerCase().replace('-', '');
    this._chunks = [];
  }

  update(data) {
    this._chunks.push(toBytes(data));
    return this;
  }

  digest(encoding) {
    const total = this._chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const c of this._chunks) { merged.set(c, off); off += c.length; }

    let result;
    if (this._algorithm === 'sha256') result = sha256(merged);
    else if (this._algorithm === 'sha512') result = sha512(merged);
    else if (this._algorithm === 'sha1') result = sha1(merged);
    else throw new Error(`crypto-polyfill: unsupported hash algorithm: ${this._algorithm}`);

    const buf = Buffer.from(result);
    if (!encoding || encoding === 'buffer') return buf;
    return buf.toString(encoding);
  }
}

class Hmac {
  constructor(algorithm, key) {
    this._algorithm = algorithm.toLowerCase().replace('-', '');
    this._key = toBytes(typeof key === 'string' ? Buffer.from(key) : key);
    this._chunks = [];
  }

  update(data) {
    this._chunks.push(toBytes(data));
    return this;
  }

  digest(encoding) {
    const total = this._chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Uint8Array(total);
    let off = 0;
    for (const c of this._chunks) { merged.set(c, off); off += c.length; }

    let hashFn;
    if (this._algorithm === 'sha256') hashFn = sha256;
    else if (this._algorithm === 'sha512') hashFn = sha512;
    else throw new Error(`crypto-polyfill: unsupported hmac algorithm: ${this._algorithm}`);

    const result = hmac(hashFn, this._key, merged);
    const buf = Buffer.from(result);
    if (!encoding || encoding === 'buffer') return buf;
    return buf.toString(encoding);
  }
}

function createHash(algorithm) {
  return new Hash(algorithm);
}

function createHmac(algorithm, key) {
  return new Hmac(algorithm, key);
}

function randomUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

function getHashes() {
  return ['sha1', 'sha256', 'sha512'];
}

module.exports = {
  randomBytes,
  createHash,
  createHmac,
  randomUUID,
  getHashes,
};
