import Keycloak from "keycloak-js";

interface OpenIDConnectConfig {
  realm: string;
  clientId: string;
  serverUrl: string;
  debug?: boolean;
  /**
   * If set, enable automatic renewal
   */
  minValiditySeconds?: number
}

/**
 * Inject your frameworky surrogates for setTimeout() and clearTimeout() here
 */
interface InjectTimeoutAPI<InjectedTimeoutHandleT> {
  setTimeout: (callback: () => void, millis: number) => InjectedTimeoutHandleT
  clearTimeout: (timeoutHandle: InjectedTimeoutHandleT) => void
}

function makeTimeoutAPI<InjectedTimeoutHandleT> (inject?: InjectTimeoutAPI<InjectedTimeoutHandleT>)
: InjectTimeoutAPI<InjectedTimeoutHandleT> {
  return inject ||
    // Existential types, TypeScript. Do you speak them?
    ({ setTimeout, clearTimeout } as any);
}

/**
 * You must provide these callbacks to the `run` method.
 */
export interface Callbacks {
  /**
   * The callback that informs the caller when a new OAuth2
   * authentication token becomes available. You might want to set
   * `Authentication: Bearer ${token}` in your future API calls.
   *
   *  `token` being `undefined` means that a previous call to the
   *  `logout` method just succeeded.
   */
  auth: (token: string|undefined) => void;
  error: (error: Error|string) => void;
}

/**
 * Your callback-based API for getting and renewing OIDC tokens.
 */
export class OpenIDConnect<InjectedTimeoutHandleT> {
  /**
   * Start the authentication process. Awaits the first successful
   * token event if we are currently logged in. That is, if (and
   * only if) `run` is about to return `true`, `tokenCallback`
   * will be called once before it returns.
   *
   * Additionally, if a `minValiditySeconds` parameter was passed at
   * construction time, schedule automatic token renewal this many
   * seconds before the `expiresIn()` deadline.
   *
   * @returns true if the user is currently logged in; false if
   * not.
   */
  public run : (callbacks: Callbacks) => Promise<boolean>;
  /**
   * Stop the renewal timer.
   *
   * No-op if no such timer is currently set.
   */
  public stop : () => void;
  /**
   * Start the login process.
   *
   * May navigate away to the OpenID-Connect server, so that the user
   * may log in.
   */
  public login : () => void;
  /**
   * Start the logout process.
   *
   * May navigate away to the OpenID-Connect server.
   */
  public logout : () => void;
  /**
   * Return the number of seconds before the current token expires.
   *
   * Behavior is undefined if there is no current token.
   */
  public expiresIn : () => number;

  constructor({ realm, clientId, serverUrl,
                 debug, minValiditySeconds } : OpenIDConnectConfig,
               inject?: InjectTimeoutAPI<InjectedTimeoutHandleT>) {
    inject = makeTimeoutAPI(inject);

    const kc = new Keycloak({ realm, clientId, url: serverUrl });
    let timeout: InjectedTimeoutHandleT;

    const methods = {
      async run(callbacks : Callbacks) {
        try {
          await kc.init({ enableLogging: !!debug });
          if (!kc.authenticated) return false;
          callbacks.auth(kc.token);
          scheduleRenewal();
          return true;
        } catch (e) {
          callbacks.error(e);
        }

        function scheduleRenewal() {
          if (!minValiditySeconds) return;

          const expiresIn = methods.expiresIn(),
            renewalDelay = expiresIn - minValiditySeconds;
          if (renewalDelay <= 0) {
            callbacks.error(`${serverUrl} returned a token that expires in ${expiresIn} seconds; minValiditySeconds value of ${minValiditySeconds} is unattainable! Token renewal is disabled.`);
          }

          if (debug) console.log(`Scheduling renewal in ${renewalDelay} seconds`);
          methods.stop();
          timeout = inject.setTimeout(async () => {
            try {
              await kc.updateToken(-1);
              callbacks.auth(kc.token);
              scheduleRenewal();
            } catch (error) {
              callbacks.error(error);
            }
          }, renewalDelay * 1000);
        }
      },
      stop() { if (timeout) inject.clearTimeout(timeout); },
      login: kc.login.bind(kc),
      logout: kc.logout.bind(kc),
      expiresIn(): number {
        return kc.tokenParsed['exp'] - Math.ceil(new Date().getTime() / 1000) + kc.timeSkew;
      }
    }
    // This is a “this-less” class, with extra defense against caller
    // modifying our `methods`:
    return { ...methods };
  }
}
