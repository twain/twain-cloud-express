// save base folder location
global.__baseFolder = __dirname;

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');

var indexRouter = require('./routes/index');

// Authentication API
var signinRouter = require('./api-auth/signin');
var refreshRouter = require('./api-auth/refresh');

// Registration API
var registerRouter = require('./api-register/register');
var pollRouter = require('./api-register/poll');
var claimRouter = require('./api-register/claim');

// Cloud API
var scannersRouter = require('./api-cloud/scanners');
var userRouter = require('./api-cloud/user');
var blocksRouter = require('./api-cloud/blocks');

// Local API
var localRouter = require('./api-local/direct');

var app = express();

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
app.use(function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  }

  // TODO: parse JWT and save principal id
  req.twain = {};
  req.twain.principalId = req.headers.authorization;

  next();
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
