'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;

lab.describe('payment gateway library', function() {
  var pg;
  var request;

  lab.beforeEach(function(done) {
    var PaymentGateway = require('../../lib/paymentGateway');
    pg = new PaymentGateway();

    done();
  });

  function createSampleRequest() {
    var expDate = new Date();
    expDate.setDate(expDate.getDate() + 1);
    return {
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
  }

  function createProviderDoubles() {
    var providers = {
      paypal: {
        submitRequest: function(data, callback) {
          callback(null, {
            txId: '12345678',
            processor: 'paypal',
            requestData: data
          });
        }
      },
      braintree: {
        submitRequest: function(data, callback) {
          callback(null, {
            txId: '12345678',
            processor: 'braintree',
            requestData: data
          });
        }
      }
    };
    return providers;
  }

  lab.it('comes with built-in payment providers', function(done) {
    var providerIds = Object.keys(pg.getProviders());
    expect(providerIds).to.include(['paypal']);
    done();
  });

  lab.it('can process single credit card payments', function(done) {
    pg._providers = createProviderDoubles();
    var request = createSampleRequest();
    request.payment.currency='SEK';
    pg.processPayment(request, function(err, result) {
      expect(result.txId).to.exist();
      expect(result.requestData.payment).to.equal(request.payment);
      done();
    });
  });

  lab.it('uses Paypal if credit card type is AMEX', function(done) {
    pg._providers = createProviderDoubles();
    var request = createSampleRequest();

    request.card.number = '343456789012345';
    request.payment.currency = 'USD';

    pg.processPayment(request, function(err, result) {
      expect(result.processor).to.equal('paypal');
      done();
    });
  });

  lab.it('uses Paypal if currency is USD, EUR, or AUD', function(done) {
    pg._providers = createProviderDoubles();

    var testCurrencies = ['USD', 'EUR', 'AUD'];

    var CountdownLatch = function(count, allDone) {
      this.trigger = function() {
        count--;
        if (0 === count) {
          allDone();
        }
      };
    };
    var latch = new CountdownLatch(testCurrencies.length, done);

    testCurrencies.forEach(function(currency) {
      var request = createSampleRequest();
      request.payment.currency = currency;
      pg.processPayment(request, function(err, result) {
        expect(result.processor).to.equal('paypal');
        latch.trigger();
      });
    });
  });

  lab.it('uses Braintree if currency is _not_ USD, EUR, or AUD', function(done) {
    pg._providers = createProviderDoubles();
    var request = createSampleRequest();

    pg.processPayment(request, function(err, result) {
      expect(result.processor).to.equal('braintree');
      done();
    });
  });

  lab.it('throws an error if credit card is AMEX but currency is not USD');
});
