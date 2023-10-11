"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _shared = require("@nolyfill/shared");
const implementation = String.prototype.at || function at(n) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return String.prototype.charAt.call(this, n);
};
const _default = (0, _shared.defineEsShim)(implementation);

Object.assign(exports.default, exports);
module.exports = exports.default;
