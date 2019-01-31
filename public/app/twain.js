function TwainCloud(config) {
  this.config = config;
  this.handlers = {};
}

(function() {

  var scanners = [];
  var session = null;
  var eventHub = null;

  function sendRequest(verb, url, token, data) {
    var endpoint = verb  + ' ' + url;
    (data) ? console.log('[Request] ' + endpoint, data) : console.log('[Request] ' + endpoint);
       
    return $.ajax({
      method: verb,
      url: url,
      headers: { Authorization: token },
      data: data
    }).promise()
    .then(function(data) {
      console.log('[Response] ' + endpoint, data);
      return data;
    });
  }

  function getScannerById(id) {
    for(var i = 0; i < scanners.length; ++i) {
      if (scanners[i].id === id)
        return scanners[i];
    }
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

  function createEventHandler(twain, event) {
    return function(topic, message) {
      //log('[MQTT] Topic: ' + topic + ', Message: ' + message);
      var handler = twain.handlers[event];
      if (handler) {
        handler(JSON.parse(message));
      }
    };
  }

  TwainCloud.prototype.claim = function claim(token, scannerId, registrationToken) {
    var deferred = $.Deferred();

    if (token) {
      var claimEndpoint = this.config.apiEndpoint + '/claim';
      sendRequest('POST', claimEndpoint, token, {
        scannerId: scannerId,
        registrationToken: registrationToken
      })
            .then(function (data) {
              log(data);
              deferred.resolve(data);
            })
            .catch(function (error) {
              log('Unauthorized: ' + JSON.stringify(error));
              deferred.reject(error);
            });
    } else {
      log('Missing authentication token');
      deferred.reject();
    }

    return deferred.promise();
  };

  TwainCloud.prototype.getScanners = function getScanners(token) {
    var deferred = $.Deferred();

    if (token) {
      sendRequest('GET', this.config.apiEndpoint + '/scanners', token)
            .then(function (data) {
              // cache scanners
              scanners = data;
              deferred.resolve(data);
            })
            .catch(function (error) {
              log('Unauthorized: ' + JSON.stringify(error));
              deferred.reject(error);
            });
    } else {
      log('Missing authentication token');
      deferred.reject();
    }

    return deferred.promise();
  };

  TwainCloud.prototype.connectEvents = function connectEvents(token, scannerIds) {
    var deferred = $.Deferred();
    var twain = this;

    var sessionEndpoint = this.config.apiEndpoint + '/user';
    sendRequest('GET', sessionEndpoint, token)
      .then(function (data) {
        var brokerInfo = data.eventBroker;

        // close previous mqtt client
        if (eventHub) {
          eventHub.end(true);
          eventHub = null;
        }

        if (brokerInfo) {
          // open a new one
          var mqttUrl = brokerInfo.url;
          eventHub = mqtt.connect(mqttUrl);
          eventHub.on('message', createEventHandler(twain, 'message'));
          eventHub.on('error', createEventHandler(twain, 'error'));
          eventHub.subscribe(brokerInfo.topic);

          for(var i = 0; i < scannerIds.length; ++i) {
            eventHub.subscribe('twain/devices/' + scannerIds[i]);
          }
        }
        
        deferred.resolve(data);
      })
      .catch(function (error) {
        log('Unauthorized: ' + JSON.stringify(error));
        deferred.reject(error);
      });

    return deferred.promise();
  };

  TwainCloud.prototype.deleteScanner = function deleteScanner(token, scannerId) {
    var deferred = $.Deferred();
    var twain = this;

    var scanner = getScannerById(scannerId);
    if (scanner) {
      var deleteScannerEndpoint = this.config.apiEndpoint + '/scanners/' + scanner.id;
      sendRequest('DELETE', deleteScannerEndpoint, token)
        .then(function (data) {
          deferred.resolve();
        })
        .catch(function (error) {
          log('Deletion error: ' + JSON.stringify(error));
          deferred.reject(error);
        });
    }

    return deferred.promise();
  };

  TwainCloud.prototype.on = function on(event, callback) {
    this.handlers[event] = callback;
  };

})();

