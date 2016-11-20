const express = require('express');
const app = express();

const morgan = require('morgan');
const bodyParser = require('body-parser');

const hkdnetHandler = require('./app/handlers/hkdnet.js');
const tokimiHandler = require('./app/handlers/tokimi.js');

app.use(morgan("dev", {immediate: true}));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post('/callback', tokimiHandler);

app.get('/test', function (req, res) {
  res.send("TOKIMI is AWAKE");
});

app.post('/hkdnet', hkdnetHandler);
app.listen(process.env.PORT || 3000);
console.log("server starting...");
