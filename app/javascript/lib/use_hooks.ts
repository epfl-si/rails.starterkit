/**
 * More `useFoo` hooks not found in either React or https://usehooks-ts.com/
 */

import { useRef, useEffect } from "react";

/**
 * Like https://usehooks-ts.com/react-hook/use-interval but with OO API.
 *
 * The API allows the caller to start, stop, restart, or change the
 * callback or frequency at any time. The interval is automatically
 * destroyed when the owner component unmounts, regardless of its
 * state at that time.
 */
export function useInterval() {
  return useJavascriptTimer(setInterval, clearInterval);
}


/**
 * Like https://usehooks-ts.com/react-hook/use-timeout but with OO API.
 *
 * The API allows the caller to start, stop, restart, or change the
 * callback or delay at any time. The timeout is automatically
 * destroyed when the owner component unmounts, regardless of its
 * state at that time.
 */
export function useTimeout() {
  return useJavascriptTimer(setTimeout, clearTimeout);
}


function useJavascriptTimer(setIntervalOrTimeout: typeof setInterval,
                            clearIntervalOrTimeout: typeof clearInterval) {
  const id = useRef<number>();

  interface JavascriptTimerAPI {
    start : (fn : () => void, millis: number) => void;
    stop : () => void;
  }

  const api : JavascriptTimerAPI = {
    start(fn, millis) {
      api.stop();
      id.current = setIntervalOrTimeout(fn, millis);
    },
    stop() {
      if (id.current !== undefined) clearIntervalOrTimeout(id.current);
      id.current = undefined;
    }
  };

  // Invoked just to set up a cleanup at unmount time:
  useEffect(() => api.stop, []);

  return useRef<JavascriptTimerAPI>(api).current;
}
