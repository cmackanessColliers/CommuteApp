import { lazy, Suspense, Activity, useState } from "react";
import {
  CalciteBlock,
  CalciteList,
  CalciteListItem,
  CalciteLoader,
  CalciteTooltip,
  CalciteButton, 
  CalciteIcon,
  CalciteCheckbox,
  CalciteLabel,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem
} from "@esri/calcite-components-react";
import useAppStateStore from "../../../stores/AppStateStore";
import useUIStore from "../../../stores/UIStore";
const CSVContent = lazy(() => import("./CSVContent"));
const AtlasContent = lazy(() => import("./AtlasContent"));
const SelectBaselineSite = lazy(() => import("./SelectBaselineSite"));
const SetBuildingField = lazy(() => import("./SetBuildingField"));

const ROLE = "Site";

function AddSites() {
  const [useSymbology, setUseSymbology] = useState(false)
  const [dataType, setDataType] = useState("csv")
  return (
    <>
      <CalciteBlock
        heading="Add Sites"
        collapsible
        expanded
        // onCalciteBlockClose={() => toggleTuneTradeAreasCollapsed()}
        description="Add sites via Atlas or CSV"
        icon-start="3d-building"
      >
        <CalciteList>
          <CalciteListItem>
            <Suspense fallback={<CalciteLoader />}>
              <div slot="content">
                <div style={{width:"90%", marginInline:"auto", paddingTop:"5px"}}>
                    <CSVContent role={ROLE} />
                </div>
              </div>
            </Suspense>
          </CalciteListItem>
            <Suspense fallback={<CalciteLoader />}>
              <SetBuildingField />
            </Suspense>
            <Suspense fallback={<CalciteLoader />}>
              <SelectBaselineSite/>
            </Suspense>
        </CalciteList>
      </CalciteBlock>
    </>
  );
}

export default AddSites;
