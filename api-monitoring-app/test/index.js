/**
 * TEST RUNNER
 *
 */

// Dependencies
const assert = require("assert");
const helpers = require("../lib/helpers");
const cli = require("../lib/cli");

// Application logic for the test runner
_app = {};

// Container for the tests
_app.tests = {
  unit: {},
};

//Assert the getNumber function is returning a number
_app.tests.unit["helpers.getANumber should return a number"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(typeof val, "number");
  done();
};

//Assert the getNumber function is returning 1
_app.tests.unit["helpers.getANumber should return 1"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(val, 1);
  done();
};

//Assert the getNumber function is returning 2 SHOULD FAIL
_app.tests.unit["helpers.getANumber should return 2"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(val, 2);
  done();
};
//Assert the getNumber function is returning 2 SHOULD FAIL
_app.tests.unit["helpers.getANumber should return 0"] = function (done) {
  const val = helpers.getANumber();
  assert.strictEqual(val, 0);
  done();
};

//Count all the tests
_app.countTests = function () {
  let counter = 0;
  for (const key in _app.tests) {
    if (Object.hasOwnProperty.call(_app.tests, key)) {
      const subTests = _app.tests[key];
      for (const testName in subTests) {
        if (Object.hasOwnProperty.call(subTests, testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

//This is the logic for  the test runner
_app.runTests = function () {
  let errors = [];
  let successes = 0;
  const limit = _app.countTests(); //TODO
  let counter = 0;

  for (const key in _app.tests) {
    if (Object.hasOwnProperty.call(_app.tests, key)) {
      const subTest = _app.tests[key];
      for (const testName in subTest) {
        if (Object.hasOwnProperty.call(subTest, testName)) {
          (function () {
            const tmpTestName = testName;
            const testValue = subTest[testName];
            //Call the test
            try {
              testValue(function (params) {
                //if it calls back without throwing, then it succeded. log in green
                console.log("\x1b[32m%s\x1b[0m", testName);
                counter++;
                successes++;
                if (counter === limit) {
                  _app.produceTestReport(limit, successes, errors); 
                }
              });
            } catch (error) {
              //if it throws it failed
              errors.push({
                name: testName,
                error: error,
              });
              console.log(
                "\x1b[31m%s\x1b[0m", testName );
              counter++;
              if (counter === limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
}

//Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
  const testStatsObject = {
    "Total tests": limit,
    Pass: successes,
    Fail: errors.length,
  };
  cli.renderObjectStyle("BEGIN TEST REPORT", testStatsObject, 32);

  //if there are errors print them
  if (errors.length > 0) {
    const failedTestsObject = {};
    errors.forEach((e) => {
      failedTestsObject[e.name] = e.error;
    });
    cli.renderObjectStyle("BEGIN ERROR DETAILS", failedTestsObject, 31);
    
  }

  cli.renderObjectStyle('END OF TESTS',{})

};

// RUN
_app.runTests()