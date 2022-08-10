/**
 * Complete OIDC login widget with UI and state machine based on keycloak-js
 */
import { useState, useRef } from "react";
import { useAsyncEffect } from "use-async-effect";
import { useTimeout } from "../../lib/use_hooks";
import { OIDCConfig } from "../../interfaces/openid_configuration";
import { OpenIDConnect } from "../../lib/openid_connect";

interface LoginButtonProps extends OIDCConfig {
  debug?: boolean;
  onNewToken?: ({token: string}) => void;
  onLogout?: () => void;
  minValiditySeconds?: number;
}

export const LoginButton = function({ debug, realm, serverUrl, clientId,
                                  minValiditySeconds, onNewToken, onLogout }
                                    : LoginButtonProps) {
  if (! clientId) clientId = "graphiql/LoginButton";
  if (! minValiditySeconds) minValiditySeconds = 5;

  const [inProgress, setInProgress] = useState<boolean>(true);
  const [lastError, setLastError] = useState<string>();
  const [token, setToken] = useState<string>();

  const kcActions = useRef<{login: () => void, logout: () => void}>();
  const renew = useTimeout();

  useAsyncEffect (async (isActive) => {
    const kc = new OpenIDConnect(
      { debug, realm, clientId, serverUrl, minValiditySeconds },
      { setTimeout: renew.start, clearTimeout: renew.stop }
    );
    kcActions.current = kc;

    function onChangeToken (token: string) {
      if (! isActive()) {
        // Too late! React doesn't care anymore.
        return;
      }
      setToken(token);
      if (token === undefined) {
        if (onLogout) onLogout();
      } else {
        setLastError(undefined);
        if (onNewToken) onNewToken({token});
      }
    }

    function onError (error : Error|string) {
      console.error(error);
      if (! isActive()) return;
      setLastError(`${error}`);
    }

    await kc.run({auth: onChangeToken, error: onError});
    setInProgress(false);
  }, [realm, clientId, serverUrl, minValiditySeconds]);

  ///////////////  And now... The button. //////////////

  if (inProgress) {
    return <button className="toolbar-button" title="Please wait..." disabled>⌛</button>;
  }

  const action = (token === undefined) ? "Login" : "Logout",
       label = (lastError === undefined) ? action : [action, <sup>⚠</sup>],
       tooltip = lastError             ? `${lastError}` :
                (token === undefined)  ? "Log in with OpenID-Connect" :
                "Log out";
  function onClick() {
    if (! kcActions.current) return;  // Too soon!
    setInProgress(true);
    if (token === undefined) {
      kcActions.current.login();
    } else {
      kcActions.current.logout();
    }
  }
  return <button className="toolbar-button" title={tooltip} onClick={onClick}>{label}</button>;
}
