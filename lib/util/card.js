'use strict';

module.exports = {
  AMEX_SAMPLE: '3782 8224 6310 005',
  DISCOVER_SAMPLE: '6011 1111 1111 1117',
  MASTERCARD_SAMPLE: '5555 5555 5555 4444',
  VISA_SAMPLE: '4111 1111 1111 1111',
  numberToType: function(number) {
    var CARDTYPES = [{
        name: 'visa',
        pattern: /^4[0-9]{12}(?:[0-9]{3})?$/
      }, {
        name: 'mastercard',
        pattern: /^5[1-5][0-9]{14}$/
      }, {
        name: 'amex',
        pattern: /^3[47][0-9]{13}$/
      }, {
        name: 'discover',
        pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/
      }
    ];
    var found;
    for (var i = 0; i < CARDTYPES.length; i++) {
      if (number.replace(/\D*/g, '').match(CARDTYPES[i].pattern)){
        found = CARDTYPES[i].name;
        break;
      }
    }
    return found;
  },
  splitOnFirstSpace: function(name) {
    return [
      name.split(' ').slice(0, 1).shift(),
      name.split(' ').slice(1).join(' ')
    ];
  }
};
