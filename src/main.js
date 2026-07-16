import React from "../vendor/react.mjs";
import { createRoot } from "../vendor/react-dom-client.mjs";
import { App } from "./App.js?v=50466bc";

createRoot(document.getElementById("root")).render(React.createElement(App));
