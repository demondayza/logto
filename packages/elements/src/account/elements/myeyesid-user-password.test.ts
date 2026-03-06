import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type MyEyesIDAccountProvider } from '../providers/myeyesid-account-provider.js';

import { MyEyesIDUserPassword } from './myeyesid-user-password.js';

suite('myeyesid-user-password', () => {
  test('is defined', () => {
    const element = document.createElement(MyEyesIDUserPassword.tagName);
    assert.instanceOf(element, MyEyesIDUserPassword);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<MyEyesIDUserPassword>(
      html`<myeyesid-user-password></myeyesid-user-password>`
    );
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render configured status when user has password', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        hasPassword: true,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-user-password></myeyesid-user-password>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const myeyesidUserPassword = provider.querySelector<MyEyesIDUserPassword>(MyEyesIDUserPassword.tagName);

    await waitUntil(
      () =>
        myeyesidUserPassword?.shadowRoot?.querySelector('.status')?.textContent.includes('Configured'),
      'Unable to get password status from account context'
    );
  });

  test('should not render status when user has no password', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        hasPassword: false,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-user-password></myeyesid-user-password>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;
    const myeyesidUserPassword = provider.querySelector<MyEyesIDUserPassword>(MyEyesIDUserPassword.tagName);

    await myeyesidUserPassword?.updateComplete;
    assert.isNull(myeyesidUserPassword?.shadowRoot?.querySelector('.status'));
  });
});
