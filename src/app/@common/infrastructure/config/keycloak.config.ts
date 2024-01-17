import { PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

import { KeycloakServerConfig } from '@core/@shared/infrastructure/config/env/keycloak-server.config';

export default () => ({
  keycloak: {
    debug: KeycloakServerConfig.DEBUG === '1',
    baseInternalUrl: `${KeycloakServerConfig.BASE_INTERNAL_URL}`,
    baseExternalUrl: `${KeycloakServerConfig.BASE_EXTERNAL_URL}`,
    realm: KeycloakServerConfig.REALM,
    clientId: KeycloakServerConfig.API_GATEWAY_CLIENT_ID,
    secret: KeycloakServerConfig.API_GATEWAY_SECRET,
    publicKey: KeycloakServerConfig.PUBLIC_KEY,
    certPublicKey: `-----BEGIN PUBLIC KEY-----\n${KeycloakServerConfig.PUBLIC_KEY}\n-----END PUBLIC KEY-----`,
    policyEnforcement: PolicyEnforcementMode.ENFORCING,
    tokenValidation: TokenValidation.OFFLINE,
    logLevels: ['log', 'debug', 'error', 'verbose', 'warn'],
    useNestLogger: false,
    user_credentials: {
      clientId: KeycloakServerConfig.USERS_CREDENTIALS_CLIENT_ID,
      secret: KeycloakServerConfig.USERS_CREDENTIALS_SECRET,
      grant_type: 'client_credentials',
    },
  },
});
