import * as React from "react";

export interface AppProps {
  arg: string;
}

export function App({ arg }: AppProps) {
  return <div>{`Hello, ${arg}!`}</div>;
};
