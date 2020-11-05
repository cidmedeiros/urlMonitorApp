 /*
 * Tests
 *
 */
// Dependencies
var lib = require('../app/lib');
var assert = require('assert');

// Holder for Tests
var unit = {};

// Assert that the EvenNumber function is returning a boolean
unit['lib.EvenNumber should return a boolean'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(typeof(val), 'boolean');
  done();
};

// Assert that the EvenNumber function is working with even numbers
unit['lib.EvenNumber should verify an even number'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(val, true);
  done();
};

// Assert that the EvenNumber function is returning true
unit['lib.EvenNumber should return true'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(val, false);
  done();
};

// Assert that the oddNumber function is returning a boolean
unit['lib.oddNumber should return a boolean'] = function(done){
  var val = lib.oddNumber();
  assert.strictEqual(typeof(val), 'boolean');
  done();
};

// Assert that the oddNumber function is returning an odd number
unit['lib.oddNumber should verify an odd number'] = function(done){
  var val = lib.oddNumber(5);
  assert.strictEqual(val,true);
  done();
};

// Assert that the oddNumber function is not returning true
unit['lib.oddNumberOne should return true'] = function(done){
  var val = lib.oddNumber(5);
  assert.strictEqual(val, false);
  done();
};

// Assert that the palindrome function is returning a boolean
unit['lib.palindrome should return a boolean'] = function(done){
  var val = lib.palindrome('eye');
  assert.strictEqual(typeof(val), 'boolean');
  done();
};

// Assert that the palindrome function is verifying palindromes
unit['lib.palindrome should verify a palindrome'] = function(done){
  var val = lib.palindrome('eye');
  assert.strictEqual(val,true);
  done();
};

// Assert that the palindrome function is not returning true
unit['lib.palindrome should return true'] = function(done){
  var val = lib.palindrome('eye');
  assert.strictEqual(val, false);
  done();
};

// Export the tests to the runner
module.exports = unit;
