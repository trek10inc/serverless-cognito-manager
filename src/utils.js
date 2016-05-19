'use strict';

const _ = require('lodash');

function populateValues (object, map) {
  if (!map) {
    map = {};
  }
  return _.mapValues(object, value => {
    if (typeof value === 'string') {
      _.forIn(map, function (v, k) {
        value = value.replace(new RegExp(k, 'g'), v);
      });
      return value;
    } else if (Array.isArray(value)) {
      return _.map(value, item => {
        if (typeof item === 'object') {
          return populateValues(item, map);
        } else if (typeof item === 'string') {
          _.forIn(map, function (v, k) {
            item = item.replace(new RegExp(k, 'g'), v);
          });
          return item;
        } else {
          return item;
        }
      });
    } else if (typeof value === 'object') {
      return populateValues(value, map);
    } else {
      return value;
    }
  });
}

function populateTemplate (object, map) {
  if (!map) {
    map = {};
  }
  map = mapKeysRegExp(map);
  return populateValues(object, map);
}

function mapKeysRegExp (object) {
  return _.mapKeys(object, (v, k) => {
    if (/^\$\{.*\}$/.test(k)) {
      return _.escapeRegExp(k);
    } else {
      return _.escapeRegExp('${' + k + '}');
    }
  });
}

module.exports = { populateTemplate, populateValues, mapKeysRegExp };
