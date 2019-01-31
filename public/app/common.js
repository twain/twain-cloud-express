'use strict';

var apiEndpoint = window.location.protocol + '//' + window.location.host + '/api';

function log(message) {
  console.log(message);
}

function getPathFromUrl(url) {
  return url.split(/[?#]/)[0];
}

function getQueryParams(qs) {
  qs = qs.split('+').join(' ');
  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }
  return params;
}

function isAuthorized() {
  return (getAuthToken() && getRefreshToken());
}

function getAuthToken() {
  return localStorage.getItem('authorization_token');
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

function clearAuthTokens() {
  localStorage.removeItem('authorization_token');
  localStorage.removeItem('refresh_token');
}

function saveAuthTokens(authorization_token, refresh_token) {

    // Save token to local storage for later use
  if(authorization_token) {
    localStorage.setItem('authorization_token', authorization_token);
  }
  if(refresh_token) {
    localStorage.setItem('refresh_token', refresh_token);
  }
}

function login(provider, origin, query) {
  log('Login...');

  var signinUrl = apiEndpoint + '/authentication/signin/' + provider;
  if (origin) {
    signinUrl += '?origin=' + origin + '&query=' + encodeURIComponent($.param(query));
  }

  window.location.href = signinUrl;
}

function logout() {
  clearAuthTokens();
  window.location.href = getPathFromUrl(window.location.href);
}

function refreshToken(callback) {
  log('Refresh token...');

  saveAuthTokens('1' , '1');
  callback();

  // refresh token
  /*
  $.ajax({
    method: 'GET',
    url: apiEndpoint + '/authentication/refresh/' + getRefreshToken()
  })
    .done(function (data) {
      if (data.errorMessage) {
        log(data.errorMessage);
      } else {
        saveAuthTokens(data.authorizationToken , data.refreshToken);
        callback();
      }
    })
    .fail(function (error) {
      log('Unauthorized: ' + JSON.stringify(error));
    });
  */
}

function processQueryAuth(callback, errorCallback) {
  var success = false;
  var query = getQueryParams(document.location.search);
  if (query.error){
    log(query.error);
    clearAuthTokens();
  } else {
    var aToken = query.authorization_token || '';
    var rToken = query.refresh_token || '';

    if (aToken && rToken) {
      saveAuthTokens(aToken, rToken);
      window.history.replaceState({authorization_token: ''}, '');
      success = true;
    } else {
      clearAuthTokens();
    }
  }

  if (success && callback) {
    callback();
  } else if (errorCallback) {
    errorCallback();
  }
}
