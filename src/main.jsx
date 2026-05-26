import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { CalciteLoader } from "@esri/calcite-components-react";
// import App from "./App.jsx";
const App = lazy(() => import("./App.jsx"));
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<CalciteLoader />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
