const express = require('express');
const app = express()
//const errorhandler = require('errorhandler')
const morgan = require('morgan')
const fs = require('fs')
const logdb = require('./database')
app.use(express.urlencoded({extended : true}));
app.use(express.json)

const args = require("minimist")(process.argv.slice(2))
const port = args.port || process.env.PORT || 5000
//const debug = args.debug || false
const log = args.log || true
console.log(args)
args["port", "debug", "log", "help"]



if (args.help || args.h) {
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
    console.log(help)
    process.exit(0)
}

if (log == true) {
    const accesslog = fs.createWriteStream('access.log', { flags: 'a' })
    app.use(morgan('combined', { stream: accesslog }))
} else {
    console.log("Log file not created")
}


app.use( (req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    console.log(logdata)
    const stmt = logdb.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
    next()
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
  
if(args.debug) {
    app.get('/app/log/access', (req, res) => {
        const stmt = logdb.prepare('SELECT * FROM accesslog').all();
        res.status(200).json(stmt);
    })

    app.get('/app/error', (req, res) => {
        throw new Error('Error test successful.');
    })
}

const server = app.listen(port, "localhost", () => {
    console.log('App is running on port %PORT%'.replace('%PORT%',port))
});



app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
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
    res.status(404).send("Endpoint does not exist")
    res.type("text/plain")
})
