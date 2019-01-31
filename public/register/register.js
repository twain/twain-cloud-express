var twain = new TwainCloud({ apiEndpoint: apiEndpoint });
var autoRefresh = true;

function authorizeClaim(provider) {
  var query = getQueryParams(document.location.search) || {};
  var registerPageUrl = [location.protocol, '//', location.host, location.pathname].join('');
  login(provider, registerPageUrl, query);
}

function claimScanner(scannerId, registrationToken) {
  var authorizationToken = getAuthToken(); 

  twain.claim(authorizationToken, scannerId, registrationToken)
    .then(function (data) {
      log('successfully registered!');

      if (data.name) {
        $('#scannerName').text(data.name);
      }

      $('#processingForm').hide();
      $('#congratsForm').show();
    })
    .catch(function (error) {
      if(autoRefresh) {
        refreshToken(function() { claimScanner(scannerId); });
      } else {
        log('Unauthorized: ' + JSON.stringify(error));
      }
    });
}

function showPageSection(selector)
{
  $(selector).show();
  $('.container').show();
}

function initializeAuthorizedPage() {
  showPageSection('#processingForm');
  var query = getQueryParams(document.location.search);
  var scannerId = query.scannerId || '';
  var registrationToken = query.registrationToken || '';

  if (scannerId && registrationToken) {
    claimScanner(scannerId, registrationToken);
  }
}

function initializeUnauthorizedPage() {
  showPageSection('#authorizeForm');
}

$(function () {
  $('#facebookLogin').on('click', function(event) {
    authorizeClaim('facebook');
  });
  $('#googleLogin').on('click', function(event) {
    authorizeClaim('google');
  });

  processQueryAuth(initializeAuthorizedPage, initializeUnauthorizedPage);
});