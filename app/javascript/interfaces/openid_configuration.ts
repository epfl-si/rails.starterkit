/**
 * What an OIDCConfig instance consists of.
 */

export interface OIDCConfig {
  serverUrl: string;
  realm: string;
  clientId?: string;
}
