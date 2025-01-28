import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { StateProvider } from "./StateProvider.jsx";
import reducer, { initialState } from "./reducer.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Router>
    <StateProvider initialState={initialState} reducer={reducer}>
      <App />
    </StateProvider>
  </Router>
  // </StrictMode>
);
