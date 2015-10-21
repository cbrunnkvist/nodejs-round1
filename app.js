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

function mapOrderToPaymentRequest(order) {
  var paymentRequest = {
    payment: {
      amount: order['transaction-amount'],
      currency: order['transaction-currency'],
    },
    card: {
      holder: order['cc-name'],
      number: order['cc-number'],
      expireDate: new Date(parseInt(order['cc-exp'].year), parseInt(order['cc-exp'].month)),
      cvv: order['cc-csc']
    }
  };
  return paymentRequest;
}

var actions = {
  payment: function(request, reply) {
    var paymentRequest = mapOrderToPaymentRequest(request.payload);
    pg.processPayment(paymentRequest, function(err, result) {
      if (err) {
        console.dir(err, {
          depth: 4
        });
        return reply(Boom.badRequest((err.paymentGatewayError || err)));
      } else {
        return reply(result);
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
