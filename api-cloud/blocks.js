'use strict';
const uuid = require('uuid');
const express = require('express');
const router = express.Router({mergeParams: true});

const fs = require('fs');
const path = require('path');
const util = require('util'); 
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const logger = require('../utils/logger')('api-blocks');
const uploadFolder = `${__baseFolder}/upload`;

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  return exists(dirname)
  .then(doesEsists => {
    if (doesEsists) {
      return Promise.resolve();
    }

    return ensureDirectoryExistence(dirname)
    .then(() => mkdir(dirname));
  });
}

function getFileId(req, blockId) {
  const clientId = req.twain.principalId;
  const scannerId = req.params.scannerId;
  return `${uploadFolder}/${clientId}/${scannerId}/${blockId}`;
}

router.post('/', function(req, res, next) {
  const blockId = uuid.v4();
  const fileId = getFileId(req, blockId)
  const fileContent = new Buffer(req.body, 'base64');

  logger.info('saving file');
  ensureDirectoryExistence(fileId)
  .then(() => writeFile(fileId, fileContent))
  .then(() => res.json(blockId))
  .catch(next);
});

router.get('/:blockId', function(req, res, next) {
  const blockId = req.params.blockId;
  const fileId = getFileId(req, blockId);

  logger.info('downloading file');
  readFile(fileId)
  .then(data => res.json(data.toString('base64')))
  .catch(next);
});

module.exports = router;