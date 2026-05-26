import { Outlet } from "react-router-dom";
import { CalciteShell } from "@esri/calcite-components-react";


function SiteSelectionApp() {
  return (
    <>
      <CalciteShell className="calcite-mode-light">
        <Outlet />
      </CalciteShell>
    </>
  );
}

export default SiteSelectionApp;
