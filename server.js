const express = require('express')
const app = express()
const args = require('minimist')(process.argv.slice(2))
args['port']
const port = args.port || process.env.PORT || 5000

const server = app.listen(port, () => {
    console.log('App is running on port %PORT%'.replace('%PORT%',port))
});

app.get('/app/', (req, res) => {
    res.status(200).end('OK')
    res.type('text/plain')

})
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
  