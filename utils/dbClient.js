'use strict';
const logger = require('./logger')('dbClient');

var clientIdToScannerIds = {};
var scannerIdToScanners = {};

// TODO: replace with promise / async
module.exports.getScanners = function(clientId) {
  logger.info(`Loading scanners for clientId: ${clientId}`);
  const scannerIds = clientIdToScannerIds[clientId] || [];

  const scanners = scannerIds
    .map(id => scannerIdToScanners[id])
    .filter(scanner => scanner);

  return Promise.resolve(scanners);
};

module.exports.getScannerById = function(scannerId) {
  logger.info(`Getting scanner with id: ${scannerId}`);
  const scanner = scannerIdToScanners[scannerId];
  if (!scanner) {
    return Promise.reject(new Error('No scanner with specified ID'));
  }
  
  return Promise.resolve(scanner);
};

module.exports.addScanner = function(scannerId, scanner) {
  logger.info(`Adding scanner with id: ${scannerId}`);
  scannerIdToScanners[scannerId] = scanner;

  return Promise.resolve();
};


module.exports.assignScanner = function(scannerId, clientId) {
  logger.info(`Assigning scanner with id: ${scannerId} to client: ${clientId}`);
  let scanners = clientIdToScannerIds[clientId];
  if (scanners) {
    scanners.push(scannerId);
  } 
  else {
    scanners = [scannerId];
  }
  clientIdToScannerIds[clientId] = scanners;

  return Promise.resolve();
};


module.exports.deleteScanner = function(scannerId) {
  logger.info(`Deleting scanner with id: ${scannerId}`);
  delete scannerIdToScanners[scannerId];

  return Promise.resolve();
};