import * as React from "react";
import { useAsyncEffect } from "use-async-effect";
import { fetchOIDCConfig } from "../server/openid_configuration";
import { OIDCContext, StateEnum, LoginButton, IfOIDCState, LoggedInUser, useOpenIDConnectContext } from "@epfl-si/react-appauth";
import { GraphQLProvider } from "@epfl-si/react-graphql-simple";

import { ItemList } from "./item-list";
import { Loading } from "./spinner";

export function App() {
  const [authServerUrl, setAuthServerUrl] = React.useState<string>();

  useAsyncEffect(async (componentIsStillLive) => {
    const { auth_server } = await fetchOIDCConfig();
    if (componentIsStillLive()) setAuthServerUrl(auth_server);
  });

  if (! authServerUrl) return <Loading/>;

  return <OIDCContext authServerUrl = { authServerUrl }
                      client = { { clientId: "hello_rails",
                                   redirectUri: "http://localhost:3000/" } }>
    <LoginButton inProgressLabel={ <Loading/> }/>
    <IfOIDCState is={ StateEnum.LoggedIn }>
      <p>Hello, <LoggedInUser field="preferred_username" />!</p>
      <GraphQLProvider endpoint="/graphql" authentication={
          { bearer: () => useOpenIDConnectContext().accessToken }
      }>
        <ItemList/>
      </GraphQLProvider>
    </IfOIDCState>
    </OIDCContext>;
}
