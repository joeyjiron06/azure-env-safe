/* eslint-disable global-require */
const LOCAL_SETTINGS_EXAMPLE_PATH = './local.settings.example.json';

function mockExampleJson(mockJson, modulePath = LOCAL_SETTINGS_EXAMPLE_PATH) {
  jest.mock(modulePath, () => mockJson);
}

describe('config', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  it('should succeed when no env vars are missing', async () => {
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

    expect(() => require('./config')).not.toThrow();
  });

  it('should throw an error when env vars are missing', async () => {
    mockExampleJson({
      Values: {
        var1: 'exampleVar1',
        var2: 'exampleVar2',
        var3: 'exampleVar3',
      },
    });

    process.env = {
      var1: 'actualVar1',
    };

    expect(() => require('./config')).toThrow(
      'Missing environment values are not allowed but found that the following variables are empty:\n'
    + 'var2\n'
    + 'var3',
    );
  });
});
