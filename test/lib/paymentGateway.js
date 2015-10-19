'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;

lab.describe('payment gateway library', function() {
  var expDate = new Date();
  expDate.setDate(expDate.getDate() + 1);
  var sampleRequest = {
    payment: {
      amount: 111,
      currency: 'THB',
    },
    card: {
      holder: 'A Full Name',
      number: '4111 1111 1111 1111',
      expireDate: expDate,
      ccv: '000'
    }
  };

  var pg;
  lab.beforeEach(function(done) {
    var PaymentGateway = require('../../lib/paymentGateway');
    pg = new PaymentGateway();
    done();
  });

  lab.it('comes with built-in payment providers', function(done) {
    var providerIds = Object.keys(pg.getProviders());
    expect(providerIds).to.include(['paypal']);

    done();
  });

  lab.it('can process single credit card payments', function(done) {
    pg._providers = [{
      id: 'braintree',
      name: 'Braintree',
      submitRequest: function(data, callback) {
        callback(null, {
          txId: '12345678',
          requestData: data
        });
      }
    }];

    pg.processPayment(sampleRequest, function(err, result) {
      expect(result.txId).to.exist();
      expect(result.requestData.payment).to.equal(sampleRequest.payment);
      done();
    });
  });

});
