'use strict';
const express = require('express');
const morgan = require('morgan');
const morganBody = require('morgan-body');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});
router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

router.post('/webhook-test-product-in-collection-changed', (req, res) => {
  // console.log("Request body from webhook:", req.body)
  res.send("OK");
});


function overrideContentTypeForAwsSns(req, res, next) {
  if (req.headers['x-amz-sns-message-type']) {
    req.headers['content-type'] = 'application/json;charset=UTF-8';
  }
  next();
};


app.use(overrideContentTypeForAwsSns);
app.use(bodyParser.json());
morganBody(app, { logAllReqHeader: true, maxBodyLength: 20000 });
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
