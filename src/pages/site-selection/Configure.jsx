import { CalciteShell } from "@esri/calcite-components-react";
import { useEffect, useState, lazy } from "react";
import PropTypes from "prop-types";

import { useSiteSelection } from "../../contexts/SiteSelectionContext";
import ReportContent from "../../components/Configure/ReportContent";

function Configure() {
  const { setupComplete, reportConfig } = useSiteSelection();

  return (
    <CalciteShell>
      {!reportConfig && (
        <>
          <ReportContent />
        </>
      )}
    </CalciteShell>
  );
}

Configure.propTypes = {
  children: PropTypes.element,
};

export default Configure;
