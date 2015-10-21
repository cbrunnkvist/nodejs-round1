'use strict';

exports.id = 'braintree';
exports.name = 'Braintree';

var CONSOLE_TRACE=false;
var Fs = require('fs');
var Path = require('path');

var braintree = require('braintree');
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

function numberToCardType(number) {
  return 'visa';
}

function splitOnFirstSpace(name) {
  return [
    name.split(' ').slice(0, 1).shift(),
    name.split(' ').slice(1).join(' ')
  ];
}

function checkEnvOrThrow(key) {
  if (!process.env[key]) {
    throw new Error(key + ' missing from environment');
  }
}

function mapPaymentRequest(data) {
  var paymentRequest = {
    'creditCard': {
      'number': String(data.card.number),
      'expirationMonth': String(1 + data.card.expireDate.getUTCMonth()),
      'expirationYear': String(data.card.expireDate.getUTCFullYear()),
      'cvv': String(data.card.cvv),
      'cardholderName': data.card.holder
    },
    'amount': data.payment.amount,
    'merchantAccountId': data.payment.currency
  };
  return paymentRequest;
}

exports.submitRequest = function(data, callback) {
  checkEnvOrThrow('BRAINTREE_MERCHANT_ID');
  checkEnvOrThrow('BRAINTREE_PUBLIC_KEY');
  checkEnvOrThrow('BRAINTREE_PRIVATE_KEY');

  var saleParams = mapPaymentRequest(data);
  CONSOLE_TRACE && console.log('paypal.submitRequest()', JSON.stringify(saleParams));
  gateway.transaction.sale(saleParams, function(error, result) {
    CONSOLE_TRACE && console.dir(error);
    if(error) {
      error.paymentGatewayError = error;
      callback(error, {
        processor: 'braintree',
        requestData: data
      });
    } else {
      error = (result.success ? null : {paymentGatewayError: result.message});
      CONSOLE_TRACE && console.log('braintree.submitRequest()', result);
      callback(error, {
        txId: result.id,
        state: result.status,
        processor: 'braintree',
        requestData: data
      });
    }
  });
};
