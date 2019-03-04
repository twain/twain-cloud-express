'use strict';

// save base folder location
global.__baseFolder = __dirname;

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

// Authentication API
const signinRouter = require('./api-auth/signin');
const refreshRouter = require('./api-auth/refresh');

// Registration API
const registerRouter = require('./api-register/register');
const pollRouter = require('./api-register/poll');
const claimRouter = require('./api-register/claim');

// Cloud API
const scannersRouter = require('./api-cloud/scanners');
const userRouter = require('./api-cloud/user');
const blocksRouter = require('./api-cloud/blocks');

// Local API
const localRouter = require('./api-local/direct');

const app = express();

app.use(logger('dev'));
app.use(express.json({ strict: false }));
app.use(bodyParser.raw({ limit: '10mb' }));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// API that does not require authentication
app.use('/api/authentication/signin', signinRouter);
app.use('/api/authentication/refresh', refreshRouter);
app.use('/api/register', registerRouter);
app.use('/api/poll', pollRouter);

// Auth middleware
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }

  // TODO: parse JWT and save principal id
  req.twain = {};
  req.twain.principalId = req.headers.authorization;

  return next();
});

// APIs that do require authentication
app.use('/api/claim', claimRouter);
app.use('/api/user', userRouter);
app.use('/api/scanners', scannersRouter);
scannersRouter.use('/:scannerId/blocks', blocksRouter);

// v1 - original APIs with 'privet' prefix
scannersRouter.use('/:scannerId/privet/infoex', localRouter);
scannersRouter.use('/:scannerId/privet/twaindirect/session', localRouter);
// v2 - APIs without 'privet' prefix
scannersRouter.use('/:scannerId/infoex', localRouter);
scannersRouter.use('/:scannerId/session', localRouter);

module.exports = app;