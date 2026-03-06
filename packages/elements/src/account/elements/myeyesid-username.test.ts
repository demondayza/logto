import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type MyEyesIDAccountProvider } from '../providers/myeyesid-account-provider.js';

import { MyEyesIDUsername } from './myeyesid-username.js';

const fakeMyEyesIDEndpoint = 'https://myeyesid.dev';

suite('myeyesid-username', () => {
  test('is defined', () => {
    const element = document.createElement(MyEyesIDUsername.tagName);
    assert.instanceOf(element, MyEyesIDUsername);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<MyEyesIDUsername>(html`<myeyesid-username></myeyesid-username>`);
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render username if the user has permission to view username information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        username: 'test_username',
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-username></myeyesid-username>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const myeyesidUsername = provider.querySelector<MyEyesIDUsername>(MyEyesIDUsername.tagName);

    await waitUntil(
      () =>
        myeyesidUsername?.shadowRoot?.querySelector('div[slot="content"]')?.textContent ===
        'test_username',
      'Unable to get username from account context'
    );
  });

  test('should render nothing if the user lacks permission to view username information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        username: undefined,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-username></myeyesid-username>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;
    const myeyesidUsername = provider.querySelector<MyEyesIDUsername>(MyEyesIDUsername.tagName);

    await myeyesidUsername?.updateComplete;
    assert.equal(myeyesidUsername?.shadowRoot?.children.length, 0);
  });
});
