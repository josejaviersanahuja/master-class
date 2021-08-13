/**
 * Unit tests
 *
 */

// Dependencies
const assert = require("assert");
const helpers = require("../lib/helpers");
const _data = require("../lib/data");
const _logs = require("../lib/logs");
const exampleDebuggerProblem = require("../lib/exampleDebuggingProblem");
const dotEnvReadeer = require("../lib/dotEnvReader");
const contractChecker = require("../lib/contractChecker");

//Holder
const unit = {};

//Assert the getNumber function is returning 2 SHOULD FAIL
unit["helpers.getANumber ERROR EXPECTED should be 0"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(val, 0);
  done();
};
//Assert the getNumber function is returning a number
unit["helpers.getANumber should return a number"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(typeof val, "number");
  done();
};

//Assert the getNumber function is returning 1
unit["helpers.getANumber should return 1"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(val, 1);
  done();
};

/*******************************************
 *            LOGS
 * ************************************* */

// log list should work as expected
unit["logs.list should callback a false error and an array of logFileNames"] =
  function (done) {
    _logs.list(true, function (err, logFileNames) {
      assert.strictEqual(err, false);
      assert.ok(Array.isArray(logFileNames));
      assert.ok(logFileNames.length > 0);
      done();
    });
  };

// log truncate should not throw
unit["logs.truncate should not throw if the logId does not exist"] = function (
  done
) {
  assert.doesNotThrow(function () {
    _logs.truncate("no file with this name", function (err) {
      assert.ok(err);
      done();
    });
  }, TypeError);
};

module.exports = unit;
