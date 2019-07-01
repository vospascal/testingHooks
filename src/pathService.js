/*eslint-disable */
function hasOwnProperty(obj, prop) {
  if (obj == null) {
    return false;
  }
  // to handle objects with null prototypes (too edge case?)
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function toString(type) {
  return Object.prototype.toString.call(type);
}

function getKey(key) {
  const intKey = parseInt(key);
  if (intKey.toString() === key) {
    return intKey;
  }
  return key;
}


const options = { includeInheritedProps: true };

const objectPath = function (obj) {
  return Object.keys(objectPath).reduce((proxy, prop) => {
    if (prop === 'create') {
      return proxy;
    }

    /* istanbul ignore else*/
    if (typeof objectPath[prop] === 'function') {
      proxy[prop] = objectPath[prop].bind(objectPath, obj);
    }

    return proxy;
  }, {});
};

function hasShallowProperty(obj, prop) {
  return (options.includeInheritedProps || (typeof prop === 'number' && Array.isArray(obj)) || hasOwnProperty(obj, prop));
}

function getShallowProperty(obj, prop) {
  if (hasShallowProperty(obj, prop)) {
    return obj[prop];
  }
}

export function deepPreventExtensions(obj) {
  var propNames = Object.getOwnPropertyNames(obj);
  propNames.forEach(function(name) {
    var prop = obj[name];
    if (typeof prop === 'object' && prop !== null) deepPreventExtensions(prop);
  });

  return Object.preventExtensions(obj);
}

export function setPath(obj, path, value, doNotReplace, isNotExtendable) {
  try {
    if (typeof path === 'number') {
      path = [path];
    }

    if(isNotExtendable === true){
        deepPreventExtensions(obj);
    }

    if (!path || path.length === 0) {
      return obj;
    }

    if (typeof path === 'string') {
      return setPath(obj, path.split('.').map(getKey), value, doNotReplace);
    }

    const currentPath = path[0];
    const currentValue = getShallowProperty(obj, currentPath);
    if (path.length === 1) {
      if (currentValue === void 0 || !doNotReplace) {
        obj[currentPath] = value;
      }
      return currentValue;
    }

    if (currentValue === void 0) {
      // check if we assume an array
      if (typeof path[1] === 'number') {
        obj[currentPath] = [];
      } else {
        obj[currentPath] = {};
      }
    }

    return setPath(obj[currentPath], path.slice(1), value, doNotReplace);
  } catch (e) {
    const isExtensible = Object.isExtensible(obj);
    if(!isExtensible){
      console.warn(`Error: ${path} object is not extensible`)
    }
  }
}

export function getPath(obj, path, defaultValue) {
  if (typeof path === 'number') {
    path = [path];
  }
  if (!path || path.length === 0) {
    return obj;
  }
  if (obj == null) {
    return defaultValue;
  }
  if (typeof path === 'string') {
    return getPath(obj, path.split('.'), defaultValue);
  }

  const currentPath = getKey(path[0]);
  const nextObj = getShallowProperty(obj, currentPath);
  if (nextObj === void 0) {
    return defaultValue;
  }

  if (path.length === 1) {
    return nextObj;
  }

  return getPath(obj[currentPath], path.slice(1), defaultValue);
}

export function toPath(obj, prefix) {
    let newObj = {};

    if ((!obj || typeof obj !== 'object') && !Array.isArray(obj)) {
      if (prefix) {
        newObj[prefix] = obj;
        return newObj;
      }
      return obj;
    }

    function isNumber(f) {
      return !isNaN(parseInt(f));
    }

    function isEmptyObj(obj) {
      for (const prop in obj) {
        if (Object.hasOwnProperty.call(obj, prop)) { return false; }
      }
    }

    function getFieldName(field, prefix, isRoot, isArrayItem, isArray) {
      if (isArray) { return (prefix || '') + (isNumber(field) ? `[${field}]` : (isRoot ? '' : '.') + field); } else if (isArrayItem) { return `${prefix || ''}[${field}]`; }
      return (prefix ? `${prefix}.` : '') + field;
    }

    return (function recurse(o, p, isRoot) {
      const isArrayItem = Array.isArray(o);
      for (const f in o) {
        const currentProp = o[f];
        if (currentProp && typeof currentProp === 'object') {
          if (Array.isArray(currentProp)) {
            newObj = recurse(currentProp, getFieldName(f, p, isRoot, false, true), isArrayItem); // array
          } else if (isArrayItem && isEmptyObj(currentProp) === false) {
            newObj = recurse(currentProp, getFieldName(f, p, isRoot, true)); // array item object
          } else if (isEmptyObj(currentProp) === false) {
            newObj = recurse(currentProp, getFieldName(f, p, isRoot)); // object
          } else {
            //
          }
        } else if (isArrayItem || isNumber(f)) {
          newObj[getFieldName(f, p, isRoot, true)] = currentProp; // array item primitive
        } else {
          newObj[getFieldName(f, p, isRoot)] = currentProp; // primitive
        }
      }

      return newObj;
    }(obj, prefix, true));
}

export function replacePathArrayBrackets(stringArg){
  return stringArg.replace(/\[/g, '.').replace(/\]/g, '');
}

export default {
  getPath,
  setPath,
  toPath,
  replacePathArrayBrackets,
};

/* eslint-enable */
