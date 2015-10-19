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
    return items.map(function(p){return p.id});
  }

  it('comes with built-in payment providers', function(done) {
    var PaymentGateway = require('../../lib/paymentGateway');
    var pg = new PaymentGateway();

    var providerIds = pluckIds(pg.getProviders());
    expect(providerIds).to.include(['paypal']);

    done();
  });

  it('supports adding additional payment providers', function(done) {
    var PaymentGateway = require('../../lib/paymentGateway');
    var pg = new PaymentGateway();

    var builtInIds = pluckIds(pg.getProviders());
    var ProviderOne = {
      id: 'provider1',
      name: 'Provider 1'
    };
    var ProviderTwo = {
      id: 'provider2',
      name: 'Provider 2'
    };

    pg.addProvider(ProviderOne);
    pg.addProvider(ProviderTwo);

    var providerIds = pluckIds(pg.getProviders());
    expect(providerIds).to.include([ProviderOne.id, ProviderTwo.id]);
    expect(providerIds).to.include(builtInIds);
    done();
  });

  it('can process single credit card payments');

});
