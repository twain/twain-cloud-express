'use strict';
const db = require('../utils/dbClient');
const logger = require('../utils/logger')('api-poll');
const jwt = require('../utils/jwt');

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  const scannerId = req.query.scannerId;

  if (!scannerId) {
    next(new Error('Missing scannerId query parameter.'));
  }
 
  db.getScannerById(scannerId)
  .then(scanner => {
    if (!scanner) {
      logger.warn('Nothing was found for provided scannerId: ' + scannerId);
      throw new Error('Invalid scanner id.');
    }

    if (!scanner.clientId) {
      logger.warn('Scanner is not assigned to a client yet.');
      throw new Error('Scanner is not assigned yet.');
    }

    // TODO: generate access/refresh tokens
    const tokens = jwt.generateTokens();

    res.send({
      success: true,
      authorizationToken: tokens.authorizationToken,
      refreshToken: tokens.refreshToken
    });

    /*
    return cache.saveRefreshToken(scannerId)
    .then(token => {
      const providerConfig = config({ provider: '', stage: event.stage });
      const data = Object.assign(createResponseData(scannerId), { refreshToken: token });
      const authorizationToken = utils.createToken(data.authorizationToken.payload, providerConfig.token_secret, data.authorizationToken.options);
      callback(null, { success: true, authorizationToken, refreshToken: token });
    });
    */
  })
  .catch(error => {
    logger.error(error);
    res.status(500).send({ success: false, message: 'Unknown scanner identifier' });
  });
});

module.exports = router;