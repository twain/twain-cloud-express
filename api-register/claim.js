'use strict';
const db = require('../utils/dbClient');
const logger = require('../utils/logger')('api-claim');

var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
  const clientId = req.twain.principalId;
  const claimInfo = req.body;  
  logger.debug(claimInfo);

  const scannerId = claimInfo.scannerId;
  db.getScannerById(scannerId)
  .then(scanner => {
    logger.info('retrieved scanner: ' + scanner);

    if (scanner.registrationToken === claimInfo.registrationToken) {

      // TODO: simplify this
      delete scanner.registrationToken;
      scanner.clientId = clientId;

      db.assignScanner(scannerId, clientId)
      .then(() => {
        res.send(scanner);
      });
    }
    else {
      next(new Error('invalid scanner id: ' + claimInfo.scannerId));
    }
  })
  .catch(next);
});

module.exports = router;