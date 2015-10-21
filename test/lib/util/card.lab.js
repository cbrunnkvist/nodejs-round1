'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var CardUtil = require('../../../lib/util/card');

lab.describe('CardUtil.numberToType()', function () {
  lab.it('can identify a VISA number', function (done) {
    expect(CardUtil.numberToType(CardUtil.VISA_SAMPLE)).to.equal('visa');
    done();
  })

  lab.it('can identify a MasterCard number', function (done) {
    expect(CardUtil.numberToType(CardUtil.MASTERCARD_SAMPLE)).to.equal('mastercard');
    done();
  })

  lab.it('can identify an American Express number', function (done) {
    expect(CardUtil.numberToType(CardUtil.AMEX_SAMPLE)).to.equal('amex');
    done();
  })

  lab.it('can identify a Discover number', function (done) {
    expect(CardUtil.numberToType(CardUtil.DISCOVER_SAMPLE)).to.equal('discover');
    done();
  })
});
