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

//codify the unique questions allowed
const e = new _events();

//INITIALIZING MODULE OBJ
const cli = {};
/*****************************
 *      INPUT HANDLERS
 *******************************/
// for help
e.on('man', function(strLine){
  cli.responders.help()
})
e.on('help', function(strLine){
  cli.responders.help()
})
// for exit
e.on('exit', function(strLine){
  cli.responders.exit()
})
//for stats
e.on('stats', function(strLine){
  cli.responders.stats()
})
//for LIST users
e.on('list users', function(strLine){
  cli.responders.listUsers()
})
//for more info of one user
e.on('more user info', function(strLine){
  //this method requires to check the inputline
  cli.responders.moreUserInfo(strLine)
})
//for list of checks
e.on('list checks', function(strLine){
  //this method requires to check the inputline
  cli.responders.listChecks(strLine)
})
//for more check info
e.on('more check info', function(strLine){
  //this method requires to check the inputline
  cli.responders.moreCheckInfo(strLine)
})
//for list logs
e.on('list logs', function(strLine){
  //this method requires to check the inputline
  cli.responders.listLogs(strLine)
})
//for more log info
e.on('more log info', function(strLine){
  //this method requires to check the inputline
  cli.responders.moreLogInfo(strLine)
})
 

/**********************************
 *      / INPUT HANDLERS
 ***********************************/

//Responders object
cli.responders= {}

/**********************************
 *       RESPONDERS
 ***********************************/

//HELP && MAN
cli.responders.help = function(){
  const commands = {
    "help":"Alias of the man command",
    "man":"Show this help page",
    "exit":"Kill the CLI (and the rest of the APP including the server)",
    "stats":"Get statistics on the onderlying operating system and resource utilization",
    "list users":"All registered undeleted users in the system",
    "more user info --{userId}":"Show details of specific user",
    "list checks --up --down":"Show a list of all the active checks in the system, including their state. --up or --down are optional",
    "more check info --{checkId}":"Show details of specified check",
    "list logs": "Show a list of all the log files available to be read (compressed and uncompressed)",
    "more log info --{fileName}":"Show details of specified log file"
  };
  
  //CLI FORMAT Helpers
  cli.horizontalLine()
  cli.centered('CLI MANUAL')
  cli.horizontalLine()
  cli.verticalSpace(2)
  
  // Show each command, followed by its explination
  Object.keys(commands).forEach(e=>{
    let line= '\x1b[33m'+e+'\x1b[0m'
    const value = commands[e]
    const padding = 45- line.length
    for (let i = 0; i < padding; i++) {
      line += ' '
    }
    line +=  value
    console.log(line);
    cli.verticalSpace()
  })
  
  cli.verticalSpace(1)

  //End with another horizontal line
  cli.horizontalLine()
}

//EXIT
cli.responders.exit = function(){
  process.exit(0)
}

//STATS
cli.responders.stats = function(){
  console.log('you wanted to see the stats');
}

//List Users
cli.responders.listUsers = function(){
  console.log('you wanted to see the list of all users');
}
//MORE USER INFO
cli.responders.moreUserInfo = function(str){
  console.log('you wanted to see more info of 1 user ', str);
}
//LIST CHECKS
cli.responders.listChecks = function(str){
  console.log('you wanted to see the list of all checks ', str);
}
//MORE CHECK INFO
cli.responders.moreCheckInfo = function(str){
  console.log('you wanted to see more info of 1 check ', str);
}
//LIST LOGS
cli.responders.listLogs = function(){
  console.log('you wanted to see the list of all logs');
}
//MORE LOG INFO
cli.responders.moreLogInfo = function(str){
  console.log('you wanted to see more info of 1 log ', str );
}

/**********************************
 *       RESPONDERS
 ***********************************/

//Input Processor
cli.processInput = function (strLine) {
  strLine = contractChecker.notEmptyString(strLine.trim());
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
  //only continue if there was an input
  if (strLine) {

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
        console.log('   I don´t recognize that command. Sorry, try again with "help"');
    }
  }
};
/*********************************
 *        CLI FORMAT helper
 * ****************************** */

// draw a horizontal line of the console's width
cli.horizontalLine= function(){
  //GET available screen size
  const width = process.stdout.columns

  let line = ''
  for (let i = 0; i < width; i++) {
    line+='-'
  }
  console.log(line);
}

// centered will show a text CENTERED like a title
cli.centered = function(title){
  title = typeof title == 'string' && title.length > 0 ? title.trim() : ''
  
  // get the width
  const width = process.stdout.columns

  //calculate de left padding
  const leftPadding = Math.floor((width - title.length)/2)
  let line = ''
  for (let i = 0; i < leftPadding; i++) {
    line += ' ' 
  }
  line+=title
  console.log(line);
}

// determine de number of colums you want to format
cli.verticalSpace = function(lines=1){
  lines = typeof lines == 'number' && lines > 0 ? lines : 1
  for (let i = 0; i < lines; i++) {
    console.log('');    
  }
}


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
