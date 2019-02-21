'use strict';
const iot = require('../utils/iotClient');
const logger = require('../utils/logger')('api-user');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const clientId = req.twain.principalId;
  logger.info(`Loading user information and environment details scanners for clientId: ${clientId}`);

  // generate signed MQTT Url
  return iot.signMqttUrl(req)
  // create session object 
  .then(iotUrl => {
    const clientEnvironment = {
      eventBroker: {
        type: 'mqtt',
        url: iotUrl,
        topic: iot.getClientTopic(clientId)
      }
    };

    res.send(clientEnvironment);
  })
  .catch(next);
});

module.exports = router;