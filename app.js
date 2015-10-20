var PaymentGateway = require('./lib/paymentGateway');
var pg;
var Joi = require('joi');
var Boom = require('boom');
var Inert = require('inert');
var sprintf = require('util').format;

var ORDER_SCHEMA = {
  'transaction-amount': Joi.number().min(0.1).required(),
  'transaction-currency': Joi.string().regex(/^[A-Z]{3}$/).required(),
  'order-name': Joi.string().required(),
  'cc-name': Joi.string().required(),
  'cc-number': Joi.string().regex(/^[0-9 -]+$/).min(13).required().replace(/\D*/g, ''),
  'cc-exp': {
    year: Joi.number().min((new Date()).getUTCFullYear() - 1).required(),
    month: Joi.number().min(1).max(12).required()
  },
  'cc-csc': Joi.string().regex(/^[0-9]{3,4}$/).required()
};

var actions = {
  payment: function(request, reply) {
    var pl = request.payload;
    var paymentRequest = {
      payment: {
        amount: pl['transaction-amount'],
        currency: pl['transaction-currency'],
      },
      card: {
        holder: pl['cc-name'],
        number: pl['cc-number'],
        expireDate: new Date(parseInt(pl['cc-exp'].year), parseInt(pl['cc-exp'].month)),
        ccv: pl['cc-csc']
      }
    };

    pg.processPayment(paymentRequest, function(err, result) {
      if (err) {
        reply(Boom.badRequest(err.message));
      } else {
        reply(result);
      }
    });
  }
};

exports.register = function(server, options, next) {
  pg = (options.paymentGateway || new PaymentGateway());
  server.register(Inert, function(err) {
    if (err) throw err;
  });

  server.route([{
    method: 'GET',
    path: '/',
    config: {
      handler: {
        file: 'static/index.html'
      }
    }
  }, {
    method: 'POST',
    path: '/payment',
    config: {
      handler: actions.payment,
      validate: {
        payload: ORDER_SCHEMA
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
