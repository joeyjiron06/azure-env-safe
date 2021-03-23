/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

class MissingEnvVarsError extends Error {
  constructor(...args) {
    super(...args);

    Error.captureStackTrace(this, this.constructor);

    this.name = 'MissingEnvVarsError';
  }
}

function getExample(path) {
  try {
    return require(path);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new MissingEnvVarsError(`Example file does not exist. Make sure that the example file exist at location ${error.moduleName} or that you specified the correct example path.`);
    }

    if (error instanceof SyntaxError) {
      throw new MissingEnvVarsError(`Example file ${path} must be a JSON object.\nError message: ${error.message}`);
    }

    throw error;
  }
}

/**
 * Configure the environment with the specified options
 *
 * @param {object} options
 * @param {string} options.example - path to the example file
 */
function config(options = {}) {
  const example = options.example || './local.settings.example.json';
  const exampleJSON = getExample(example);
  const missingVars = [];

  if (!exampleJSON.Values || typeof exampleJSON.Values !== 'object') {
    throw new MissingEnvVarsError(`Example json must contain a "Values" object but received:\n${exampleJSON.Values}`);
  }

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
