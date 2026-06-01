import { lazy, Suspense, useEffect, useState } from "react";
import {
  CalciteBlock,
  CalciteList,
  CalciteListItem,
  CalciteLoader,
  CalciteTooltip,
  CalciteLabel,
  CalciteIcon,
  CalciteCheckbox,
} from "@esri/calcite-components-react";
import useAppStateStore from "../../../stores/AppStateStore";
import PropTypes from "prop-types";
import useUIStore from "../../../stores/UIStore";
const CSVContent = lazy(() => import("./CSVContent"));
const SetEmployeeCountField = lazy(() => import("./SetEmployeeCount"));


const ROLE = "Employee";

function AddEmployees({ disabled = false }) {
  const layer = useAppStateStore((state) => state.layer);
  const map = useAppStateStore((state) => state.map);
  const employeeFileName = useUIStore((state) => state.employeeFileName);
  const [dataType, setDataType] = useState("csv")
  const [useEmployeeCount, setUseEmployeeCount] = useState(false);

  return (
    <>
      <CalciteTooltip
        referenceElement="useEmployeeInfo"
        overlayPositioning="fixed"
        placement="right"
        closeOnClick={true}
      >
        <span>If your data has more than 1 employee per location<br/>specify the field that holds the employee count</span>
      </CalciteTooltip>
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
        <CalciteListItem>
          <div slot="content" style={{marginInline:'auto'}}>
            <CalciteLabel layout="inline" style={{marginInline:"auto"}}>
                Use Employee Count Field
              <CalciteCheckbox style={{ boxShadow: "var(--optimal-shadow)"}} checked={useEmployeeCount} onCalciteCheckboxChange={() => {setUseEmployeeCount(!useEmployeeCount)}}/>
              <CalciteIcon icon="information" scale="s" id="useEmployeeInfo" />
            </CalciteLabel>
          </div>
        </CalciteListItem>
            {useEmployeeCount && layer && (
              <>
                <CalciteTooltip
                  referenceElement="EmployeeCountBlock"
                  overlayPositioning="fixed"
                  placement="right"
                  closeOnClick={true}
                >
                  <span>
                    If the layer has multiple employees per location<br/>
                    set the field that has the count of employees 
                  </span>
                </CalciteTooltip>
                <CalciteListItem id="EmployeeCountBlock">
                  <Suspense fallback={<CalciteLoader />}>
                    <SetEmployeeCountField/>
                  </Suspense>
                </CalciteListItem>
              </>
            )}
      </CalciteList>
    </>
  );
}

AddEmployees.propTypes = {
  disabled: PropTypes.bool,
};

export default AddEmployees;
