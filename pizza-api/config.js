/**
 * Creating an export configuration variables.
 */
 const {privateKeys} = require('./lib/dotEnvReader')
// Container for all the enviroments
const enviroments = {};

// Staging Object (default enviroment)
enviroments.staging = {
  'httpPort': 3002,
  'httpsPort': 3001,
  'envName': "staging", // could be development
  'hashingSecret': 'thisIsASecret',
  'mailgunDomain':'sandboxe4ae4bd114c9493386c8012323d7ca43.mailgun.org'
};

enviroments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': "production",
  'hashingSecret': 'thisIsASecret',
  'mailgunDomain':'sandboxe4ae4bd114c9493386c8012323d7ca43.mailgun.org'
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