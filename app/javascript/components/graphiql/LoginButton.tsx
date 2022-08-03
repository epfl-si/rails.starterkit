/**
 * Complete OIDC login widget with UI and state machine based on keycloak-js
 */
import { useState, useRef } from "react";
import { useAsyncEffect } from "use-async-effect";
import { OIDCConfig } from "../../interfaces/openid_configuration";
import Keycloak from "keycloak-js";

interface LoginButtonProps extends OIDCConfig {
  debug?: boolean;
  onLogin?: ({token: string}) => void;
  onLogout?: () => void;
}

export const LoginButton = function({ debug, realm, serverUrl,
                                      clientId, onLogin, onLogout }
                                    : LoginButtonProps) {
  if (! clientId) clientId = "graphiql/LoginButton";

  const [inProgress, setInProgress] = useState<boolean>(true);
  const [token, setToken] = useState<string>();

  function changeToken(token: string|undefined) {
    setInProgress(false);
    setToken(token);
    if (token === undefined) {
      if (onLogout) onLogout();
    } else {
      if (onLogin) onLogin({token});
    }
  }

  const kcActions = useRef<{login: () => void, logout: () => void}>();

  useAsyncEffect (async (isActive) => {
    const kc = new Keycloak({ realm, clientId, url: serverUrl });
    kcActions.current = kc;

    await kc.init({ enableLogging: !!debug });
    if (! isActive()) {
      // Too late! React doesn't care anymore.
      return;
    } else if (kc.authenticated) {
      changeToken(kc.token);
    } else {
      changeToken(undefined);
    }
  }, [realm, clientId, serverUrl]);

  ///////////////  And now... The button. //////////////

  if (inProgress) {
    return <button className="toolbar-button" title="Please wait..." disabled>⌛</button>;
  } else if (token === undefined) {
    return <button className="toolbar-button" title="Log in with OpenID-Connect" onClick={kcActions.current.login}>Login</button>;
  } else {
    return <button className="toolbar-button" title="Log out" onClick={kcActions.current.logout}>Log out</button>;
  }
}
