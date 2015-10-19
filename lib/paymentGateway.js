'use strict';

var Fs = require('fs');
var Path = require('path');

function PaymentGateway() {
  this._providers = discoverProviders();
}

PaymentGateway.prototype.addProvider = function(provider) {
  this._providers.push(provider);
}

PaymentGateway.prototype.getProviders = function() {
  return this._providers;
}

PaymentGateway.prototype.processPayment = function(request, next) {
  var error;
  var result;

  result = {
    refId: -1
  };

  next(error, result);
}

function discoverProviders() {
  var findings = [];
  var providersPath = Path.join(__dirname, 'providers');

  var entries = Fs.readdirSync(providersPath);
    for (var i = 0; i < entries.length; i++) {
      var provider = require(Path.join(providersPath, entries[i]));
      findings.push(provider);
    }
    return findings;
}

module.exports = PaymentGateway;
