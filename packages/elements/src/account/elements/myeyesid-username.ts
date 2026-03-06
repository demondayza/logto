import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import usernameIcon from '../icons/username.svg';

import { MyEyesIDProfileItemElement } from './MyEyesIDProfileItemElement.js';

const tagName = 'myeyesid-username';

@customElement(tagName)
export class MyEyesIDUsername extends MyEyesIDProfileItemElement {
  static tagName = tagName;

  protected isAccessible() {
    return this.accountContext?.userProfile.username !== undefined;
  }

  protected getItemLabelInfo() {
    return { icon: usernameIcon, label: 'Username' };
  }

  protected renderContent(): TemplateResult {
    const { username } = this.accountContext?.userProfile ?? {};

    return when(username, (_username) => html`<div slot="content">${_username}</div>`);
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: MyEyesIDUsername;
  }
}
