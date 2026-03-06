import { ConnectorType } from '@myeyesid/connector-kit';
import { SignInIdentifier } from '@myeyesid/schemas';

export const identifierRequiredConnectorMapping: {
  [key in SignInIdentifier]?: ConnectorType;
} = {
  [SignInIdentifier.Email]: ConnectorType.Email,
  [SignInIdentifier.Phone]: ConnectorType.Sms,
};
