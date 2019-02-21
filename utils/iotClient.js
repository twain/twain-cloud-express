'use strict';
const uuid = require('uuid');
const logger = require('./logger')('iotClient');
const mqtt = require('../mqtt');

const publishMqttMessage = function(message) {
  return new Promise((resolve, reject) => {
    mqtt.publish(message, (err, result) => {
      return err ? reject(err) : resolve(result);
    });
  });
};

module.exports.signMqttUrl = function signMqttUrl(req) {
  const baseIotUrl = (req.protocol === 'http' ? 'ws' : 'wss') + '://' + req.get('host');

  return Promise.resolve(baseIotUrl);
};

module.exports.notifyScanner = function (scannerId, message) {
  logger.info(`notify scanner: ${scannerId}, message: ${JSON.stringify(message)}`);
  
  const mqttMessage = {
    topic: this.getDeviceRequestTopic(scannerId),
    payload: JSON.stringify(message),
    qos: 0, // 0, 1, or 2
    retain: false // or true
  };

  return publishMqttMessage(mqttMessage);
};

module.exports.notifySession = function (sessionId, message) {
  logger.info(`notify session: ${sessionId}, message: ${JSON.stringify(message)}`);
  
  const mqttMessage = {
    topic: `twain/sessions/${sessionId}/fromCloud`,
    payload: JSON.stringify(message),
    qos: 0, // 0, 1, or 2
    retain: false // or true
  };

  return publishMqttMessage(mqttMessage);
};

// TODO: remove duplication
module.exports.getClientTopic = function (userId) {
  return `twain/users/${userId}/+`;
};

module.exports.getDeviceRequestTopic = function (scannerId) {
  return `twain/devices/${scannerId}`;
};

module.exports.getDeviceResponseTopic = function (userId) {
  // TODO: ideally, it would be session ID. Let's think about this a bit.
  const randomTopicId = uuid.v4();
  
  return `twain/users/${userId}/${randomTopicId}`;
};

module.exports.getCloudTopic = function () {
  return 'twain/cloud';
};