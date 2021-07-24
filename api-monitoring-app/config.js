/**
 * Creating an export configuration variables.
 */

// Container for all the enviroments
let enviroments = {};

// Staging Object (default enviroment)
enviroments.staging = {
  'httpPort': 3002,
  'httpsPort': 3001,
  'envName': "staging", // could be development
};

enviroments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': "production",
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