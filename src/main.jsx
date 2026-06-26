import React from "react";
import ReactDOM from "react-dom/client";
import RootApp from "./app/RootApp.jsx";
import "./shared/styles/global.css";
import "./features/relationship/styles/relationship-refinements.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
