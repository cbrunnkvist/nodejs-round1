'use strict';

var Fs = require('fs');
var Path = require('path');
var CardUtil = require('./util/card');

function PaymentGateway() {
  this._providers = discoverProviders();
}

function guardAgainstInvalidRequests(request) {
  if (isAmex(request.card.number) && "USD" !== request.payment.currency) {
    return new Error('American Express cards can only be charged in USD!');
  }
}

function isAmex(n) {
  return 'amex' === CardUtil.numberToType(n);
}

function isPaypalCurrency(currency) {
  return (['USD', 'EUR', 'AUD'].indexOf(currency) >= 0)
}

PaymentGateway.prototype.pickProviderForRequest = function(request) {
  if (isAmex(request.card.number) || isPaypalCurrency(request.payment.currency)) {
    return this._providers.paypal;
  } else {
    return this._providers.braintree;
  }
}

PaymentGateway.prototype.getProviders = function() {
  return this._providers;
}

PaymentGateway.prototype.processPayment = function(request, next) {
  var err = guardAgainstInvalidRequests(request);
  if (err) {
    return next(err,{});
  }

  var provider = this.pickProviderForRequest(request);
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
