import * as React from "react";
import { useAsyncEffect } from "use-async-effect";
import { fetchOIDCConfig } from "../server/openid_configuration";
import { OIDCContext, StateEnum, LoginButton, IfOIDCState, LoggedInUser, useOpenIDConnectContext } from "@epfl-si/react-appauth";
import { QueryClientGraphQLProvider } from "@epfl-si/react-graphql-paginated";

import { ItemList } from "./item-list";
import { InfiniteItemList } from "./item-list-infinitescroll";
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
      <QueryClientGraphQLProvider endpoint="/graphql" authentication={
          { bearer: () => useOpenIDConnectContext().accessToken }
      }>
        <ItemList/>
        <p>Want more results? Just scroll!</p>
        <InfiniteItemList/>
      </QueryClientGraphQLProvider>
    </IfOIDCState>
    </OIDCContext>;
}
