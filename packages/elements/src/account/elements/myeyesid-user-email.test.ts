import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type MyEyesIDAccountProvider } from '../providers/myeyesid-account-provider.js';

import { MyEyesIDUserEmail } from './myeyesid-user-email.js';

suite('myeyesid-user-email', () => {
  test('is defined', () => {
    const element = document.createElement(MyEyesIDUserEmail.tagName);
    assert.instanceOf(element, MyEyesIDUserEmail);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<MyEyesIDUserEmail>(html`<myeyesid-user-email></myeyesid-user-email>`);
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render email if the user has permission to view email information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryEmail: 'user@example.com',
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-user-email></myeyesid-user-email>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const myeyesidUserEmail = provider.querySelector<MyEyesIDUserEmail>(MyEyesIDUserEmail.tagName);

    await waitUntil(
      () =>
        myeyesidUserEmail?.shadowRoot?.querySelector('div[slot="content"]')?.textContent ===
        'user@example.com',
      'Unable to get email from account context'
    );
  });

  test('should render nothing if the user lacks permission to view email information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryEmail: undefined,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-user-email></myeyesid-user-email>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;
    const myeyesidUserEmail = provider.querySelector<MyEyesIDUserEmail>(MyEyesIDUserEmail.tagName);

    await myeyesidUserEmail?.updateComplete;
    assert.equal(myeyesidUserEmail?.shadowRoot?.children.length, 0);
  });
});
