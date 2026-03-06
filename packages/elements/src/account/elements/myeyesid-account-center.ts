import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import {
  myeyesidAccountContext,
  type MyEyesIDAccountContextType,
} from '../providers/myeyesid-account-provider.js';

const tagName = 'myeyesid-account-center';

@customElement(tagName)
export class MyEyesIDAccountCenter extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--myeyesid-account-center-item-spacing, var(--myeyesid-spacing-md));
    }
  `;

  @consume({ context: myeyesidAccountContext, subscribe: true })
  private readonly accountContext?: MyEyesIDAccountContextType;

  render() {
    if (!this.accountContext) {
      return html`<span>Unable to retrieve account context.</span>`;
    }

    const {
      userProfile: { username, primaryEmail, primaryPhone, hasPassword, identities },
    } = this.accountContext;

    return html`
      ${username !== undefined && html`<myeyesid-username></myeyesid-username>`}
      ${primaryEmail !== undefined && html`<myeyesid-user-email></myeyesid-user-email>`}
      ${primaryPhone !== undefined && html`<myeyesid-user-phone></myeyesid-user-phone>`}
      ${hasPassword !== undefined && html`<myeyesid-user-password></myeyesid-user-password>`}
      ${identities !== undefined &&
      Object.entries(identities).map(
        ([target]) => html`<myeyesid-social-identity target=${target}></myeyesid-social-identity>`
      )}
    `;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: MyEyesIDAccountCenter;
  }
}
