import { html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import phoneIcon from '../icons/phone.svg';
import { formatToInternationalPhoneNumber } from '../utils/format.js';

import { MyEyesIDProfileItemElement } from './MyEyesIDProfileItemElement.js';

const tagName = 'myeyesid-user-phone';

@customElement(tagName)
export class MyEyesIDUserPhone extends MyEyesIDProfileItemElement {
  static tagName = tagName;

  protected isAccessible(): boolean {
    return this.accountContext?.userProfile.primaryPhone !== undefined;
  }

  protected getItemLabelInfo() {
    return {
      icon: phoneIcon,
      label: 'Phone number',
    };
  }

  protected renderContent(): TemplateResult {
    const { primaryPhone } = this.accountContext?.userProfile ?? {};
    return when(
      primaryPhone,
      (phone) => html`<div slot="content">${formatToInternationalPhoneNumber(phone)}</div>`
    );
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: MyEyesIDUserPhone;
  }
}
