'use strict';
const iot = require('../utils/iotClient');
const logger = require('../utils/logger')('api-local');

var express = require('express');
var router = express.Router({ mergeParams: true });

router.all('/', function(req, res, next) {
  const body = req.body;
  const method = req.method;
  const headers = req.headers;
  const scannerId = req.params.scannerId;

  const url = req.protocol + '://' + req.get('host') + req.originalUrl;

  // TODO: check scanner is online
  return iot.notifyScanner(scannerId, { 
    headers,
    method, 
    url,
    body: JSON.stringify(body)
  })
  .then(() => res.sendStatus(200))
  .catch(next);
});

module.exports = router;