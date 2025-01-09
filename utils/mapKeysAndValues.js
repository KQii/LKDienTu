const mapKeysAndValues = (obj, keyMap) => {
  const newObj = {};

  for (const [key, value] of Object.entries(obj)) {
    let newKey = key;
    let newValue = value;

    // Rename keys
    if (keyMap[key]) {
      newKey = keyMap[key];
    }

    // Rename values
    if (typeof value === 'string') {
      newValue = value
        .split(',')
        .map(val => keyMap[val] || val)
        .join(',');
    } else if (Array.isArray(value)) {
      newValue = value.map(val => keyMap[val] || val);
    } else if (typeof value === 'object' && value !== null) {
      newValue = mapKeysAndValues(value, keyMap);
    }

    newObj[newKey] = newValue;
  }

  return newObj;
};

module.exports = mapKeysAndValues;
