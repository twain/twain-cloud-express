'use strict';
const db = require('../utils/dbClient');
const iot = require('../utils/iotClient');
const logger = require('../utils/logger')('api-scanners');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const clientId = req.twain.principalId;
  logger.info('Starting scanner loading...');
  
  db.getScanners(clientId)
  .then(scanners => {
    res.send(scanners);
  })
  .catch(next);
});

router.get('/:scannerId', function(req, res, next) {
  const scannerId = req.params.scannerId;

  return db.getScannerById(scannerId)
    .then(scanner => {
      // generate signed MQTT Url
      return iot.signMqttUrl(req)
      // create session object
        .then(iotUrl => {
          const deviceSession = {
            type: 'mqtt',
            url: iotUrl,
            requestTopic: iot.getDeviceRequestTopic(scannerId),
            responseTopic: iot.getDeviceResponseTopic(scanner.clientId)
          };

          return res.send(deviceSession);
        });
    })
    .catch(next);
});

router.delete('/:scannerId', function(req, res, next) {
  const scannerId = req.params.scannerId;

  return db.deleteScanner(scannerId)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(next);
});


module.exports = router;