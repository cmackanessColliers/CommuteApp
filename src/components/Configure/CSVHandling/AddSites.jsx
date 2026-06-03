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
const SelectBaselineSite = lazy(() => import("./SelectBaselineSite"));
const SetBuildingField = lazy(() => import("./SetBuildingField"));
const ConfigureTradeArea = lazy(() => import("./ConfigureTradeArea"));

const ROLE = "Site";

function AddSites() {
  const [useSymbology, setUseSymbology] = useState(false)
  const [dataType, setDataType] = useState("csv")
  return (
    <>
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
          <Suspense fallback={<CalciteLoader />}>
            <ConfigureTradeArea/>
          </Suspense>
      </CalciteList>
    </>
  );
}

export default AddSites;
