/**
 * OpenID-Connect login / logout button
 */

import { OIDCContext, State as OIDCState, LoginButton } from "@epfl-si/react-appauth";
import * as ReactDOM from "react-dom/client";
import { OIDCConfig } from "./interfaces/openid_configuration";
import { fetchOIDCConfig } from "./server/openid_configuration";

const DOMContentLoadedPromise = new Promise((resolve, _reject) => {
  document.addEventListener("DOMContentLoaded", resolve);
});

function setGraphQLHeader(k : string, v : string | null) : void {
  const dataset = document.getElementById("graphiql-container").dataset;
  const headers = JSON.parse(dataset.headers) as { [key: string] : string };
  if (v === null) {
    delete headers[k];
  } else {
    headers[k] = v;
  }
  dataset.headers = JSON.stringify(headers);
}

let aDivForReact : Element, oidcConfig: OIDCConfig;
Promise.all([
  (async function addADivForReact() {
    await DOMContentLoadedPromise;
    aDivForReact = document.createElement("div");
    const toolbar = document.getElementsByClassName("toolbar")[0];
    toolbar.insertAdjacentElement('beforeend', aDivForReact);
  })(),
  (async () => { oidcConfig = await fetchOIDCConfig() })()
]).then(() => {
  ReactDOM.createRoot(aDivForReact).render(
    <OIDCContext authServerUrl = { oidcConfig.auth_server }
               debug = { true }
               client = { { clientId: "graphiql/LoginButton",
                            redirectUri: "http://localhost:3000/graphiql" } }
               onNewToken={(token) => setGraphQLHeader("Authorization", `Bearer ${token}`)}
               onLogout={() => setGraphQLHeader("Authorization", null)}>
      <LoginButton className="toolbar-button" logoutLabel={poorMansHelloUser}/>
      </OIDCContext>);
});

function poorMansHelloUser (oidc: OIDCState) {
  return `Logout (${oidc.idToken.preferred_username})`
}
