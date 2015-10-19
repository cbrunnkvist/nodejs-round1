'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

describe('payment gateway library', function() {
  function pluckIds(items) {
    return items.map(function(p) {
      return p.id
    });
  }

  it('comes with built-in payment providers', function(done) {
    var PaymentGateway = require('../../lib/paymentGateway');
    var pg = new PaymentGateway();

    var providerIds = pluckIds(pg.getProviders());
    expect(providerIds).to.include(['paypal']);

    done();
  });

  it('can process single credit card payments', function(done) {
    var PaymentGateway = require('../../lib/paymentGateway');
    var pg = new PaymentGateway();

    var expDate = new Date();
    expDate.setDate(expDate.getDate() + 1);

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

    pg.processPayment(sampleRequest, function(err, result) {
      expect(result.txId).to.exist();
      expect(result.requestData.payment).to.equal(sampleRequest.payment);
      done();
    });
  });

});
