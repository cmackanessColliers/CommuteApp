import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteLabel,
  CalciteListItem,
  CalciteTooltip,
} from "@esri/calcite-components-react";
import useAppStateStore from "../../../stores/AppStateStore";
function SetBuildingField() {
  // const { layersToUse, buildingField, dispatcherSiteSelection } =
  //   useSiteSelection();
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const buildingField = useAppStateStore((state) => state.buildingField);
  const setBuildingField = useAppStateStore((state) => state.setBuildingField);

  return (
    <>
      {baselineLayer && (
        <>
          <CalciteTooltip 
            referenceElement="buildingFieldListItem"
            overlayPositioning="fixed"
            placement="right"
          >
            <span>Select a field with <strong>Unique Values</strong> to serve as the name for each site to be referenced by</span>
          </CalciteTooltip>
          <CalciteListItem id="buildingFieldListItem">
            <CalciteLabel slot="content" scale="s">
              Select Property Name Field
              <CalciteCombobox
                placeholder="Select Name Field"
                overlayPositioning="fixed"
                value={buildingField}
                disabled={baselineLayer === null}
                scale="s"
                selectionMode="single"
                onCalciteComboboxChange={(e) => {
                  if (e.target.value?.length < 1) {
                    setBuildingField(null);
                    return;
                  }
                  console.log(e.target.value);
                  setBuildingField(`${e.target.value}`);
                }}
              >
                {baselineLayer &&
                  baselineLayer?.fields?.map((field, i) => {
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
          </CalciteListItem>
        </>
      )}
    </>
  );
}

export default SetBuildingField;
