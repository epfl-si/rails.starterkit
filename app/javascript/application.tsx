// Entry point for the build script in your package.json
import * as React from "react";
import * as ReactDOM from "react-dom/client";

import { App } from "./components/application";

document.addEventListener("DOMContentLoaded", () => {
  const rootEl = document.getElementById("react-app");
  ReactDOM.createRoot(rootEl).render(<App/>);
});
