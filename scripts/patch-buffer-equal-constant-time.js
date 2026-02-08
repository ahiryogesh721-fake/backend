const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "buffer-equal-constant-time",
  "index.js"
);

const patched = `/*jshint node:true */
'use strict';
var Buffer = require('buffer').Buffer; // browserify
var SlowBuffer = require('buffer').SlowBuffer;

module.exports = bufferEq;

function bufferEq(a, b) {

  // shortcutting on type is necessary for correctness
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    return false;
  }

  // buffer sizes should be well-known information, so despite this
  // shortcutting, it doesn't leak any information about the *contents* of the
  // buffers.
  if (a.length !== b.length) {
    return false;
  }

  var c = 0;
  for (var i = 0; i < a.length; i++) {
    /*jshint bitwise:false */
    c |= a[i] ^ b[i]; // XOR
  }
  return c === 0;
}

bufferEq.install = function() {
  Buffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };

  if (SlowBuffer && SlowBuffer.prototype) {
    SlowBuffer.prototype.equal = function equal(that) {
      return bufferEq(this, that);
    };
  }
};

var origBufEqual = Buffer.prototype.equal;
var origSlowBufEqual = SlowBuffer && SlowBuffer.prototype
  ? SlowBuffer.prototype.equal
  : undefined;
bufferEq.restore = function() {
  Buffer.prototype.equal = origBufEqual;
  if (SlowBuffer && SlowBuffer.prototype) {
    SlowBuffer.prototype.equal = origSlowBufEqual;
  }
};
`;

if (!fs.existsSync(target)) {
  console.log("[patch-buffer-equal-constant-time] target not found, skipping");
  process.exit(0);
}

const current = fs.readFileSync(target, "utf8");
if (current === patched) {
  console.log("[patch-buffer-equal-constant-time] already patched");
  process.exit(0);
}

fs.writeFileSync(target, patched, "utf8");
console.log("[patch-buffer-equal-constant-time] patched successfully");
