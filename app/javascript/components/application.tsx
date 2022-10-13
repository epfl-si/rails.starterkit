import * as React from "react";
import { useRef } from "react";
import { useAsyncEffect } from "use-async-effect";
import { fetchOIDCConfig } from "../server/openid_configuration";
import { OIDCContext, StateEnum, LoginButton, IfOIDCState, LoggedInUser } from "@epfl-si/react-appauth";

import { createHttpLink, ApolloClient, InMemoryCache, ApolloProvider, NormalizedCacheObject, } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ItemList } from "./item-list";
import { Loading } from "./spinner";

class AuthState {
  private token ?: string;
  setToken(token : string) {
    this.token = token;
  }
  logout() {
    this.token = undefined;
  }

  // https://www.apollographql.com/docs/react/networking/authentication/#header
  httpLink(uri) {
    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        authorization: this.token ? `Bearer ${this.token}` : ""
      }
    }));
    return authLink.concat(createHttpLink({ uri }));
  }
}

export function App() {
  const [authServerUrl, setAuthServerUrl] = React.useState<string>();

  useAsyncEffect(async (componentIsStillLive) => {
    const { auth_server } = await fetchOIDCConfig();
    if (componentIsStillLive()) setAuthServerUrl(auth_server);
  });

  const { current } = useRef<{
    auth ?: AuthState,
    client ?: ApolloClient<NormalizedCacheObject>
  }>({});

  if (! authServerUrl) return <Loading/>;

  if (! current.auth) current.auth = new AuthState();
  if (! current.client) current.client = new ApolloClient({
    cache: new InMemoryCache(),
    link: current.auth.httpLink('/graphql')
  });

  return <OIDCContext authServerUrl = { authServerUrl }
                      client = { { clientId: "hello_rails",
                                   redirectUri: "http://localhost:3000/" } }
                      onNewToken = { (token) => { current.auth.setToken(token); } }
                      onLogout = { () => { current.auth.logout(); } }  >
    <LoginButton inProgressLabel={ <Loading/> }/>
    <IfOIDCState is={ StateEnum.LoggedIn }>
      <p>Hello, <LoggedInUser field="preferred_username" />!</p>
    </IfOIDCState>
      <ApolloProvider client={ current.client }>
        <IfOIDCState is={ StateEnum.LoggedIn }>
        <ItemList/>
        </IfOIDCState>
      </ApolloProvider>
    </OIDCContext>;
}
