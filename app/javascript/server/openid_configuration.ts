/**
 * How to obtain an OIDCConfig instance from the server.
 */

import { OIDCConfig } from "../interfaces/openid_configuration";

export async function fetchOIDCConfig() : Promise<OIDCConfig> {
  const response = await fetch("/oidc/config");
  return await response.json();
}
