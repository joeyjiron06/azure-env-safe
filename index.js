/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');

class MissingEnvVarsError extends Error {
  constructor(...args) {
    super(...args);

    Error.captureStackTrace(this, this.constructor);

    this.name = 'MissingEnvVarsError';
  }
}

function getExample(pathToExampleSettings) {
  try {
    return require(pathToExampleSettings);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new MissingEnvVarsError(`Example file does not exist. Make sure that the example file exist at location ${error.moduleName} or that you specified the correct example path.`);
    }

    if (error instanceof SyntaxError) {
      throw new MissingEnvVarsError(`Example file ${pathToExampleSettings} must be a JSON object.\nError message: ${error.message}`);
    }

    throw error;
  }
}

function getLocalSettings(pathToLocalSettings) {
  try {
    return require(pathToLocalSettings);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new MissingEnvVarsError(`Local settings file ${pathToLocalSettings} must be a JSON object.\nError message: ${error.message}`);
    }

    return undefined;
  }
}

/**
 * Configure the environment with the specified options
 *
 * @param {object} options
 * @param {string} options.example - path to the example file
 * @param {string} options.path - path to the local.settings.json file to load environment variables
 */
function config(options = {}) {
  const debug = (...args) => options.debug && console.debug(...args);

  debug('process.env before anything', process.env);

  const example = options.example || './local.settings.example.json';
  const localSettingsPath = options.path || path.resolve(process.cwd(), 'local.settings.json');

  const exampleJSON = getExample(example);
  const localSettings = getLocalSettings(localSettingsPath, debug);
  const missingVars = [];

  if (!exampleJSON.Values || typeof exampleJSON.Values !== 'object') {
    throw new MissingEnvVarsError(`Example json must contain a "Values" object but received:\n${exampleJSON.Values}`);
  }

  if (localSettings) {
    debug('found localSettings', localSettings);

    if (!localSettings.Values || typeof localSettings.Values !== 'object') {
      throw new MissingEnvVarsError(`Local settings json must contain a "Values" object but received:\n${localSettings.Values}`);
    }

    Object.keys(localSettings.Values).forEach((key) => {
      if (typeof localSettings.Values[key] !== 'string') {
        throw new MissingEnvVarsError(`Local settings json "Values" must only have values which are strings but received:\n${JSON.stringify(localSettings.Values, null, 2)}`);
      }

      if (!process.env[key]) {
        process.env[key] = localSettings.Values[key];
      }
    });
  }

  debug('process.env after localSettings loaded', process.env);

  Object.keys(exampleJSON.Values).forEach((key) => {
    if (typeof exampleJSON.Values[key] !== 'string') {
      throw new MissingEnvVarsError(`Example json "Values" must only have values which are strings but received:\n${JSON.stringify(exampleJSON.Values, null, 2)}`);
    }

    if (!process.env[key]) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    throw new MissingEnvVarsError(`Missing environment values are not allowed but found that the following variables are empty:\n${missingVars.join('\n')}`);
  }
}

module.exports = {
  config,
};
