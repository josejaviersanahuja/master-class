/**
 * Creating an export configuration variables.
 */
 const {privateKeys} = require('./lib/helpers')
// Container for all the enviroments
const enviroments = {};

// Staging Object (default enviroment)
enviroments.staging = {
  'httpPort': 3002,
  'httpsPort': 3001,
  'envName': "staging", // could be development
  'hashingSecret': 'thisIsASecret',
  'maxChecks' : 5,
  'twilio': {
    'fromPhone': '+17149092365',
    'accountSid': 'AC6e529c5151c30f0271b0283a53607a66',
    'authToken': privateKeys.AUTH_TOKEN
  }
};

enviroments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': "production",
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'fromPhone': '+17149092365',
    'accountSid': 'AC6e529c5151c30f0271b0283a53607a66',
    'authToken': privateKeys.AUTH_TOKEN
  }
};

// Determine which enviroment export.
const currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";
// debbugconsole.log(process.env.NODE_ENV, 'en config file');
// Check that the current enviroment is one of the enviroments above.

const enviromentToExport =
  typeof enviroments[currentEnviroment] == "object"
    ? enviroments[currentEnviroment]
    : enviroments.staging;

module.exports = enviromentToExport