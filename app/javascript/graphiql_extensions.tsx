/**
 * Login / logout button for the GraphiQL dashboard
 */

import { LoginButton } from "./components/graphiql/LoginButton";
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
    <LoginButton serverUrl={oidcConfig.serverUrl}
               realm={oidcConfig.realm}
               onNewToken={({ token }) => setGraphQLHeader("Authorization", `Bearer ${token}`)}
               onLogout={() => setGraphQLHeader("Authorization", null)}
      />);
});
