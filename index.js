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

function getSettings(pathToSettings) {
  try {
    const settings = require(pathToSettings);

    if (!settings.Values || typeof settings.Values !== 'object') {
      throw new MissingEnvVarsError(`Settings json at ${pathToSettings} must contain a "Values" object but received:\n${settings.Values}`);
    }

    Object.values(settings.Values).forEach((value) => {
      if (typeof value !== 'string') {
        throw new MissingEnvVarsError(`Settings json at ${pathToSettings} "Values" must only have values which are strings but received:\n${JSON.stringify(settings.Values, null, 2)}`);
      }
    });

    return settings;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new MissingEnvVarsError(`Settings file does not exist. Make sure that the settings file exist at location ${error.moduleName} or that you specified the correct path.`);
    }

    if (error instanceof SyntaxError) {
      throw new MissingEnvVarsError(`Settings file at ${pathToSettings} must be a JSON object.\nError message: ${error.message}`);
    }

    throw error;
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
  const exampleSettings = getSettings(options.example || path.resolve(process.cwd(), 'local.settings.example.json'));
  const missingVars = [];

  Object.keys(exampleSettings.Values).forEach((key) => {
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
  MissingEnvVarsError,
};
