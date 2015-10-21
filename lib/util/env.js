'use strict';

module.exports = {
  throwIfMissing: function() {
    for (var i = 0; i < arguments.length; i++) {
      var varName = arguments[i];
      if (!process.env[varName]) {
        throw new Error(varName + ' missing from environment');
      }
    }
  }
};
