const express = require('express')
//const { fstat } = require('fs')
const app = express()
const logdb = require('./database')
const errorhandler = require('errorhandler')
const morgan = require('morgan')
const fs = require('fs')
//const md5 = require('md5')
//const { error } = require('console')
//app.use(express.urlencoded({extended : true}));

//app.use(express.json)
const args = require('minimist')(process.argv.slice(2))
console.log(args)
args['port']

const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)


if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}
const port = args.port || process.env.PORT || 5000

const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%',port))
});

//morgan('combined'))

// Use morgan for logging to files
// Create a write stream to append (flags: 'a') to a file
const WRITESTREAM = fs.createWriteStream('FILE', { flags: 'a' })
// Set up the access logging middleware
app.use(morgan('FORMAT', { stream: WRITESTREAM }))

const logging = (req, res, next) => {
    console.log(req.ip)
    next()
}

//app.use(fs.writeFile('./access.log', morgan('combined'), {flag : 'a' }, (err, req, res, next) => {if (err) {console.error(err)} else {console.log() }))
// maybe?

app.get('/app/', (req, res, next) => {
    res.status(200).end('OK')
    res.type('text/plain')

});


app.get('/app/flip/', (req, res) => {
    var flip = coinFlip()
    res.status(200).json({ "flip" : flip})
})

app.get('/app/flips/:number', (req, res) => {
    var flips = coinFlips(req.params.number)
    res.status(200).json({ "raw" : flips, "summary" : countFlips(flips)})
})

app.get('/app/flip/call/heads', (req, res) => {
    var heads = flipACoin("heads")
    res.status(200).json(heads)
})

app.get('/app/flip/call/tails', (req, res) => {
    var tails = flipACoin("tails")
    res.status(200).json(tails)
})
 

app.use(function(req, res) {
    res.status(404).end("Endpoint does not exist")
    res.type("text/plain")
})

function coinFlip() {
    return Math.random() > .5 ? ("heads") : ("tails")
}

function coinFlips(flips) {
    var temp = new Array();
    if (flips < 1 || typeof flips == 'undefined') {
      flips = 1;
    }
    for (var i = 0; i < flips; i++) {
      //var coin = Math.random > .5 ? ("heads") : ("tails");
  
      temp.push(coinFlip());
    }
    return temp;
}

function countFlips(array) {
    let h = 0;
    let t = 0;
    for (let i  = 0; i < array.length; i++) {
      if (array[i] == 'heads') {
        h++;
      }
      if (array[i] == 'tails') {
        t++;
  
      }
    }
    return {heads: h, tails: t};
   
}

function flipACoin(call) {
    let flip = coinFlip()
    let result = '';
    if (flip == call) {
      result = 'win';
    } else {
      result = 'lose';
    }
    return {call: call, flip: flip, result: result}
}
  