import { consume } from '@lit/context';
import { assert, fixture, html, nextFrame, waitUntil } from '@open-wc/testing';
import { type Optional } from '@silverhand/essentials';
import { LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { createMockAccountApi } from '../__mocks__/account-api.js';

import {
  myeyesidAccountContext,
  type MyEyesIDAccountContextType,
  MyEyesIDAccountProvider,
} from './myeyesid-account-provider.js';

@customElement('test-myeyesid-account-provider-consumer')
export class TestMyEyesIDAccountProviderConsumer extends LitElement {
  @consume({ context: myeyesidAccountContext, subscribe: true })
  @property({ attribute: false })
  accountContext?: MyEyesIDAccountContextType;

  render() {
    if (!this.accountContext) {
      return nothing;
    }

    return html`<div id="user-id">${this.accountContext.userProfile.id}</div>`;
  }
}

suite('myeyesid-account-provider', () => {
  test('is defined', () => {
    const element = document.createElement('myeyesid-account-provider');
    assert.instanceOf(element, MyEyesIDAccountProvider);
  });

  test('should render not initialized content when account api is not provided', async () => {
    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider></myeyesid-account-provider>`
    );

    await provider.updateComplete;

    assert.equal(
      provider.shadowRoot?.textContent,
      `${MyEyesIDAccountProvider.tagName} not initialized.`
    );
  });

  test('should correctly consume myeyesid account provider context', async () => {
    const testUserId = '123';

    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => ({
        id: testUserId,
      }),
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <test-myeyesid-account-provider-consumer></test-myeyesid-account-provider-consumer>
      </myeyesid-account-provider>`
    );

    await provider.updateComplete;

    const consumer = provider.querySelector<TestMyEyesIDAccountProviderConsumer>(
      'test-myeyesid-account-provider-consumer'
    )!;

    await waitUntil(
      () => consumer.shadowRoot?.querySelector('#user-id')?.textContent === testUserId,
      'Unable to get user data from account context'
    );
  });

  test('should render error content and dispatch error event when initialize failed', async () => {
    const errorMessage = 'Failed to fetch user profile';
    // eslint-disable-next-line @silverhand/fp/no-let
    let dispatchedErrorEvent: Optional<ErrorEvent>;

    const mockAccountApi = createMockAccountApi({
      fetchUserProfile: async () => {
        // Simulate network delay
        await nextFrame();
        throw new Error(errorMessage);
      },
    });

    const provider = await fixture<MyEyesIDAccountProvider>(
      html`<myeyesid-account-provider .accountApi=${mockAccountApi}>
        <test-myeyesid-account-provider-consumer></test-myeyesid-account-provider-consumer>
      </myeyesid-account-provider>`
    );

    provider.addEventListener('error', (event) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      dispatchedErrorEvent = event;
    });

    await provider.updateComplete;

    await waitUntil(
      () => provider.shadowRoot?.textContent === `${MyEyesIDAccountProvider.tagName}: ${errorMessage}`
    );

    assert.equal(dispatchedErrorEvent?.error.message, errorMessage);
  });
});
