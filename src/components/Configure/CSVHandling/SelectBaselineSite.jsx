import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteLabel,
  CalciteListItem,
  CalciteTooltip,
  CalciteCheckbox,
  CalciteIcon
} from "@esri/calcite-components-react";
import { useState, useEffect } from "react";
import useAppStateStore from "../../../stores/AppStateStore";

function SelectBaselineSite() {
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures);
  const keyFeature = useAppStateStore((state) => state.keyFeature);
  const buildingField = useAppStateStore((state) => state.buildingField);
  const setKeyFeature = useAppStateStore((state) => state.setKeyFeature);
  const [useKey, setUseKey] = useState((keyFeature !== null && keyFeature !== undefined) ? true : false)
  
  const disableBlocks = () => buildingField?.length !== undefined;

  // Get objectIdField from baselineFeatures layer or fallback to common defaults
  const objectIdField =
    baselineFeatures?.[0]?.layer?.objectIdField || "objectid";

  return (
    <>
      {(baselineFeatures && disableBlocks()) && (
        <>
          <CalciteTooltip 
            referenceElement="useBaselineInfo"
            overlayPositioning="fixed"
            placement="right-start"
          >
            <span>Optional - The site you would like to compare other sites against</span>
          </CalciteTooltip>
          <CalciteListItem id="baselineSiteListItem">
            <div slot="content" style={{ display:"flex", flexDirection:"column", paddingTop:"15px", paddingBottom:"5px"}}>
              <CalciteLabel layout="inline" style={{marginInline:"auto"}}>
                  Use a Baseline Site
                  <CalciteCheckbox  style={{ boxShadow: "var(--optimal-shadow)"}}
                  checked={useKey} onCalciteCheckboxChange={() => {setUseKey(!useKey)}}
                  ></CalciteCheckbox>
                  <CalciteIcon icon="information" scale="s" id="useBaselineInfo"/>
              </CalciteLabel>
              {useKey && (
                <CalciteLabel scale="s">
                  Select Baseline Site (Optional)
                  <CalciteCombobox
                    disabled={buildingField === null}
                    placeholder="Optional - Site to compare against"
                    overlayPositioning="fixed"
                    scale="s"
                    selectionMode="single"
                    value={
                      keyFeature !== undefined && keyFeature !== null
                        ? keyFeature?.map(
                            (feature) =>
                              feature?.attributes?.[
                                feature?.layer?.objectIdField || objectIdField
                              ]
                          )
                        : []
                    }
                    onCalciteComboboxChange={(e) => {
                      const eventValue = Array.isArray(e.target.value)
                        ? e.target.value
                        : [e.target.value];
                      const selectedUIDs = [...eventValue].map((uid) => Number(uid));
                      const selectedFeatures = baselineFeatures?.filter((f) =>
                        selectedUIDs.includes(
                          f.attributes[f.layer?.objectIdField || objectIdField]
                        )
                      );
                      // dispatcherSiteSelection({
                      //   type: "SET_BASELINE_FEATURE",
                      //   payload: selectedFeatures,
                      // });
                      setKeyFeature(selectedFeatures);
                    }}
                  >
                    {baselineFeatures?.length > 0 &&
                      baselineFeatures?.map((feature, i) => {
                        return (
                          <CalciteComboboxItem
                            value={
                              feature.attributes[
                                feature.layer?.objectIdField || objectIdField
                              ]
                            }
                            key={i}
                            heading={feature.attributes[buildingField]}
                            textLabel={feature.attributes[buildingField]}
                          ></CalciteComboboxItem>
                        );
                      })}
                  </CalciteCombobox>
                </CalciteLabel>
              )}
            </div>
          </CalciteListItem>
        </>
      )}
    </>
  );
}

export default SelectBaselineSite;
