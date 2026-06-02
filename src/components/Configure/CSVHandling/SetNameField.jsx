import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteLabel,
  CalciteListItem,
  CalciteTooltip,
} from "@esri/calcite-components-react";
import useAppStateStore from "../../../stores/AppStateStore";

function SetNameField() {
  // const { layersToUse, buildingField, dispatcherSiteSelection } =
  //   useSiteSelection();
  const layer = useAppStateStore((state) => state.layer);
  const nameField = useAppStateStore((state) => state.nameField);
  const setNameField = useAppStateStore(
    (state) => state.setNameField
  );

  return (
    <>
      {layer && layer.fields.length > 0 && (
        <>
          <CalciteTooltip 
            referenceElement="buildingFieldListItem"
            overlayPositioning="fixed"
            placement="right"
          >
            <span>Select a field with <strong>Unique Values</strong> to serve as the name for each site to be referenced by</span>
          </CalciteTooltip>
          <CalciteListItem id="buildingFieldListItem">
            <CalciteLabel slot="content">
              Select Property Name Field
              <CalciteCombobox
                placeholder="Select Name Field"
                overlayPositioning="fixed"
                value={nameField}
                disabled={layer === null}
                scale="s"
                selectionMode="single"
                onCalciteComboboxChange={(e) => {
                  if (e.target.value?.length < 1) {
                    // dispatcherSiteSelection({
                    //   type: "SET_BUILDING_FIELD",
                    //   payload: null,
                    // });
                    setNameField(null);
                    return;
                  }
                  console.log(e.target.value);
                  // dispatcherSiteSelection({
                  //   type: "SET_BUILDING_FIELD",
                  //   payload: e.target.value,
                  // });
                  setNameField(`${e.target.value}`);
                }}
              >
                {layer &&
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
          </CalciteListItem>
        </>
      )}
    </>
  );
}

export default SetNameField;
