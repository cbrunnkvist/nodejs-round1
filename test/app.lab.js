'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Hapi = require('hapi');
var PaymentGateway = require('../lib/PaymentGateway');

lab.describe('web app', function() {
  var server;
  var pg;

  lab.beforeEach(function(done) {
    server = new Hapi.Server();
    server.connection();

    pg = new PaymentGateway();
    server.register({
      register: require('../app'),
      options: {
        paymentGateway: pg
      }
    }, function(err) {
      if (err) throw err;
    });
    done();
  });

  lab.it('serves the order form', function(done) {
    server.inject({
      method: 'GET',
      url: '/'
    }, function(response) {
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.include(['submit']);
      done();
    });
  });

  lab.it('applies parameter validation for the payment endpoint', function(done) {
    server.inject({
      method: 'POST',
      url: '/payment',
      payload: {},
    }, function(response) {
      expect(response.statusCode).to.equal(400);
      expect(response.result.message).to.contain('required');
      done();
    });
  });

  lab.it('sanitizes form data and maps it to a payment request', function(done) {
    var requestSpy;
    pg._providers = {
      paypal: {
        submitRequest: function(data, callback) {
          requestSpy = data;
          callback(new Error('aborted'));
        }
      }
    };

    var expDate = new Date((new Date()).getUTCFullYear() + 1, 12);
    var formData = {
      'transaction-amount': 1,
      'transaction-currency': 'USD',
      'order-name': 'order-name',
      'cc-name': 'cc-name',
      'cc-number': ' 1111 1111-1111 1111 ',
      'cc-exp': {
        year: 9999,
        month: 12
      },
      'cc-csc': '000'
    };

    server.inject({
      method: 'POST',
      url: '/payment',
      payload: formData,
    }, function(response) {
      expect(requestSpy.card.number).to.equal('1111111111111111');
      done();
    });
  });

});
