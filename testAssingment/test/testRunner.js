 /*
 * Tests
 *
 */
// Dependencies
var lib = require('../app/lib');
var assert = require('assert');

// Holder for Tests
var unit = {};

// Assert that the EvenNumber function is returning a number
unit['lib.EvenNumber should return a boolean'] = function(done){
  var val = lib.evenNumber(2);
  assert.strictEqual(typeof(val), 'boolean');
  done();
};

// Assert that the EvenNumber function is returning an even number
unit['lib.EvenNumber should return an even number'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(val, true);
  done();
};

// Assert that the EvenNumber function is returning 0
unit['lib.EvenNumber should return true'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(val, false);
  done();
};

// Assert that the oddNumber function is returning a number
unit['lib.oddNumber should return a boolean'] = function(done){
  var val = lib.oddNumber();
  assert.strictEqual(typeof(val), 'boolean');
  done();
};

// Assert that the oddNumber function is returning an odd number
unit['lib.oddNumber should return an odd number'] = function(done){
  var val = lib.oddNumber(5);
  assert.notStrictEqual(val,true);
  done();
};

// Assert that the oddNumber function is not returning 0
unit['lib.oddNumberOne should return true'] = function(done){
  var val = lib.oddNumber(5);
  assert.notStrictEqual(val, false);
  done();
};

// Export the tests to the runner
module.exports = unit;
