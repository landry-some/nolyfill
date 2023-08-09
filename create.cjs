// @ts-check
'use strict';

const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const ezspawn = require('@jsdevtools/ez-spawn');

const currentPackageJson = require('./package.json');

const packagesList = /** @type {const} */ ([
  ['array-includes', 'Array.prototype.includes', false],
  ['array.prototype.findlastindex', 'Array.prototype.findLastIndex', false],
  ['array.prototype.flat', 'Array.prototype.flat', false],
  ['array.prototype.flatmap', 'Array.prototype.flatMap', false],
  ['arraybuffer.prorotype.slice', 'ArrayBuffer.prototype.slice', false],
  ['function.prototype.name', 'Function.prototype.name', false],
  ['has', 'Object.prototype.hasOwnProperty', false],
  ['object-keys', 'Object.keys', true],
  ['object.assign', 'Object.assign', true],
  ['object.entries', 'Object.entries', true],
  ['object.fromentries', 'Object.fromEntries', true],
  ['object.hasown', 'Object.prototype.hasOwnProperty', false],
  ['object.values', 'Object.values', true],
  ['string.prototype.trim', 'String.prototype.trim', false],
  ['string.prototype.trimend', 'String.prototype.trimEnd', false],
  ['string.prototype.trimstart', 'String.prototype.trimStart', false]
]);

(async () => {
  await Promise.all(
    packagesList.map(pkg => createPackage(pkg[0], pkg[1], pkg[2]))
  );

  const newPackageJson = {
    ...currentPackageJson,
    pnpm: {
      overrides: packagesList.reduce((acc, [packageName]) => {
        acc[packageName] = `workspace:@nolyfill/${packageName}@*`;
        return acc;
      }, /** @type {Record<string, string>} */({}))
    }
  };

  await compareAndWriteFile(
    path.join(__dirname, 'package.json'),
    `${JSON.stringify(newPackageJson, null, 2)}\n`
  );

  await ezspawn.async('pnpm', ['i']);
})();

/**
 * @param {string} path
 */
const fileExists = (path) => fsPromises.access(path, fs.constants.F_OK).then(() => true, () => false);
/**
 * If filePath doesn't exist, create new file with content.
 * If filePath already exists, compare content with existing file, only update the file when content changes.
 *
 * @param {string} filePath
 * @param {string} fileContent
 */
async function compareAndWriteFile(filePath, fileContent) {
  if (await fileExists(filePath)) {
    const existingContent = await fsPromises.readFile(filePath, { encoding: 'utf8' });
    if (existingContent !== fileContent) {
      await fsPromises.writeFile(filePath, fileContent, { encoding: 'utf-8' });
    }
  } else {
    await fsPromises.writeFile(filePath, fileContent, { encoding: 'utf-8' });
  }
}

/**
 * @param {string} packageName
 * @param {string} packageImplementation
 * @param {boolean} isStatic
 * @param {string} [minimumNodeVersion]
 */
async function createPackage(packageName, packageImplementation, isStatic, minimumNodeVersion = '>=12.4.0') {
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
      (isStatic
        ? `'use strict';\nconst impl = ${packageImplementation};\nmodule.exports = impl;\n`
        : `'use strict';\nconst { uncurryThis } = require('@nolyfill/shared');\nconst impl = ${packageImplementation};\nmodule.exports = uncurryThis(impl);\n`)
        .concat('module.exports.implementation = impl;\nmodule.exports.getPolyfill = () => impl;\nmodule.exports.shim = () => impl;\n')
    ),
    compareAndWriteFile(
      path.join(packagePath, 'package.json'),
      `${JSON.stringify({
        name: `@nolyfill/${packageName}`,
        version: currentPackageJson.version,
        main: './index.js',
        license: 'MIT',
        files: ['*.js'],
        scripts: {
          lint: 'eslint .'
        },
        dependencies: isStatic
          ? {}
          : {
            '@nolyfill/shared': 'workspace:*'
          },
        engines: {
          node: minimumNodeVersion
        }
      }, null, 2)}\n`
    )
  ]);

  console.log(`[${packageName}] created`);
}
