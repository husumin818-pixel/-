import React from "../vendor/react.mjs";
import { createRoot } from "../vendor/react-dom-client.mjs";
import { App } from "./App.js?v=__BUILD_VERSION__";

createRoot(document.getElementById("root")).render(React.createElement(App));
