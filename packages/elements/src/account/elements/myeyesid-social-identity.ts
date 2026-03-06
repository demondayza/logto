import { html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import usernameIcon from '../icons/username.svg';

import { MyEyesIDProfileItemElement } from './MyEyesIDProfileItemElement.js';

const tagName = 'myeyesid-social-identity';

@customElement(tagName)
export class MyEyesIDSocialIdentity extends MyEyesIDProfileItemElement {
  static tagName = tagName;

  @property({ type: String })
  target = '';

  protected isAccessible(): boolean {
    return this.accountContext?.userProfile.identities !== undefined;
  }

  protected getItemLabelInfo() {
    // Todo: @xiaoyijun replace with correct label text and icon when related connector API is ready
    return {
      icon: usernameIcon,
      label: this.target,
    };
  }

  protected renderContent(): TemplateResult {
    const { identities } = this.accountContext?.userProfile ?? {};

    const identity = identities?.[this.target];
    // Todo: @xiaoyijun support identifier fallback logic
    const { avatar = '', name = '', email = '' } = identity?.details ?? {};

    return when(
      identity,
      () =>
        html`<myeyesid-identity-info
          slot="content"
          .avatar=${String(avatar)}
          .name=${String(name)}
          .email=${String(email)}
        ></myeyesid-identity-info>`
    );
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: MyEyesIDSocialIdentity;
  }
}
