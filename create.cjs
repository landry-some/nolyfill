// @ts-check
'use strict';

const fsPromises = require('fs/promises');
const path = require('path');
const ezspawn = require('@jsdevtools/ez-spawn');

const currentPackageJson = require('./package.json');

const { compareAndWriteFile } = require('@nolyfill/internal');

const autoGeneratedPackagesList = /** @type {const} */ ([
  ['array-includes', 'Array.prototype.includes', false],
  ['array.prototype.findlastindex', `Array.prototype.findLastIndex || function (callback, thisArg) {
  for (let i = this.length - 1; i >= 0; i--) {
    if (callback.call(thisArg, this[i], i, this)) return i;
  }
  return -1;
}`, false],
  ['array.prototype.findlast', `Array.prototype.findLast || function (callback, thisArg) {
  for (let i = this.length - 1; i >= 0; i--) {
    const value = this[i];
    if (callback.call(thisArg, value, i, this)) return value;
  }
  return void undefined;
}`, false],
  ['array.prototype.at', `Array.prototype.at || function at(n) {
  n = Math.trunc(n) || 0;
  if (n < 0) n += this.length;
  if (n < 0 || n >= this.length) return undefined;
  return this[n];
}`, false],
  ['string.prototype.at', `String.prototype.at || function at(n) {
  n = Math.trunc(n) || 0;
  if (n < 0) n += this.length;
  if (n < 0 || n >= this.length) return undefined;
  return String.prototype.charAt.call(this, n);
}`, false],
  ['array.prototype.flat', 'Array.prototype.flat', false],
  ['array.prototype.flatmap', 'Array.prototype.flatMap', false],
  ['arraybuffer.prototype.slice', 'ArrayBuffer.prototype.slice', false],
  ['function.prototype.name', 'Function.prototype.name', false],
  ['has', 'Object.prototype.hasOwnProperty', false],
  ['object-keys', 'Object.keys', true],
  ['object.assign', 'Object.assign', true],
  ['object.entries', 'Object.entries', true],
  ['object.fromentries', 'Object.fromEntries', true],
  ['object.hasown', 'Object.hasOwn || require(\'@nolyfill/shared\').uncurryThis(Object.prototype.hasOwnProperty)', true, { '@nolyfill/shared': 'workspace:*' }],
  ['object.values', 'Object.values', true],
  ['string.prototype.trim', 'String.prototype.trim', false],
  ['string.prototype.trimend', 'String.prototype.trimEnd', false],
  ['string.prototype.trimstart', 'String.prototype.trimStart', false],
  ['string.prototype.trimleft', 'String.prototype.trimLeft', false],
  ['string.prototype.trimright', 'String.prototype.trimRight', false],
  ['string.prototype.matchall', 'String.prototype.matchAll', false],
  ['regexp.prototype.flags', 'RegExp.prototype.flags', false],
  // ['globalthis', 'globalThis', true], // globalthis package's entrypoint is a function, not the implementation
  ['array.prototype.tosorted', `Array.prototype.toSorted || function (compareFn) {
  const o = Object(this);
  const l = Number(o.length);
  const a = new Array(l);
  for (let i = 0; i < l; i++) {
    a[i] = o[i];
  }
  Array.prototype.sort.call(a, compareFn);
  return a;
}`, false],
  ['object.groupby', `Object.groupBy || function (items, callbackfn) {
  const o = Object.create(null);
  let k = 0;
  for (const value of items) {
    const key = callbackfn(value, k++);
    if (key in o) {
      Array.prototype.push.call(o[key], value);
    } else {
      o[key] = [value];
    }
  }
  return o;
}`, true],
  ['array.prototype.find', 'Array.prototype.find', false],
  ['array.from', 'Array.from', true],
  ['string.prototype.padend', 'String.prototype.padEnd', false],
  ['string.prototype.padstart', 'String.prototype.padStart', false],
  ['object.getownpropertydescriptors', 'Object.getOwnPropertyDescriptors', true],
  ['array.prototype.reduce', 'Array.prototype.reduce', false],
  ['object-is', 'Object.is', true],
  ['reflect.ownkeys', 'Reflect.ownKeys', true],
  // ['array.prototype.filter', 'Array.prototype.filter', false],
  ['string.prototype.replaceall', 'String.prototype.replaceAll', false],
  // ['array.prototype.map', 'Array.prototype.map', false],
  ['reflect.getprototypeof', 'Reflect.getPrototypeOf', true],
  // ['object.getprototypeof', 'Object.getPrototypeOf', true]
  ['es-aggregate-error', `typeof AggregateError === 'function'
  ? AggregateError
  : (() => {
    function AggregateError(errors, message) {
      const error = new Error(message);
      Object.setPrototypeOf(error, AggregateError.prototype);
      delete error.constructor;
      Object.defineProperty(error, 'errors', { value: Array.from(errors) });
      return error;
    }
    Object.defineProperty(AggregateError, 'prototype', { writable: false });
    Object.defineProperties(AggregateError.prototype, {
      constructor: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: AggregateError
      },
      message: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: ''
      },
      name: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: 'AggregateError'
      }
    });
    Object.setPrototypeOf(AggregateError.prototype, Error.prototype);
    return AggregateError;
  })()`, true],
  ['promise.any', `Promise.any || function any(iterable) {
  const AggregateError = require('@nolyfill/es-aggregate-error/polyfill')();
  const $reject = Promise.reject.bind(this);
  const $resolve = Promise.resolve.bind(this);
  const $all = Promise.all.bind(this);

  try {
    return $all(
      Array.from(iterable)
        .map((item) => $resolve(item).then(x => $reject(x), x => x))
    ).then(
      (errors) => {
        throw new AggregateError(errors, 'Every promise rejected');
      },
      x => x
    );
  } catch (e) {
    return $reject(e);
  }
}`, true, { '@nolyfill/es-aggregate-error': 'workspace:*' }, '>=12.4.0', 'Promise'],
  ['promise.allsettled', `Promise.allSettled || function allSettled(iterable) {
  const $reject = Promise.reject.bind(this);
  const $resolve = Promise.resolve.bind(this);
  const $all = Promise.all.bind(this);
  return $all(Array.from(iterable).map((item) => {
    const p = $resolve(item);
    try {
      return p.then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason })
      );
    } catch (e) {
      return $reject(e);
    }
  }));
}`, true, {}, '>=12.4.0', 'Promise']
]);

const singleFilePackagesList = /** @type {const} */ ([
  ['has-property-descriptors', `const hasPropertyDescriptors = () => true;
hasPropertyDescriptors.hasArrayLengthDefineBug = () => false;
module.exports = hasPropertyDescriptors;`],
  ['gopd', 'module.exports = Object.getOwnPropertyDescriptor;'],
  ['has-proto', 'module.exports = () => true;'],
  ['get-symbol-description', `const { uncurryThis } = require('@nolyfill/shared');
module.exports = uncurryThis(Object.getOwnPropertyDescriptor(Symbol.prototype, 'description').get);`, { '@nolyfill/shared': 'workspace:*' }],
  ['is-array-buffer', `const { uncurryThis } = require('@nolyfill/shared');
const bL = uncurryThis(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get);
module.exports = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  try {
    bL(obj);
    return true;
  } catch (_) {
    return false;
  }
};`, { '@nolyfill/shared': 'workspace:*' }],
  ['is-shared-array-buffer', `const { uncurryThis } = require('@nolyfill/shared');
const bL = uncurryThis(Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, 'byteLength').get);
module.exports = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  try {
    bL(obj);
    return true;
  } catch (_) {
    return false;
  }
};`, { '@nolyfill/shared': 'workspace:*' }],
  ['typed-array-buffer', `const { uncurryThis } = require('@nolyfill/shared');
module.exports = uncurryThis(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Int8Array.prototype), 'buffer').get);`, { '@nolyfill/shared': 'workspace:*' }],
  ['typed-array-byte-length', `const { TypedArrayPrototype, uncurryThis } = require('@nolyfill/shared');
const typedArrayByteLength = uncurryThis(Object.getOwnPropertyDescriptor(TypedArrayPrototype, 'byteLength').get);
module.exports = (value) => {
  try {
    return typedArrayByteLength(value);
  } catch (e) {
    return false;
  }
};`, { '@nolyfill/shared': 'workspace:*' }],
  ['typed-array-byte-offset', `const { TypedArrayPrototype, uncurryThis } = require('@nolyfill/shared');
const typedArrayByteOffSet = uncurryThis(Object.getOwnPropertyDescriptor(TypedArrayPrototype, 'byteOffset').get);
module.exports = (value) => {
  try {
    return typedArrayByteOffSet(value);
  } catch (e) {
    return false;
  }
};`, { '@nolyfill/shared': 'workspace:*' }],
  ['typed-array-length', `const { TypedArrayPrototype, uncurryThis } = require('@nolyfill/shared');
const typedArrayLength = uncurryThis(Object.getOwnPropertyDescriptor(TypedArrayPrototype, 'length').get);
module.exports = (value) => {
  try {
    return typedArrayLength(value);
  } catch (e) {
    return false;
  }
};`, { '@nolyfill/shared': 'workspace:*' }],
  ['harmony-reflect', 'module.exports = Reflect;'],
  ['array-buffer-byte-length', `const { uncurryThis } = require('@nolyfill/shared');
const isArrayBuffer = require('@nolyfill/is-array-buffer');
const bL = uncurryThis(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength').get);
module.exports = (ab) => {
  if (!isArrayBuffer(ab)) return NaN;
  return bL(ab);
};`, { '@nolyfill/is-array-buffer': 'workspace:*', '@nolyfill/shared': 'workspace:*' }],
  ['iterator.prototype', 'module.exports = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));'],
  ['available-typed-arrays', `module.exports = [
  'BigInt64Array', 'BigUint64Array',
  'Float32Array', 'Float64Array',
  'Int16Array', 'Int32Array', 'Int8Array',
  'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray'
];`],
  ['which-typed-array', `const { uncurryThis } = require('@nolyfill/shared');

const cacheEntries = Object.entries([
  'BigInt64Array', 'BigUint64Array',
  'Float32Array', 'Float64Array',
  'Int16Array', 'Int32Array', 'Int8Array',
  'Uint16Array', 'Uint32Array', 'Uint8Array', 'Uint8ClampedArray'
].reduce((acc, typedArray) => {
  const proto = Object.getPrototypeOf(new globalThis[typedArray]());
  acc[\`$\${typedArray}\`] = uncurryThis((
    Object.getOwnPropertyDescriptor(proto, Symbol.toStringTag)
    || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(proto), Symbol.toStringTag)
  ).get);
  return acc;
}, Object.create(null)));

const tryTypedArrays = (value) => {
  let found = false;
  cacheEntries.forEach(([typedArray, getter]) => {
    if (!found) {
      try {
        if (\`$\${getter(value)}\` === typedArray) {
          found = typedArray.slice(1);
        }
      } catch (e) { /**/ }
    }
  });
  return found;
};

module.exports = (value) => {
  if (!value || typeof value !== 'object') { return false; }
  return tryTypedArrays(value);
};`, { '@nolyfill/shared': 'workspace:*' }],
  ['which-boxed-primitive', `module.exports = (value) => {
  if (value == null || (typeof value !== 'object' && typeof value !== 'function')) return null;
  if (typeof value === 'string') return 'String';
  if (typeof value === 'number') return 'Number';
  if (typeof value === 'boolean') return 'Boolean';
  if (typeof value === 'symbol') return 'Symbol';
  if (typeof value === 'bigint') return 'BigInt';
  if (typeof value === 'object') {
    if (Object.prototype.toString.call(value) === '[object String]') return 'String';
    if (Object.prototype.toString.call(value) === '[object Number]') return 'Number';
    if (Object.prototype.toString.call(value) === '[object Boolean]') return 'Number';
    if (
      Object.prototype.toString.call(value) === '[object Symbol]'
      && typeof value.valueOf() === 'symbol'
      && Symbol.prototype.toString.call(value).startsWith('Symbol(')
    ) return 'Symbol';
    try {
      BigInt.prototype.valueOf.call(value);
      return 'BigInt';
    } catch (_) {}
  }
};`],
  ['unbox-primitive', `module.exports = function unboxPrimitive(value) {
  if (value == null || (typeof value !== 'object' && typeof value !== 'function')) {
    throw new TypeError(value === null ? 'value is an unboxed primitive' : 'value is a non-boxed-primitive object');
  }
  if (typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]') {
    return String.prototype.toString.call(value);
  }
  if (typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]') {
    return Number.prototype.valueOf.call(value);
  }
  if (typeof value === 'boolean' || Object.prototype.toString.call(value) === '[object Boolean]') {
    return Boolean.prototype.valueOf.call(value);
  }
  if (typeof value === 'symbol' || (
    Object.prototype.toString.call(value) === '[object Symbol]'
    && typeof value.valueOf() === 'symbol'
    && Symbol.prototype.toString.call(value).startsWith('Symbol(')
  )) {
    return Symbol.prototype.valueOf.call(value);
  }
  try {
    return BigInt.prototype.valueOf.call(value);
  } catch (_) {}
  throw new RangeError('unknown boxed primitive');
};`],
  ['is-regex', `module.exports = (value) => {
  if (!value || (typeof value !== 'object' && typeof value !== 'function')) return false;
  return Object.prototype.toString.call(value) === '[object RegExp]';
};`],
  ['safe-regex-test', `module.exports = (r) => {
  if (
    !r
    || (typeof r !== 'object' && typeof r !== 'function')
    || Object.prototype.toString.call(r) !== '[object RegExp]'
  ) {
    throw new TypeError('\`regex\` must be a RegExp');
  }
  return (s) => RegExp.prototype.exec.call(r, s) !== null;
};`],
  ['safe-array-concat', `const empty = [];
empty[Symbol.isConcatSpreadable] = true;
module.exports = (...args) => {
  for (let i = 0, l = args.length; i < l; i += 1) {
    const arg = args[i];
    if (arg && typeof arg === 'object' && typeof arg[Symbol.isConcatSpreadable] === 'boolean') {
      const arr = Array.isArray(arg) ? Array.prototype.slice.call(arg) : [arg];
      arr[Symbol.isConcatSpreadable] = true;
      args[i] = arr;
    }
  }
  return Array.prototype.concat.apply(empty, args);
};`],
  ['asynciterator.prototype', `/* globals AsyncIterator */
const asyncIterProto = typeof AsyncIterator === 'function' ? AsyncIterator.prototype : {};
if (!(Symbol.iterator in asyncIterProto)) {
  asyncIterProto[Symbol.iterator] = function () { return this; };
}
module.exports = asyncIterProto;`],
  ['is-weakref', `/* globals WeakRef: false */
module.exports = (value) => {
  if (typeof WeakRef === 'undefined') return false;
  if (!value || typeof value !== 'object') return false;
  try {
    WeakRef.prototype.deref.call(value);
    return true;
  } catch (e) {
    return false;
  }
};`],
  ['is-symbol', `module.exports = (value) => {
  if (typeof value === 'symbol') return true;
  if (Object.prototype.toString.call(value) !== '[object Symbol]') return false;
  try {
    if (typeof value.valueOf() !== 'symbol') return false;
    return Symbol.prototype.toString.call(value).startsWith('Symbol(');
  } catch (e) {
    return false;
  }
};`],
  ['is-string', `module.exports = (value) => {
  if (typeof value === 'string') return true;
  if (typeof value !== 'object') return false;
  try {
    String.prototype.valueOf.call(value);
    return true;
  } catch (e) { return false; }
};`],
  ['is-date-object', `module.exports = (value) => {
  if (typeof value !== 'object' || value === null) return false;
  try {
    Date.prototype.getDay.call(value);
    return true;
  } catch (e) {
    return false;
  }
};`],
  ['es-set-tostringtag', `module.exports = (object, value, options = {}) => {
  if (options.force || !Object.prototype.hasOwnProperty.call(object, Symbol.toStringTag)) {
    Object.defineProperty(object, Symbol.toStringTag, {
      configurable: true,
      enumerable: false,
      value,
      writable: false
    });
  }
};`],
  ['define-properties', 'module.exports = require(\'@nolyfill/shared\').defineProperties', { '@nolyfill/shared': 'workspace:*' }],
  ['deep-equal', 'module.exports = (foo, bar) => require(\'dequal\').dequal(foo, bar)', { dequal: '2.0.3' }],
  ['is-arguments', `const isStandardArguments = (value) => ((value && typeof value === 'object' && Symbol.toStringTag in value)
  ? false
  : Object.prototype.toString.call(value) === '[object Arguments]');
const isLegacyArguments = (value) => (isStandardArguments(value)
  ? true
  : (
    value !== null
    && typeof value === 'object'
    && typeof value.length === 'number'
    && value.length >= 0
    && Object.prototype.toString.call(value) !== '[object Array]'
    && Object.prototype.toString.call(value.callee) === '[object Function]')
);
// isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests
// eslint-disable-next-line prefer-rest-params -- detect arguments object
module.exports = (function () { return isStandardArguments(arguments); }()) ? isStandardArguments : isLegacyArguments`],
  ['is-generator-function', `const isFnRegex = /^\\s*(?:function)?\\*/;
// Node.js has full native support for generators since Node.js 6.4.0, so we don't need eval
const GeneratorFunction = Object.getPrototypeOf(function* () {});
module.exports = function isGeneratorFunction(fn) {
  if (typeof fn !== 'function') return false;
  if (isFnRegex.test(Function.prototype.toString.call(fn))) return true;
  return Object.getPrototypeOf(fn) === GeneratorFunction;
};`],
  // ['is-negative-zero', 'module.exports = (n) => n === 0 && (1 / n) === -Infinity;'],
  ['side-channel', `module.exports = () => {
  let $wm, $m;

  const get = (key) => {
    if (key && (typeof key === 'object' || typeof key === 'function')) {
      if ($wm) return $wm.get(key);
    } else if ($m) {
      return $m.get(key);
    }
    return undefined;
  };
  const set = (key, value) => {
    if (key && (typeof key === 'object' || typeof key === 'function')) {
      if (!$wm) $wm = new WeakMap();
      $wm.set(key, value);
    } else {
      if (!$m) $m = new Map();
      $m.set(key, value);
    }
  };
  const has = (key) => {
    if (key && (typeof key === 'object' || typeof key === 'function')) {
      if ($wm) {
        return $wm.has(key);
      }
    } else if ($m) {
      return $m.has(key);
    }
    return false;
  };
  const assert = (key) => {
    if (!has(key)) {
      throw new TypeError('Side channel does not contain the given key');
    }
  };
  return { get, set, has, assert };
};`],
  ['internal-slot', `const channel = new WeakMap();
const check = (O, slot) => {
  if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
    throw new TypeError('\`O\` is not an object');
  }
  if (typeof slot !== 'string') {
    throw new TypeError('\`slot\` must be a string');
  }
};
const has = (O, slot) => {
  check(O, slot);
  const slots = channel.get(O);
  return !!slots && Object.prototype.hasOwnProperty.call(slots, \`$\${slot}\`);
};
const get = (O, slot) => {
  check(O, slot);
  const slots = channel.get(O);
  return slots && slots[\`$\${slot}\`];
};
const set = (O, slot, V) => {
  check(O, slot);
  let slots = channel.get(O);
  if (!slots) {
    slots = {};
    channel.set(O, slots);
  }
  slots[\`$\${slot}\`] = V;
};
const assert = (O, slot) => {
  check(O, slot);
  if (!channel.has(O)) {
    throw new TypeError('Side channel does not contain the given key');
  }
  if (!has(O, slot)) {
    throw new TypeError(\`\\\`\${slot}\\\` is not present on \\\`O\\\`\`);
  }
};
module.exports = Object.freeze({ has, get, set, assert });`]
]);

const manualPackagesList = /** @type {const} */ ([
  'function-bind', // function-bind's main entry point is not uncurried, and doesn't follow es-shim API
  'has-tostringtag', // two entries (index.js, shams.js)
  'has-symbols', // two entries (index.js, shams.js)
  'es-iterator-helpers', // use rollup prebundle approach
  'globalthis' // globalthis package's entrypoint is a function, not the implementation
]);

const nonNolyfillPackagesList = /** @type {const} */ ([
  'nolyfill',
  '@nolyfill/shared'
]);

(async () => {
  const allPackagesList = [
    ...manualPackagesList,
    ...autoGeneratedPackagesList.map(pkg => pkg[0]),
    ...singleFilePackagesList.map(pkg => pkg[0])
  ].sort();

  const newPackageJson = {
    ...currentPackageJson,
    overrides: allPackagesList
      .reduce((acc, packageName) => {
        acc[packageName] = `npm:@nolyfill/${packageName}@latest`;
        return acc;
      }, /** @type {Record<typeof allPackagesList[number], string>} */({})),
    pnpm: {
      ...currentPackageJson.pnpm,
      overrides: allPackagesList
        .reduce((acc, packageName) => {
          acc[packageName] = `workspace:@nolyfill/${packageName}@*`;
          return acc;
        }, /** @type {Record<typeof allPackagesList[number], string>} */({}))
    }
  };

  const cliAllPackagesTs = `/* Generated by create.cjs */
/* eslint-disable */
export const allPackages = ${JSON.stringify(allPackagesList, null, 2)};\n`;

  await Promise.all([
    ...autoGeneratedPackagesList.map(pkg => createEsShimLikePackage(pkg[0], pkg[1], pkg[2], pkg[3], pkg[4], pkg[5])),
    ...singleFilePackagesList.map(pkg => createSingleFilePackage(pkg[0], pkg[1], pkg[2])),
    compareAndWriteFile(
      path.join(__dirname, 'package.json'),
      `${JSON.stringify(newPackageJson, null, 2)}\n`
    ),
    compareAndWriteFile(
      path.join(__dirname, 'packages', 'cli', 'src', 'all-packages.ts'),
      cliAllPackagesTs
    ),
    compareAndWriteFile(
      path.join(__dirname, 'DOWNLOAD_STATS.md'),
      generateDonwloadStats()
    )
  ]);

  await ezspawn.async('pnpm', ['i']);
})();

/**
 * @param {string} packageName
 * @param {string} packageImplementation
 * @param {boolean} isStatic
 * @param {Record<string, string>} [extraDependencies]
 * @param {string} [minimumNodeVersion]
 * @param {string | null} [bindTo]
 */
async function createEsShimLikePackage(packageName, packageImplementation, isStatic, extraDependencies = {}, minimumNodeVersion = '>=12.4.0', bindTo = null) {
  const packagePath = path.join(__dirname, 'packages', packageName);
  await fsPromises.mkdir(
    packagePath,
    { recursive: true }
  );

  await Promise.all([
    compareAndWriteFile(
      path.join(packagePath, 'implementation.js'),
      `'use strict';\nmodule.exports = ${packageImplementation};\n`
    ),
    compareAndWriteFile(
      path.join(packagePath, 'polyfill.js'),
      `'use strict';\nmodule.exports = () => ${packageImplementation};\n`
    ),
    compareAndWriteFile(
      path.join(packagePath, 'shim.js'),
      `'use strict';\nmodule.exports = () => ${packageImplementation};\n`
    ),
    compareAndWriteFile(
      path.join(packagePath, 'auto.js'),
      '\'use strict\';\n/* noop */\n'
    ),
    compareAndWriteFile(
      path.join(packagePath, 'index.js'),
      [
        '\'use strict\';',
        isStatic
          ? 'const { makeEsShim } = require(\'@nolyfill/shared\');'
          : 'const { uncurryThis, makeEsShim } = require(\'@nolyfill/shared\');',
        `const impl = ${packageImplementation};`,
        isStatic
          ? `const bound = ${bindTo ? `impl.bind(${bindTo})` : 'impl'};`
          : `const bound = ${bindTo ? `uncurryThis(impl).bind(${bindTo})` : 'uncurryThis(impl)'};`,
        'makeEsShim(bound, impl);',
        'module.exports = bound;',
        ''
      ].join('\n')
    ),
    compareAndWriteFile(
      path.join(packagePath, 'package.json'),
      `${JSON.stringify({
        name: `@nolyfill/${packageName}`,
        version: currentPackageJson.version,
        repository: {
          type: 'git',
          url: 'https://github.com/SukkaW/nolyfill',
          directory: `packages/${packageName}`
        },
        main: './index.js',
        license: 'MIT',
        files: ['*.js'],
        scripts: {},
        dependencies: {
          '@nolyfill/shared': 'workspace:*',
          ...extraDependencies
        },
        engines: {
          node: minimumNodeVersion
        }
      }, null, 2)}\n`
    )
  ]);

  console.log(`[${packageName}] created`);
}

/**
 * @param {string} packageName
 * @param {string} implementation
 * @param {Record<string, string>} [extraDependencies]
 * @param {string} [minimumNodeVersion]
 */
async function createSingleFilePackage(packageName, implementation, extraDependencies = {}, minimumNodeVersion = '>=12.4.0') {
  const packagePath = path.join(__dirname, 'packages', packageName);
  await fsPromises.mkdir(
    packagePath,
    { recursive: true }
  );

  await Promise.all([
    compareAndWriteFile(
      path.join(packagePath, 'index.js'),
      `'use strict';\n${implementation}\n`
    ),
    compareAndWriteFile(
      path.join(packagePath, 'package.json'),
      `${JSON.stringify({
        name: `@nolyfill/${packageName}`,
        version: currentPackageJson.version,
        repository: {
          type: 'git',
          url: 'https://github.com/SukkaW/nolyfill',
          directory: `packages/${packageName}`
        },
        main: './index.js',
        license: 'MIT',
        files: ['*.js'],
        scripts: {},
        dependencies: extraDependencies,
        engines: {
          node: minimumNodeVersion
        }
      }, null, 2)}\n`
    )
  ]);

  console.log(`[${packageName}] created`);
}

function generateDonwloadStats() {
  const pkgList = [
    ...autoGeneratedPackagesList.map(pkg => `@nolyfill/${pkg[0]}`),
    ...singleFilePackagesList.map(pkg => `@nolyfill/${pkg[0]}`),
    ...manualPackagesList.map(pkg => `@nolyfill/${pkg}`)
  ].sort();
  pkgList.unshift(...nonNolyfillPackagesList);

  return '| name | download |\n| ---- | -------- |\n'.concat(
    pkgList.map(
      pkg => `| \`${pkg}\` | [![npm](https://img.shields.io/npm/dt/${pkg}.svg?style=flat-square&logo=npm&logoColor=white&label=total%20downloads&color=333)](https://www.npmjs.com/package/${pkg}) |`
    ).join('\n')
  );
}
