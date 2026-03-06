import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type MyEyesIDAccountProvider } from '../providers/myeyesid-account-provider.js';

import { MyEyesIDAccountCenter } from './myeyesid-account-center.js';

suite('myeyesid-account-center', () => {
  test('is defined', () => {
    const element = document.createElement(MyEyesIDAccountCenter.tagName);
    assert.instanceOf(element, MyEyesIDAccountCenter);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<MyEyesIDAccountCenter>(
      html`<myeyesid-account-center></myeyesid-account-center>`
    );
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent.trim(), 'Unable to retrieve account context.');
  });

  test('should render components correctly based on user info', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        username: 'testuser',
        primaryEmail: 'test@example.com',
        primaryPhone: '1234567890',
        hasPassword: true,
        identities: {
          google: {
            userId: 'google-123',
            details: { name: 'John Doe', email: 'john@example.com' },
          },
          facebook: {
            userId: 'facebook-123',
            details: { name: 'Jane Doe', email: 'jane@example.com' },
          },
        },
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-account-center></myeyesid-account-center>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const accountCenter = provider.querySelector<MyEyesIDAccountCenter>(MyEyesIDAccountCenter.tagName);
    await accountCenter?.updateComplete;

    await waitUntil(() => {
      const shadowRoot = accountCenter?.shadowRoot;
      return (
        shadowRoot?.querySelector('myeyesid-username') &&
        shadowRoot.querySelector('myeyesid-user-email') &&
        shadowRoot.querySelector('myeyesid-user-phone') &&
        shadowRoot.querySelector('myeyesid-user-password') &&
        shadowRoot.querySelectorAll('myeyesid-social-identity').length === 2
      );
    }, 'Unable to render all expected components');
  });

  test('should only render components for existing user info', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        username: 'testuser',
        primaryEmail: undefined,
        primaryPhone: undefined,
        hasPassword: undefined,
        identities: {},
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-account-center></myeyesid-account-center>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const accountCenter = provider.querySelector<MyEyesIDAccountCenter>(MyEyesIDAccountCenter.tagName);
    await accountCenter?.updateComplete;

    const shadowRoot = accountCenter?.shadowRoot;
    assert.exists(shadowRoot?.querySelector('myeyesid-username'));
    assert.notExists(shadowRoot.querySelector('myeyesid-user-email'));
    assert.notExists(shadowRoot.querySelector('myeyesid-user-phone'));
    assert.notExists(shadowRoot.querySelector('myeyesid-user-password'));
    assert.notExists(shadowRoot.querySelector('myeyesid-social-identity'));
  });
});
