'use strict';

const uuid = require('uuid');
const urlJoin = require('url-join');
const db = require('../utils/dbClient');
const logger = require('../utils/logger')('api-register');

var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {

  const scannerInfo = req.body;
  logger.debug(scannerInfo);

  const scannerId = uuid.v4();
  const registrationToken = uuid.v4().substring(0, 8); // Use 8 "random" symbols as registration token

  scannerInfo.id = scannerId;
  scannerInfo.registrationToken = registrationToken;

  logger.info(`Persisting scanner with id: ${scannerId} and registration token: ${registrationToken}`);
  db.addScanner(scannerId, scannerInfo)
  .then(() => {
    const queryString = `?scannerId=${scannerId}&registrationToken=${registrationToken}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const response = {
      scannerId: scannerId,
      registrationToken: registrationToken,
      pollingUrl: urlJoin(baseUrl, '/api/poll', queryString),
      inviteUrl: urlJoin(baseUrl, '/register/', queryString)
    };

    res.send(response);
  })
  .catch(next);
});

module.exports = router;