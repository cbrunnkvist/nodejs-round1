'use strict';

function Database() {
  this.table = [];
}

Database.prototype.save = function(object){
  var enc = JSON.stringify(object);
  this.table.push(enc);
  console.log('Database.save()', enc);
};

exports.connection = function() {
  return new Database();
}
