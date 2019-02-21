'use strict';

const util = require('util');
const processLogLevel = 5;

const logLevels = {
  off: 0,
  critical: 1,
  error: 2,
  warn: 3,
  info: 4,
  debug: 5
};

/**
 * Simple logger that should be used for all diagnostic messages.
 * @param {string} moduleName Name of the module that uses logger instance.
 * @constructor
 */
const Logger = function(moduleName) {
  const debugLogFunction = require('debug')(moduleName);
  const debugEnabled = debugLogFunction.enabled;

  const logFunction = debugLogFunction.enabled ? debugLogFunction : console.log;

  const createLogger = function(level) {
    const loggerLevel = logLevels[level];
    
    return function (...args) {
      // log only what is necessary
      if (loggerLevel <= processLogLevel) {
        const prefix = debugEnabled ? `[${level}]` : `[${moduleName}] [${level}]`;
        const message = util.format.apply(null, args);

        logFunction(`${prefix} ${message}`);
      }
    };
  }
 
  /**
   * Writes error message to the log.
   */
  this.critical = createLogger('critical');

  /**
   * Writes error message to the log.
   */
  this.error = createLogger('error');

  /**
   * Writes warning message to the log.
   */
  this.warn = createLogger('warn');

  /**
   * Writes info message to the log.
   */
  this.info = createLogger('info');

  /**
   * Writes debug message to the log.
   */
  this.debug = createLogger('debug');

  /**
   * Measures execution time of provided lambda and writes
   * this information to the log.
   */
  this.scope = function (...args) {
    const body = args.pop();
    const start = process.hrtime();
    const me = this;

    const isPromise = function(obj) {
      return obj && typeof obj.then === 'function';
    };

    const stopTimer = function() {
      const end = process.hrtime(start);
      const ms = end[1] / 1000000; // divide by a million to get nano to milli

      const scopeName = util.format.apply(null, args);
      me.info.apply(null, [
        {
          scope: scopeName,
          duration: `${end[0]}s, ${ms.toFixed(3)}ms` // s.ms
        }
      ]);
    };

    let result = null;
    try {
      result = isPromise(body) ? body : body();
    } 
    finally {
      if (isPromise(result)) {
        // wrap the result promise to record execution time
        result = result
          .catch(err => {
            stopTimer();
            throw err;
          })
          .then(data => {
            stopTimer();

            return data;
          });
      } 
      else {
        stopTimer();
      }
    }

    return result;
  };
}

module.exports = function(moduleName) {
  return new Logger(moduleName);
};