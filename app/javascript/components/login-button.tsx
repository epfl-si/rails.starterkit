import * as React from "react";
import { useOpenIDConnectContext, StateEnum as OIDCState } from "@epfl-si/react-appauth";
import { Loading } from "./spinner";

export function LoginButton () {
  const oidc = useOpenIDConnectContext();

  if (oidc.state === OIDCState.InProgress) {
    return <button title="Please wait..." disabled><Loading/></button>;
  }

  const loggedIn = oidc.state === OIDCState.LoggedIn,
  action = loggedIn ? `Logout (${oidc.idToken.preferred_username})`  : "Login",
  label = (oidc.error === undefined) ? action : [action, <sup>⚠</sup>],
  tooltip = oidc.error             ? `${oidc.error}` :
    loggedIn ? "Log out" : "Log in with OpenID-Connect";

  function onClick() {
    if (loggedIn) {
      oidc.logout();
    } else {
      oidc.login();
    }
  }

    return <button title={tooltip} onClick={onClick}>{label}</button>;
}
