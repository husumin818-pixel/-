import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { App } from "./App.js?v=__BUILD_VERSION__";

createRoot(document.getElementById("root")).render(React.createElement(App));
