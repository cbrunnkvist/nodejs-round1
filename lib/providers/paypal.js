exports.id = 'paypal';
exports.name = 'PayPal';

exports.submitRequest = function(data, callback) {
  callback(null, {
    txId: '12345678',
    processor: 'paypal',
    requestData: data
  })
};
