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
unit['lib.EvenNumber should return a number'] = function(done){
  var val = lib.evenNumber(2);
  assert.strictEqual(typeof(val), 'number');
  done();
};

// Assert that the EvenNumber function is returning an even number
unit['lib.EvenNumber should return an even number'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(val % 2, 0);
  done();
};

// Assert that the EvenNumber function is returning 0
unit['lib.EvenNumber should return 0'] = function(done){
  var val = lib.evenNumber(4);
  assert.strictEqual(val % 2, 1);
  done();
};

// Assert that the oddNumber function is returning a number
unit['lib.oddNumber should return a number'] = function(done){
  var val = lib.oddNumber();
  assert.strictEqual(typeof(val), 'number');
  done();
};

// Assert that the oddNumber function is returning an odd number
unit['lib.oddNumber should return an odd number'] = function(done){
  var val = lib.oddNumber();
  assert.notStrictEqual(val % 2,0);
  done();
};

// Assert that the oddNumber function is not returning 0
unit['lib.oddNumberOne should return 1'] = function(done){
  var val = lib.oddNumber();
  assert.notStrictEqual(val % 2, 0);
  done();
};

// Logs.list should callback an array and a false error
unit['logs.list should callback a false error and an array of log names'] = function(done){
  logs.list(true,function(err,logFileNames){
      assert.strictEqual(err, false);
      assert.ok(logFileNames instanceof Array);
      assert.ok(logFileNames.length > 1);
      done();
  });
};

// Logs.truncate should not throw if the logId doesnt exist
unit['logs.truncate should not throw if the logId does not exist, should callback an error instead'] = function(done){
  assert.doesNotThrow(function(){
    logs.truncate('I do not exist',function(err){
      assert.ok(err);
      done();
    })
  },TypeError);
};

// exampleDebuggingProblem.init should not throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = function(done){
  assert.doesNotThrow(function(){
    exampleDebuggingProblem.init();
    done();
  },TypeError);
};

// Export the tests to the runner
module.exports = unit;
