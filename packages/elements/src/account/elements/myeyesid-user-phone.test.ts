import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { type MyEyesIDAccountProvider } from '../providers/myeyesid-account-provider.js';

import { MyEyesIDUserPhone } from './myeyesid-user-phone.js';

suite('myeyesid-user-phone', () => {
  test('is defined', () => {
    const element = document.createElement(MyEyesIDUserPhone.tagName);
    assert.instanceOf(element, MyEyesIDUserPhone);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<MyEyesIDUserPhone>(html`<myeyesid-user-phone></myeyesid-user-phone>`);
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render phone number if the user has permission to view phone information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryPhone: '12025550179',
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-user-phone></myeyesid-user-phone>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const myeyesidUserPhone = provider.querySelector<MyEyesIDUserPhone>(MyEyesIDUserPhone.tagName);

    await waitUntil(
      () =>
        myeyesidUserPhone?.shadowRoot?.querySelector('div[slot="content"]')?.textContent ===
        '+1 202 555 0179',
      'Unable to get phone number from account context'
    );
  });

  test('should render nothing if the user lacks permission to view phone information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        primaryPhone: undefined,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-user-phone></myeyesid-user-phone>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;
    const myeyesidUserPhone = provider.querySelector<MyEyesIDUserPhone>(MyEyesIDUserPhone.tagName);

    await myeyesidUserPhone?.updateComplete;
    assert.equal(myeyesidUserPhone?.shadowRoot?.children.length, 0);
  });
});
