interface SetToStringTagOption {
  force?: boolean
}

const set = (object: any, value: any, options: SetToStringTagOption = {}) => {
  if (options.force || !Object.prototype.hasOwnProperty.call(object, Symbol.toStringTag)) {
    Object.defineProperty(object, Symbol.toStringTag, {
      configurable: true,
      enumerable: false,
      value,
      writable: false
    });
  }
};

export default set;
