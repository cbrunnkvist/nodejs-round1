'use strict';

exports.id = 'paypal';
exports.name = 'PayPal';

var CONSOLE_TRACE = false;
var CardUtil = require('../util/card');
var EnvUtil = require('../util/env');
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': (process.env.NODE_ENV == 'production' ? 'live' : 'sandbox'),
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

function mapPaymentRequest(data) {
  var paymentRequest = {
    'intent': 'sale',
    'payer': {
      'payment_method': 'credit_card',
      'funding_instruments': [{
        'credit_card': {
          'type': CardUtil.numberToType(data.card.number),
          'number': data.card.number,
          'expire_month': String(1 + data.card.expireDate.getUTCMonth()),
          'expire_year': String(data.card.expireDate.getUTCFullYear()),
          'cvv2': data.card.cvv,
          'first_name': CardUtil.splitOnFirstSpace(data.card.holder)[0],
          'last_name': CardUtil.splitOnFirstSpace(data.card.holder)[1],
        }
      }]
    },
    'transactions': [{
      'amount': {
        'total': data.payment.amount,
        'currency': data.payment.currency,
      },
      'description': 'An order'
    }]
  };
  return paymentRequest;
}
exports.submitRequest = function(data, callback) {
  EnvUtil.throwIfMissing(
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET'
  );

  var create_payment_json = mapPaymentRequest(data);
  CONSOLE_TRACE && console.log('paypal.submitRequest()', JSON.stringify(create_payment_json));

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      if (error.response && error.response.details && error.response.details.length) {
        error.paymentGatewayError = error.response.details[0].issue;
      } else {
        error.paymentGatewayError = error.message;
      }
      callback(error, {
        processor: 'paypal',
        requestData: data
      });
    } else {
      CONSOLE_TRACE && console.log('paypal.payment.create()', payment);
      callback(error, {
        txId: payment.id,
        state: payment.state,
        processor: 'paypal',
        requestData: data
      });
    }
  });
};
