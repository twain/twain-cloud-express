'use strict';

var twain = new TwainCloud({ apiEndpoint: apiEndpoint });

var scanners = [];
var autoRefresh = true;

function getSelectedScannerId() {
  var scannerId = $('#scannersTable tbody .table-success').attr('id');
  return scannerId;
}

function loadScanners() {
  var authorizationToken = getAuthToken();

  return twain.getScanners(authorizationToken)
        .then(function (data) {
            // cache scanners
          scanners = data;

            // fill scanners table
          var rows = '';
          data.forEach(function(scanner) {
            rows += '<tr id="' + scanner.id + '">' +                    
                    '<td>' + scanner.name + '</td>' +
                    '<td>' + scanner.description + '</td>' +
                    '<td>' + scanner.id + '</td>' +
                    '</tr>';
          });
          $('#scannersTable tbody').html(rows);

            // resubscribe new rows
          $('#scannersTable > tbody > tr').click(function(event) {
            $('#scannersTable > tbody > tr').removeClass('table-success');
            $(event.currentTarget).addClass('table-success');
          });

          return scanners;
        })
        .then(connectEvents)
        .catch(function (error) {
          if(autoRefresh) {
            refreshToken(loadScanners);
          } else {
            log('Unauthorized: ' + JSON.stringify(error));
          }
        });
}

function connectEvents(scanners) {
  twain.on('message', function(event) {
    var message = JSON.parse(event.body);
    var messageType = (message.results) ? '[Response]' : '[Request]';

    console.log(message.commandId + ' ' + messageType + ' ' + message.method, message);    
  });
  twain.on('error', log);

  var authorizationToken = getAuthToken();
  twain.connectEvents(authorizationToken, scanners.map(function (s) { return s.id }))
    .then(function() {
      log('Connected to TWAIN Cloud events hub.');
    })
    .catch(function(error) {
      if(autoRefresh) {
        refreshToken(connectEvents);
      } else {
        log('Unauthorized: ' + JSON.stringify(error));
      }
    });
}

function deleteScanner() {
  var scannerId = getSelectedScannerId();
  var authorizationToken = getAuthToken();

  if (scannerId) {
    twain.deleteScanner(authorizationToken, scannerId).then(loadScanners);
  }
}

function initializeAuthorizedPage() {
  $('#authorizedProfileItems').show();
  loadScanners();
}

function initializeUnauthorizedPage() {
  $('#unauthorizedProfileItems').show();
}

$(function () {
  $('#facebookLogin').on('click', function(event) {
    login('facebook');
  });
  $('#googleLogin').on('click', function(event) {
    login('google');
  });

  $('#logout').on('click', function(event) {
    logout();
  });

  $('#refreshScanners').on('click', loadScanners);
  $('#deleteScanner').on('click', deleteScanner);

  processQueryAuth(initializeAuthorizedPage, initializeUnauthorizedPage);
});