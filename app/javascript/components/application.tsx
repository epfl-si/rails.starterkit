import * as React from "react";
import { useAsyncEffect } from "use-async-effect";
import { fetchOIDCConfig } from "../server/openid_configuration";
import { Loading } from "./spinner";

export function App() {
  const [authServerUrl, setAuthServerUrl] = React.useState<string>();

  useAsyncEffect(async (componentIsStillLive) => {
    const { auth_server } = await fetchOIDCConfig();
    if (componentIsStillLive()) setAuthServerUrl(auth_server);
  });

  if (! authServerUrl) return <Loading/>;
  return <>`Hello, ${authServerUrl}`</>;
}
