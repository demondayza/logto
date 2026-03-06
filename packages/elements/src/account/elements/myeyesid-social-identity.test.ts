import { assert, fixture, html, waitUntil } from '@open-wc/testing';

import { createMockAccountApi } from '../__mocks__/account-api.js';
import { MyEyesIDIdentityInfo } from '../components/myeyesid-identity-info.js';
import { type MyEyesIDAccountProvider } from '../providers/myeyesid-account-provider.js';

import { MyEyesIDSocialIdentity } from './myeyesid-social-identity.js';

suite('myeyesid-social-identity', () => {
  test('is defined', () => {
    const element = document.createElement(MyEyesIDSocialIdentity.tagName);
    assert.instanceOf(element, MyEyesIDSocialIdentity);
  });

  test('should render error message when account context is not available', async () => {
    const element = await fixture<MyEyesIDSocialIdentity>(
      html`<myeyesid-social-identity></myeyesid-social-identity>`
    );
    await element.updateComplete;

    assert.equal(element.shadowRoot?.textContent, 'Unable to retrieve account context.');
  });

  test('should render correctly when user has permission to view social identity information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        identities: {
          github: {
            userId: '123',
            details: {
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-social-identity target="github"></myeyesid-social-identity>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const myeyesidSocialIdentity = provider.querySelector<MyEyesIDSocialIdentity>(
      MyEyesIDSocialIdentity.tagName
    );

    const identityInfo = myeyesidSocialIdentity?.shadowRoot?.querySelector<MyEyesIDIdentityInfo>(
      MyEyesIDIdentityInfo.tagName
    );

    await waitUntil(
      () =>
        identityInfo?.shadowRoot?.querySelector('div[class=name]')?.textContent === 'John Doe' &&
        identityInfo.shadowRoot.querySelector('div[class=email]')?.textContent ===
          'john@example.com',
      'Unable to get social identity information from account context'
    );
  });

  test('should render nothing if the user lacks permission to view social identity information', async () => {
    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        identities: undefined,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <myeyesid-social-identity target="github" labelText="GitHub"></myeyesid-social-identity>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;
    const myeyesidSocialIdentity = provider.querySelector<MyEyesIDSocialIdentity>(
      MyEyesIDSocialIdentity.tagName
    );

    await myeyesidSocialIdentity?.updateComplete;
    assert.equal(myeyesidSocialIdentity?.shadowRoot?.children.length, 0);
  });
});
