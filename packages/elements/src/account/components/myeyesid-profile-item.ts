import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

const tagName = 'myeyesid-profile-item';

/**
 * MyEyesIDProfileItem: A custom element for displaying profile information
 *
 * It provides a consistent layout and styling for profile-related items
 *
 * Example usage:
 *
 * <myeyesid-profile-item>
 *   <myeyesid-icon slot="label-icon">...</myeyesid-icon>
 *   <div slot="label-text">Label</div>
 *   <div slot="content">Content</div>
 * </myeyesid-profile-item>
 */
@customElement(tagName)
export class MyEyesIDProfileItem extends LitElement {
  static tagName = tagName;

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      background-color: var(--myeyesid-profile-item-container-color, var(--myeyesid-color-background));
      border-radius: var(--myeyesid-profile-item-container-shape, var(--myeyesid-shape-corner-lg));
      padding-inline-start: var(
        --myeyesid-profile-item-container-leading-space,
        var(--myeyesid-spacing-xl)
      );
      padding-inline-end: var(
        --myeyesid-profile-item-container-trailing-space,
        var(--myeyesid-spacing-xl)
      );
      height: var(--myeyesid-profile-item-height, 64px);
    }

    .label {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--myeyesid-profile-item-label-gap, var(--myeyesid-spacing-sm));
    }

    ::slotted([slot='label-icon']) {
      color: var(--myeyesid-profile-item-label-icon-color, var(--myeyesid-color-typeface-secondary));

      --myeyesid-icon-size: var(--myeyesid-profile-item-label-icon-size, 24px);
    }

    ::slotted([slot='label-text']) {
      font: var(--myeyesid-profile-item-label-font, var(--myeyesid-font-label-md));
      color: var(--myeyesid-profile-item-label-color, var(--myeyesid-color-typeface-primary));
    }

    ::slotted([slot='content']),
    slot[name='content'] {
      display: flex;
      flex: 2;
      font: var(--myeyesid-profile-item-value-font, var(--myeyesid-font-body-md));
      color: var(--myeyesid-profile-item--color, var(--myeyesid-color-typeface-primary));
    }

    .no-value {
      font: var(--myeyesid-profile-item-no-value-font, var(--myeyesid-font-body-md));
      color: var(--myeyesid-profile-item-no-value-color, var(--myeyesid-color-typeface-secondary));
    }

    ::slotted([slot='actions']) {
      display: flex;
      flex: 1;
    }
  `;

  render() {
    return html`
      <div class="label">
        <slot name="label-icon"></slot>
        <slot name="label-text"></slot>
      </div>
      <slot name="content"><span class="no-value">Not set</span></slot>
      <slot name="actions"></slot>
    `;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface HTMLElementTagNameMap {
    [tagName]: MyEyesIDProfileItem;
  }
}
