'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Hapi = require('hapi');

lab.describe('end-to-end providers integration', {timeout: 60000}, function() {
  var AMEX_CARD = '3714 4963 5398 431';
  var VISA_CARD = '4111 1111 1111 1111';

  var server;
  var expDate;

  lab.before(function(done) {
    server = new Hapi.Server();
    server.connection();
    server.register(require('../../app'), function(err) {
      if (err) throw err;
    });
    expDate = new Date((new Date()).getUTCFullYear() + 1, 12);
    done();
  });

  function postingFormShouldPass(formData, done) {
    server.inject({
      method: 'POST',
      url: '/payment',
      payload: formData,
    }, function(response) {
      expect(response.result.error).to.not.exist();
      expect(response.statusCode).to.equal(200);
      done();
    });
  }

  lab.it('can process a sandbox payment against PayPal', function(done) {
    var formData = {
      'transaction-amount': 1,
      'transaction-currency': 'USD',
      'order-name': 'Order Name',
      'cc-name': 'Cc Name',
      'cc-number': AMEX_CARD,
      'cc-exp': {
        year: expDate.getUTCFullYear(),
        month: 12
      },
      'cc-csc': '000'
    };
    postingFormShouldPass(formData, done);
  });

  lab.it('can process a sandbox payment against Braintree', function(done) {
    var formData = {
      'transaction-amount': 300,
      'transaction-currency': 'THB',
      'order-name': 'Order Name',
      'cc-name': 'Cc Name',
      'cc-number': VISA_CARD,
      'cc-exp': {
        year: expDate.getUTCFullYear(),
        month: 12
      },
      'cc-csc': '000'
    };
    postingFormShouldPass(formData, done);
  });

});
