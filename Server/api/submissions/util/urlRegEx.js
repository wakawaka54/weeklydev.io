'use strict';

module.exports = (domains, tld) => {
  let validUrl = '';
  for (let i = domains.length - 1; i >= 0; i--) {
    if (i !== 0) {
      validUrl = validUrl + '|';
    }
    validUrl = validUrl + '(' + domains[i] + ')';
  }

  var validTLD = '';
  for (let x = tld.length - 1; x >= 0; x--) {
    if (x !== 0) {
      validTLD = validTLD + '|';
    }
    validTLD = validTLD + '(' + tld[x] + ')';
  }

  var reg = new RegExp(
    '^' +
    '(?:(http)(s)?(\:\/\/))' +
    '(?:' + validUrl + ')' +
    '\.(?:' + validTLD + ')(?:\/)' +
    '(?:[-a-zA-Z0-9:%_\+.~#?&//=]*)?' +
    '$', 'i'
  );
  return reg;
};
