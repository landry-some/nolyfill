"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"default",{enumerable:!0,get:function(){return t}});const t=t=>{if(null==t||"object"!=typeof t&&"function"!=typeof t)return null;if("string"==typeof t)return"String";if("number"==typeof t)return"Number";if("boolean"==typeof t)return"Boolean";if("symbol"==typeof t)return"Symbol";if("bigint"==typeof t)return"BigInt";if("object"==typeof t){let e=Object.prototype.toString.call(t);if("[object String]"===e)return"String";if("[object Number]"===e||"[object Boolean]"===e)return"Number";if("[object Symbol]"===e&&"symbol"==typeof t.valueOf()&&Symbol.prototype.toString.call(t).startsWith("Symbol("))return"Symbol";try{return BigInt.prototype.valueOf.call(t),"BigInt"}catch(t){}}};
((typeof exports.default === 'object' && exports.default !== null) || typeof exports.default === 'function') && (Object.assign(exports.default,exports), module.exports = exports.default);
