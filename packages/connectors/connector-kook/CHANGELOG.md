# @myeyesid/connector-kook

## 0.4.3

### Patch Changes

- @myeyesid/connector-oauth@1.7.3

## 0.4.2

### Patch Changes

- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @myeyesid/connector-kit@4.7.0
  - @myeyesid/connector-oauth@1.7.2

## 0.4.1

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @myeyesid/connector-kit@4.6.0
  - @myeyesid/connector-oauth@1.7.1

## 0.4.0

### Minor Changes

- 34964af46: feat: support custom scope in the `getAuthorizationUri` method

  This change allows the `getAuthorizationUri` method in the social connectors to accept an extra `scope` parameter, enabling more flexible authorization requests.

  If the scope is provided, it will be used in the authorization request; otherwise, the default scope configured in the connector settings will be used.

### Patch Changes

- Updated dependencies [0343699d7]
- Updated dependencies [34964af46]
  - @myeyesid/connector-oauth@1.7.0
  - @myeyesid/connector-kit@4.4.0

## 0.3.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @myeyesid/connector-oauth@1.6.0
  - @myeyesid/connector-kit@4.3.0

## 0.2.1

### Patch Changes

- dd8cd13c1: fix kook connector fail with empty banner in user information endpoint response
- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @myeyesid/connector-oauth@1.5.1
  - @myeyesid/connector-kit@4.1.1

## 0.2.0

### Minor Changes

- 4b01ce7c1: add KOOK social connector

### Patch Changes

- Updated dependencies [27d2c91d2]
  - @myeyesid/connector-oauth@1.5.0
