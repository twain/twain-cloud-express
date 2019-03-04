'use strict';
const uuid = require('uuid');
const express = require('express');
const router = express.Router({ mergeParams: true });

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const fs = require('fs');
const path = require('path');
const util = require('util'); 
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const writeFile = util.promisify(fs.writeFile);

const logger = require('../utils/logger')('api-blocks');
const uploadFolder = `${__baseFolder}/upload`;

const ensureDirectoryExistence = function(filePath) {
  const dirname = path.dirname(filePath);

  return exists(dirname)
  .then(doesExist => {
    if (doesExist) {
      return Promise.resolve();
    }

    return ensureDirectoryExistence(dirname)
    .then(() => mkdir(dirname));
  });
};

const getFileId = function(req, blockId) {
  const clientId = req.twain.principalId;
  const scannerId = req.params.scannerId;

  return `${uploadFolder}/${clientId}/${scannerId}/${blockId}`;
};

const getFileUrl = function(req, blockId) {
  return `${req.protocol}://${req.get('host')}${req.originalUrl}/${blockId}`;
};

router.post('/', upload.single(), function(req, res, next) {
  const blockId = uuid.v4();
  const fileId = getFileId(req, blockId);
  const fileContent = req.body;

  logger.info(`saving file: ${fileId}`);  
  ensureDirectoryExistence(fileId)
  .then(() => writeFile(fileId, fileContent))
  .then(() => res.json(getFileUrl(req, blockId)))
  .catch(next);
});

router.get('/:blockId', function(req, res, next) {
  const blockId = req.params.blockId;
  const fileId = getFileId(req, blockId);

  logger.info(`downloading file: ${fileId}`);
  res.download(fileId, next);
});

module.exports = router;