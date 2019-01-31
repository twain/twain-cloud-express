'use strict';
var express = require('express');
var router = express.Router({mergeParams: true});
var jwt = require('../utils/jwt');

router.get('/:provider', function(req, res, next) {
  // fake tokens for local development
  const tokens = jwt.generateTokens();

  // determine URL first
  const baseUrl = req.protocol + '://' + req.get('host');
  const origin = req.query.origin;
  const url = (origin || baseUrl); 

  // deal with query string
  let queryString = `?authorization_token=${tokens.authorizationToken}&refresh_token=${tokens.refreshToken}`;
  const query = req.query.query;
  if (query) {
    queryString += '&' + decodeURIComponent(query);
  }

  res.redirect(url + queryString);
});

module.exports = router;