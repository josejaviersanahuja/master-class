/**
 * library for the CLI of this APP
 *
 */
//DEPENDENCIES
const readLine = require("readline");
const util = require("util");
const debug = util.debuglog("cli");
const events = require("events");
class _events extends events {}

const contractChecker = require("./contractChecker");

const e = new _events();

//INITIALIZING MODULE OBJ
const cli = {};

//Input Processor
cli.processInput = function (strLine) {
  strLine = contractChecker.notEmptyString(strLine.trim());

  //only continue if there was an input
  if (strLine) {
    //codify the unique questions allowed
    const uniqueInputs = [
      "man",
      "help",
      "exit",
      "stats",
      "list users",
      "more user info",
      "list checks",
      "more check info",
      "list logs",
      "more log info",
    ];

    // Go through possible inputs, emmit an event when a match is found
    let match = false
    let counter = 0
    uniqueInputs.some(function(input){
        if (strLine.toLowerCase().includes(input)) {
            match=true
            //Emit an event matching the unique input, and include the strLine
            e.emit(input, strLine)
            return true
        }
    })

    //If no match was found
    if (!match) {
        console.log('   I don´t recognize that command. Sorry, try again with some of this commands');
        console.log('--------');
        uniqueInputs.forEach(e=>{
            console.log('"'+e+'"');
        })
    }
  }
};
// initializing
cli.init = function () {
  //Start the message
  console.log("\x1b[35m%s\x1b[0m", "CLI is running");

  //input symbol - start the interface
  const _interface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">",
  });

  //Create an initial propmt
  _interface.prompt();

  //Handle each line of the input separately
  _interface.on("line", function (str) {
    //Send to the input processor
    cli.processInput(str)

    //Reinitialize the prompt afterwards
    _interface.prompt();
  });

  // if the user stops the CLI, kill all associated process
  _interface.on("close", function () {
    process.exit(0);
  });
};
//EXPORTING THE OBJECT
module.exports = cli;
