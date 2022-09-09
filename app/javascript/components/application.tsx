import * as React from "react";
import { Loading } from "./spinner";

export interface AppProps {
  arg: string;
}

export function App({ arg }: AppProps) {
  return <div>{`Hello, ${arg}!`}
      <Loading/>;
  </div>;
}
