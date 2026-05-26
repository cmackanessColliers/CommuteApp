import { CalciteShell } from "@esri/calcite-components-react";
import { useEffect, useState, lazy } from "react";
import PropTypes from "prop-types";

import useAppStateStore from "../../stores/AppStateStore";
import ReportContent from "../../components/Configure/ReportContent";

function Configure() {

  return (
    <CalciteShell>
        <>
          <ReportContent />
        </>
    </CalciteShell>
  );
}

Configure.propTypes = {
  children: PropTypes.element,
};

export default Configure;
