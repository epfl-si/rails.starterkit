/**
 * Complete OIDC login widget with UI and state machine based on keycloak-js
 */
import { useState, useRef } from "react";
import { useAsyncEffect } from "use-async-effect";
import { useTimeout } from "../../lib/use_hooks";
import { OIDCConfig } from "../../interfaces/openid_configuration";
import Keycloak from "keycloak-js";

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
  const [token, setToken] = useState<string>();

  const kcActions = useRef<{login: () => void, logout: () => void}>();
  const renew = useTimeout();

  useAsyncEffect (async (isActive) => {
    const kc = new Keycloak({ realm, clientId, url: serverUrl });
    kcActions.current = kc;

    function changeToken(token: string|undefined) {
      if (! isActive()) {
        // Too late! React doesn't care anymore.
        return;
      }
      setInProgress(false);
      setToken(token);
      if (token === undefined) {
        if (onLogout) onLogout();
      } else {
        if (onNewToken) onNewToken({token});
      }
    }

    await kc.init({ enableLogging: !!debug });
    if (kc.authenticated) {
      changeToken(kc.token);
      scheduleRenewal();
    } else {
      changeToken(undefined);
    }

    function scheduleRenewal() {
      const expiresIn = kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + kc.timeSkew;
      const renewalDelay = expiresIn - minValiditySeconds;
      if (renewalDelay <= 0) {
        console.error(`${serverUrl} returned a token that expires in ${expiresIn} seconds; minValiditySeconds value of ${minValiditySeconds} is unattainable! Token renewal is disabled.`);
        changeToken(undefined);
        return;
      }

      if (debug) {
        console.debug(`Received token expires in ${expiresIn} seconds, scheduling renewal in ${renewalDelay} seconds.`);
      }
      renew.start(async () => {
        try {
          await kc.updateToken(-1);
          changeToken(kc.token);
          scheduleRenewal();
        } catch (e) {
          console.error(e);
          changeToken(undefined);
        }
        }, renewalDelay * 1000);
    }
  }, [realm, clientId, serverUrl, minValiditySeconds]);

  ///////////////  And now... The button. //////////////

  if (inProgress) {
    return <button className="toolbar-button" title="Please wait..." disabled>⌛</button>;
  } else if (token === undefined) {
    return <button className="toolbar-button" title="Log in with OpenID-Connect" onClick={kcActions.current.login}>Login</button>;
  } else {
    return <button className="toolbar-button" title="Log out" onClick={kcActions.current.logout}>Log out</button>;
  }
}
