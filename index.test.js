const { config } = require('./index');

const LOCAL_SETTINGS_EXAMPLE_PATH = './local.settings.example.json';

function mockExampleJson(mockJson, modulePath = LOCAL_SETTINGS_EXAMPLE_PATH) {
  jest.mock(modulePath, () => mockJson);
}

describe('config', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  it('should succeed when all environment variables exist in process.env', async () => {
    mockExampleJson({
      Values: {
        var1: 'exampleVar1',
        var2: 'exampleVar2',
        var3: 'exampleVar3',
      },
    });

    process.env = {
      var1: 'actualVar1',
      var2: 'actualVar2',
      var3: 'actualVar3',
    };

    expect(() => config()).not.toThrow();
  });

  it('should succeed when using a custom example file and all variables exist in process.env', async () => {
    const example = './local.settings.custom.json';
    mockExampleJson({
      Values: {
        var3: 'exampleVar3',
        var4: 'exampleVar4',
        var5: 'exampleVar5',
      },
    }, example);

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config({ example })).not.toThrow();
  });

  it('should throw an error when environment variables are missing', async () => {
    mockExampleJson({
      Values: {
        var1: 'var1',
        var2: 'var2',
        var3: 'var3',
        var4: 'var4',
      },
    });

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

    expect(() => config()).toThrow(new RegExp('Example file does not exist. Make sure that the example file exist at location .* or that you specified the correct example path.'));
  });

  it('should throw an error when custom example file does not exist', async () => {
    expect(() => config({
      example: './someFileThatDoesNotExist.js',
    })).toThrow(new RegExp('Example file does not exist. Make sure that the example file exist at location .* or that you specified the correct example path.'));
  });

  it('should throw an error when example json is not a json object', async () => {
    const example = './local.settings.invalid.json';
    expect(() => config({
      example,
    })).toThrow(
      `Example file ${example} must be a JSON object.\n`
    + 'Error message: Unexpected token i in JSON at position 0',
    );
  });

  it('should throw an error when example json "Values" is undefined', async () => {
    const mockJson = {
      ShouldBeValues: {
        var3: 'exampleVar3',
        var4: 'exampleVar4',
        var5: 'exampleVar5',
      },
    };
    mockExampleJson(mockJson);

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config()).toThrow('Example json must contain a "Values" object but received:\nundefined');
  });

  it('should throw an error when example json "Values" is null', async () => {
    const mockJson = {
      Values: null,
    };
    mockExampleJson(mockJson);

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config()).toThrow('Example json must contain a "Values" object but received:\nnull');
  });

  it('should throw an error when example json "Values" is not an object', async () => {
    const mockJson = {
      Values: 1234, // number here, should be an object an error out
    };
    mockExampleJson(mockJson);

    process.env = {
      var3: 'actualVar3',
      var4: 'actualVar4',
      var5: 'actualVar5',
    };

    expect(() => config()).toThrow(`Example json must contain a "Values" object but received:\n${mockJson.Values}`);
  });

  it('should throw an error when example json has values that are not strings', async () => {
    const mockJson = {
      Values: {
        var1: 'exampleVar1',
        var2: 1234, // should not be a number and should throw an error
      },
    };
    mockExampleJson(mockJson);

    process.env = {
      var1: 'actualVar3',
      var2: 'actualVar4',
    };

    expect(() => config()).toThrow(`Example json "Values" must only have values which are strings but received:\n${JSON.stringify(mockJson.Values, null, 2)}`);
  });
});
