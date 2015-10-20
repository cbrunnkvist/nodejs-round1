'use strict';

exports.id = 'paypal';
exports.name = 'PayPal';

var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': (process.env.NODE_ENV == 'production' ? 'live' : 'sandbox'),
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
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
    'intent': 'sale',
    'payer': {
      'payment_method': 'credit_card',
      'funding_instruments': [{
        'credit_card': {
          'type': numberToCardType(data.card.number),
          'number': data.card.number,
          'expire_month': String(1 + data.card.expireDate.getUTCMonth()),
          'expire_year': String(data.card.expireDate.getUTCFullYear()),
          'cvv2': data.card.cvv,
          'first_name': splitOnFirstSpace(data.card.holder)[0],
          'last_name': splitOnFirstSpace(data.card.holder)[1],
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
  checkEnvOrThrow('PAYPAL_CLIENT_ID');
  checkEnvOrThrow('PAYPAL_CLIENT_SECRET');

  var create_payment_json = mapPaymentRequest(data);
  console.log('paypal.submitRequest()', JSON.stringify(create_payment_json));

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      error.paymentGatewayError = error.response.details[0].issue;
      callback(error, {
        processor: 'paypal',
        requestData: data
      });
    } else {
      console.log('paypal.payment.create()', payment);
      callback(error, {
        txId: payment.id,
        state: payment.state,
        processor: 'paypal',
        requestData: data
      });
    }
  });
};
