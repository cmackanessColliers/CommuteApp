import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteLabel,
} from "@esri/calcite-components-react";
// import { useSiteSelection } from "../../../contexts/SiteSelectionContext";
import useAppStateStore from "../../../stores/AppStateStore";
import { useEffect } from "react";

function SetEmployeeCountField() {
  const layer = useAppStateStore((state) => state.layer);
  const employeeCountField = useAppStateStore(
    (state) => state.employeeCountField
  );
  const setEmployeeCountField = useAppStateStore(
    (state) => state.setEmployeeCountField
  );

  useEffect(() => {
    console.log("employeeCountField", employeeCountField);
  }, [employeeCountField]);

  return (
    <>
      {layer && (
        <CalciteLabel slot="content">
          Select Employee Count Field
          <CalciteCombobox
            placeholder="Optional - Select Employee Count Field"
            overlayPositioning="fixed"
            // value={employeeCountField}
            scale="s"
            selectionMode="single"
            onCalciteComboboxChange={(e) => {
              console.log(e.target.value);
              // dispatcherSiteSelection({
              //   type: "SET_EMPLOYEE_COUNT_FIELD",
              //   payload: e.target.value,
              // });
              setEmployeeCountField(e.target.value);
            }}
          >
            {layer &&
              layer?.fields &&
              layer?.fields?.map((field, i) => {
                return (
                  <CalciteComboboxItem
                    value={field.name}
                    key={i}
                    heading={field.alias}
                    textLabel={field?.alias}
                  ></CalciteComboboxItem>
                );
              })}
          </CalciteCombobox>
        </CalciteLabel>
      )}
    </>
  );
}

export default SetEmployeeCountField;
