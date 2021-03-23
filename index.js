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

function getLocalSettings() {
  try {
    const pathToLocalSettings = path.resolve(process.cwd(), 'local.settings.json');
    return require(pathToLocalSettings);
  } catch (error) {
    return undefined;
  }
}

/**
 * Configure the environment with the specified options
 *
 * @param {object} options
 * @param {string} options.example - path to the example file
 */
function config(options = {}) {
  const debug = (...args) => options.debug && console.debug(...args);

  debug('process.env before anything', process.env);

  const example = options.example || './local.settings.example.json';
  const exampleJSON = getExample(example);
  const localSettings = getLocalSettings();
  const missingVars = [];

  if (!exampleJSON.Values || typeof exampleJSON.Values !== 'object') {
    throw new MissingEnvVarsError(`Example json must contain a "Values" object but received:\n${exampleJSON.Values}`);
  }

  debug('found localSettings', localSettings);

  Object.keys(localSettings.Values).forEach((key) => {
    process.env[key] = localSettings.Values[key];
  });

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
