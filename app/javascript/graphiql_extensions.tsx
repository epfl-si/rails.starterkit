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


const fetchOrig = window.fetch;
let token : string | null;
window.fetch = function(...args) {
  if (args[0] === "/graphql" && token) {
    if (! args[1].headers) {
      args[1].headers = {};
    }
    args[1].headers["Authorization"] = `Bearer ${token}`;
  }
  return fetchOrig(...args);
};

let aDivForReact : Element, oidcConfig: OIDCConfig;
Promise.all([
  (async function addADivForReact() {
    await DOMContentLoadedPromise;
    aDivForReact = document.createElement("div");
    const buttonBar = document.getElementsByClassName("graphiql-sidebar-section")[0];
    buttonBar.insertAdjacentElement('beforeend', aDivForReact);
  })(),
  (async () => { oidcConfig = await fetchOIDCConfig() })()
]).then(() => {
  ReactDOM.createRoot(aDivForReact).render(
    <OIDCContext authServerUrl = { oidcConfig.auth_server }
               debug = { true }
               client = { { clientId: "graphiql/LoginButton",
                            redirectUri: "http://localhost:3000/graphiql" } }
               onNewToken={(token_) => { token = token_ }}
               onLogout={() => { token = null }}>
      <LoginButton className="graphiql-un-styled" logoutLabel={poorMansHelloUser}/>
      </OIDCContext>);
});

function poorMansHelloUser (oidc: OIDCState) {
  return `Logout (${oidc.idToken.preferred_username})`
}
