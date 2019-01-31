var mosca = require('mosca');
var logger = require('./utils/logger')('mqtt');

var moscaSettings = {
  port: 1883
};

var mqttServer = new mosca.Server(moscaSettings);	//here we start mosca
mqttServer.on('ready', function setup() {
  logger.debug('MQTT server is up and running');

  const topic = '/hello/world';

  // fired when a message is published
  mqttServer.on('published', function(packet, client) {
    logger.debug('Published: ', packet);
  });
});

module.exports = mqttServer;