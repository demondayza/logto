import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import fallbackAvatar from '../icons/fallback-avatar.svg';

const tagName = 'myeyesid-identity-info';

@customElement(tagName)
export class MyEyesIDIdentityInfo extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--myeyesid-spacing-sm);
    }

    .avatar {
      --myeyesid-icon-size: var(--myeyesid-identity-info-avatar-size, 36px);

      > img {
        display: block;
        width: var(--myeyesid-identity-info-avatar-size, 36px);
        height: var(--myeyesid-identity-info-avatar-size, 36px);
        border-radius: var(--myeyesid-identity-info-avatar-shape, var(--myeyesid-shape-corner-md));
      }
    }

    .info {
      flex: 1;
      flex-direction: column;

      .name {
        font: var(--myeyesid-identity-info-name-font-size, var(--myeyesid-font-body-md));
        color: var(
          --myeyesid-identity-info-name-color,
          var(--myeyesid-color---myeyesid-color-typeface-primary)
        );
      }

      .email {
        font: var(--myeyesid-identity-info-email-font, var(--myeyesid-font-body-sm));
        color: var(
          --myeyesid-identity-info-email-color,
          var(--myeyesid-color---myeyesid-color-typeface-primary)
        );
      }
    }
  `;

  @property({ type: String })
  avatar = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  email = '';

  @state()
  failedToLoadAvatar = false;

  render() {
    return html`
      <div class="avatar">
        ${this.avatar && !this.failedToLoadAvatar
          ? html`<img src="${this.avatar}" alt="user avatar" @error=${this.handleAvatarError} />`
          : html`<myeyesid-icon>${fallbackAvatar}</myeyesid-icon>`}
      </div>
      <div class="info">
        <div class="name">${this.name}</div>
        <div class="email">${this.email}</div>
      </div>
    `;
  }

  private handleAvatarError() {
    this.failedToLoadAvatar = true;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: MyEyesIDIdentityInfo;
  }
}
