'use strict';
var express = require('express');
var router = express.Router({ mergeParams: true });
var jwt = require('../utils/jwt');

router.get('/', function(req, res) {
  res.send(jwt.generateTokens());
});

module.exports = router;