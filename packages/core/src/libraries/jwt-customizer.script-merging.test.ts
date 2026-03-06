import { MyEyesIDJwtTokenKey } from '@myeyesid/schemas';
import { cond } from '@silverhand/essentials';
import deepmerge from 'deepmerge';

describe('Test the deploy custom JWT script', () => {
  describe('Test script when both AccessToken & ClientCredentials scripts are existing', () => {
    it.each(Object.values(MyEyesIDJwtTokenKey))('test %s script', (key) => {
      expect(
        deepmerge(
          {
            [MyEyesIDJwtTokenKey.AccessToken]: {
              production: `${MyEyesIDJwtTokenKey.AccessToken}-production`,
            },
            [MyEyesIDJwtTokenKey.ClientCredentials]: {
              production: `${MyEyesIDJwtTokenKey.ClientCredentials}-production`,
            },
          },
          {
            [key]: {
              test: `${key}-test`,
            },
          }
        )
      ).toEqual({
        [MyEyesIDJwtTokenKey.AccessToken]: {
          production: `${MyEyesIDJwtTokenKey.AccessToken}-production`,
          ...cond(key === MyEyesIDJwtTokenKey.AccessToken && { test: `${key}-test` }),
        },
        [MyEyesIDJwtTokenKey.ClientCredentials]: {
          production: `${MyEyesIDJwtTokenKey.ClientCredentials}-production`,
          ...cond(key === MyEyesIDJwtTokenKey.ClientCredentials && { test: `${key}-test` }),
        },
      });
    });
  });

  describe('Test script:', () => {
    // Test it.each() can not be nested, so we have to test each key separately.
    it.each(Object.values(MyEyesIDJwtTokenKey))(
      `when ${MyEyesIDJwtTokenKey.AccessToken} script is existing, test $s script`,
      (testingKey) => {
        const existingKey = MyEyesIDJwtTokenKey.AccessToken;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [testingKey]: {
              test: `${testingKey}-test`,
            },
          })
        ).toEqual(
          existingKey === testingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production`,
                  test: `${existingKey}-test`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [testingKey]: {
                  test: `${testingKey}-test`,
                },
              }
        );
      }
    );

    it.each(Object.values(MyEyesIDJwtTokenKey))(
      `when ${MyEyesIDJwtTokenKey.ClientCredentials} script is existing, test $s script`,
      (testingKey) => {
        const existingKey = MyEyesIDJwtTokenKey.ClientCredentials;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [testingKey]: {
              test: `${testingKey}-test`,
            },
          })
        ).toEqual(
          existingKey === testingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production`,
                  test: `${existingKey}-test`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [testingKey]: {
                  test: `${testingKey}-test`,
                },
              }
        );
      }
    );
  });

  describe('Test script when both AccessToken & ClientCredentials scripts are not existing', () => {
    it.each(Object.values(MyEyesIDJwtTokenKey))('test %s script', (key) => {
      expect(
        deepmerge(
          {},
          {
            [key]: `${key}-test`,
          }
        )
      ).toEqual({
        [key]: `${key}-test`,
      });
    });
  });
});

describe('Test deploy custom JWT script', () => {
  describe('Deploy script when both AccessToken & ClientCredentials scripts are existing', () => {
    it.each(Object.values(MyEyesIDJwtTokenKey))('deploy %s script', (key) => {
      expect(
        deepmerge(
          {
            [MyEyesIDJwtTokenKey.AccessToken]: {
              production: `${MyEyesIDJwtTokenKey.AccessToken}-production`,
            },
            [MyEyesIDJwtTokenKey.ClientCredentials]: {
              production: `${MyEyesIDJwtTokenKey.ClientCredentials}-production`,
            },
          },
          {
            [key]: {
              production: `${key}-production-new`,
            },
          }
        )
      ).toEqual({
        [MyEyesIDJwtTokenKey.AccessToken]: {
          production: `${MyEyesIDJwtTokenKey.AccessToken}-production${
            key === MyEyesIDJwtTokenKey.AccessToken ? '-new' : ''
          }`,
        },
        [MyEyesIDJwtTokenKey.ClientCredentials]: {
          production: `${MyEyesIDJwtTokenKey.ClientCredentials}-production${
            key === MyEyesIDJwtTokenKey.ClientCredentials ? '-new' : ''
          }`,
        },
      });
    });
  });

  describe('Deploy script:', () => {
    // Test it.each() can not be nested, so we have to test each key separately.
    it.each(Object.values(MyEyesIDJwtTokenKey))(
      `when ${MyEyesIDJwtTokenKey.AccessToken} script is existing, deploy $s script`,
      (deployingKey) => {
        const existingKey = MyEyesIDJwtTokenKey.AccessToken;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [deployingKey]: {
              production: `${deployingKey}-production-new`,
            },
          })
        ).toEqual(
          existingKey === deployingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production-new`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [deployingKey]: {
                  production: `${deployingKey}-production-new`,
                },
              }
        );
      }
    );

    it.each(Object.values(MyEyesIDJwtTokenKey))(
      `when ${MyEyesIDJwtTokenKey.ClientCredentials} script is existing, deploy $s script`,
      (deployingKey) => {
        const existingKey = MyEyesIDJwtTokenKey.ClientCredentials;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [deployingKey]: {
              production: `${deployingKey}-production-new`,
            },
          })
        ).toEqual(
          existingKey === deployingKey
            ? {
                [existingKey]: {
                  production: `${existingKey}-production-new`,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [deployingKey]: {
                  production: `${deployingKey}-production-new`,
                },
              }
        );
      }
    );
  });

  describe('Deploy script when both AccessToken & ClientCredentials scripts are not existing', () => {
    it.each(Object.values(MyEyesIDJwtTokenKey))('deploy %s script', (key) => {
      expect(
        deepmerge(
          {},
          {
            [key]: {
              production: `${key}-production-new`,
            },
          }
        )
      ).toEqual({
        [key]: {
          production: `${key}-production-new`,
        },
      });
    });
  });
});

describe('Test undeploy custom JWT script', () => {
  describe('Undeploy script when both AccessToken & ClientCredentials scripts are existing', () => {
    it.each(Object.values(MyEyesIDJwtTokenKey))('undeploy %s script', (key) => {
      expect(
        deepmerge(
          {
            [MyEyesIDJwtTokenKey.AccessToken]: {
              production: `${MyEyesIDJwtTokenKey.AccessToken}-production`,
            },
            [MyEyesIDJwtTokenKey.ClientCredentials]: {
              production: `${MyEyesIDJwtTokenKey.ClientCredentials}-production`,
            },
          },
          {
            [key]: {
              production: undefined,
            },
          }
        )
      ).toEqual({
        [MyEyesIDJwtTokenKey.AccessToken]: {
          production:
            key === MyEyesIDJwtTokenKey.AccessToken
              ? undefined
              : `${MyEyesIDJwtTokenKey.AccessToken}-production`,
        },
        [MyEyesIDJwtTokenKey.ClientCredentials]: {
          production:
            key === MyEyesIDJwtTokenKey.ClientCredentials
              ? undefined
              : `${MyEyesIDJwtTokenKey.ClientCredentials}-production`,
        },
      });
    });
  });

  describe('Undeploy script:', () => {
    // Test it.each() can not be nested, so we have to test each key separately.
    it.each(Object.values(MyEyesIDJwtTokenKey))(
      `when ${MyEyesIDJwtTokenKey.AccessToken} script is existing, undeploy $s script`,
      (undeployingKey) => {
        const existingKey = MyEyesIDJwtTokenKey.AccessToken;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [undeployingKey]: {
              production: undefined,
            },
          })
        ).toEqual(
          existingKey === undeployingKey
            ? {
                [existingKey]: {
                  production: undefined,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [undeployingKey]: {
                  production: undefined,
                },
              }
        );
      }
    );

    it.each(Object.values(MyEyesIDJwtTokenKey))(
      `when ${MyEyesIDJwtTokenKey.ClientCredentials} script is existing, undeploy $s script`,
      (undeployingKey) => {
        const existingKey = MyEyesIDJwtTokenKey.ClientCredentials;
        const existingScript = {
          [existingKey]: {
            production: `${existingKey}-production`,
          },
        };
        expect(
          deepmerge(existingScript, {
            [undeployingKey]: {
              production: undefined,
            },
          })
        ).toEqual(
          existingKey === undeployingKey
            ? {
                [existingKey]: {
                  production: undefined,
                },
              }
            : {
                [existingKey]: {
                  production: `${existingKey}-production`,
                },
                [undeployingKey]: {
                  production: undefined,
                },
              }
        );
      }
    );
  });
});
