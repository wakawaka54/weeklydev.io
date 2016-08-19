var _exports = module.exports = {};

_exports.randomWhole = function(min, max) {
  return Math.round(Math.random() * (max - min) + min);
};
