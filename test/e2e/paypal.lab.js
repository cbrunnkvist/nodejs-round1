'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Hapi = require('hapi');

lab.describe('end-to-end providers integration', function() {
  var server;

  lab.before(function(done) {
    server = new Hapi.Server();
    server.connection();
    server.register(require('../../app'), function(err) {
      if (err) throw err;
    });
    done();
  });

  lab.it('can process a sandbox payment against PayPal');
  
  lab.it('can process a sandbox payment against Braintree');

});
