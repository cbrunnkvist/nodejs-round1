'use strict';

var Fs = require('fs');
var Path = require('path');

function PaymentGateway() {
  this._providers = discoverProviders();
}

PaymentGateway.prototype.getProviders = function() {
  return this._providers;
}

PaymentGateway.prototype.processPayment = function(request, next) {
  var error;
  var result;

  var provider = this._providers[Object.keys(this._providers)[0]];

  provider.submitRequest(request, next);
}

function discoverProviders() {
  var findings = {};
  var providersPath = Path.join(__dirname, 'providers');

  var entries = Fs.readdirSync(providersPath);
    for (var i = 0; i < entries.length; i++) {
      var provider = require(Path.join(providersPath, entries[i]));
      findings[provider.id] = provider;
    }
    return findings;
}

module.exports = PaymentGateway;
