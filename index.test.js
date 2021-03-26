/* eslint-disable global-require */
const path = require('path');

const LOCAL_SETTINGS_EXAMPLE_PATH = './local.settings.example.json';

describe('config', () => {
  let config;
  beforeEach(() => {
    jest.resetModules();

    process.env = {};

    config = require('./index').config;
  });

  it('should succeed when all environment variables exist in process.env', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => ({
      Values: {
        var1: 'exampleVar1',
        var2: 'exampleVar2',
        var3: 'exampleVar3',
      },
    }));

    process.env = {
      var1: 'actualVar1',
      var2: 'actualVar2',
      var3: 'actualVar3',
    };

    expect(() => config()).not.toThrow();
  });

  it('should succeed when using a custom example file and all variables exist in process.env', async () => {
    jest.mock('./local.settings.custom.json', () => ({
      Values: {
        var3: 'exampleVar3',
        var4: 'exampleVar4',
        var5: 'exampleVar5',
      },
    }));

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config({ example: './local.settings.custom.json' })).not.toThrow();
  });

  it('should throw an error when environment variables are missing', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => ({
      Values: {
        var1: 'var1',
        var2: 'var2',
        var3: 'var3',
        var4: 'var4',
      },
    }));

    process.env = {
      var1: 'var1',
      var2: 'var2',
    };

    expect(() => config()).toThrow(`Missing environment values are not allowed but found that the following variables are empty:\n${['var3', 'var4'].join('\n')}`);
  });

  it('should throw an error when default example file does not exist', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => {
      const error = new Error('mock module not found');
      error.moduleName = './local.settings.example.json';
      error.code = 'MODULE_NOT_FOUND';
      throw error;
    });

    expect(() => config()).toThrow(new RegExp('Settings file does not exist. Make sure that the settings file exist at location .* or that you specified the correct path.'));
  });

  it('should throw an error when custom example file does not exist', async () => {
    expect(() => config({
      example: './someFileThatDoesNotExist.js',
    })).toThrow(new RegExp('Settings file does not exist. Make sure that the settings file exist at location .* or that you specified the correct path.'));
  });

  it('should throw an error when example json is not a json object', async () => {
    const example = './local.settings.invalid.json';
    expect(() => config({
      example,
    })).toThrow(
      `Settings file at ${example} must be a JSON object.\n`
    + 'Error message: Unexpected token i in JSON at position 0',
    );
  });

  it('should throw an error when example json "Values" is undefined', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => ({
      ShouldBeValues: {
        var3: 'exampleVar3',
        var4: 'exampleVar4',
        var5: 'exampleVar5',
      },
    }));

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config()).toThrow(`Settings json at ${path.resolve(LOCAL_SETTINGS_EXAMPLE_PATH)} must contain a "Values" object but received:\nundefined`);
  });

  it('should throw an error when example json "Values" is null', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => ({
      Values: null,
    }));

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config()).toThrow(`Settings json at ${path.resolve(LOCAL_SETTINGS_EXAMPLE_PATH)} must contain a "Values" object but received:\nnull`);
  });

  it('should throw an error when example json "Values" is not an object', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => ({
      Values: 1234, // number here, should be an object an error out
    }));

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config()).toThrow(`Settings json at ${path.resolve(LOCAL_SETTINGS_EXAMPLE_PATH)} must contain a "Values" object but received:\n1234`);
  });

  it('should throw an error when example json has values that are not strings', async () => {
    jest.mock(LOCAL_SETTINGS_EXAMPLE_PATH, () => ({
      Values: {
        var1: 'exampleVar1',
        var2: 1234, // should not be a number and should throw an error
      },
    }));

    process.env = {
      var1: 'actualVar3',
      var2: 'actualVar4',
    };

    expect(() => config()).toThrow(`Settings json at ${path.resolve(LOCAL_SETTINGS_EXAMPLE_PATH)} "Values" must only have values which are strings but received:\n${JSON.stringify({
      var1: 'exampleVar1',
      var2: 1234, // should not be a number and should throw an error
    }, null, 2)}`);
  });
});
