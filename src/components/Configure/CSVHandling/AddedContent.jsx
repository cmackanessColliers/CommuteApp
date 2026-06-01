import { CalciteComboboxItem } from "@esri/calcite-components-react";
// import { useSiteSelection } from "../../../contexts/SiteSelectionContext";
import useAppStateStore from "../../../stores/AppStateStore";
import { useEffect } from "react";

function AddedContent({ role }) {
  const baselineLayer = useAppStateStore((state) => state?.baselineLayer);
  const layer = useAppStateStore((state) => state?.layer);

  useEffect(() => {
    console.log("baselineLayer in AddedContent:", baselineLayer);
  }, [baselineLayer]);

  let layerItems;
  switch (role) {
    case "Site":
      if (baselineLayer) {
        layerItems = [<></>];
      }
      layerItems =
        layer?.title !== "Sites from csv"
          ? [
              <CalciteComboboxItem
                value={
                  baselineLayer?.serviceItemId
                    ? baselineLayer.serviceItemId
                    : ""
                }
                key={
                  baselineLayer?.serviceItemId
                    ? baselineLayer.serviceItemId
                    : 5446498
                }
                heading={baselineLayer?.title ? baselineLayer.title : ""}
              ></CalciteComboboxItem>,
            ]
          : [null];
      break;
    case "Employee":
      if (layer === null) {
        layerItems = [<></>];
      }
      layerItems =
        layer?.title !== "Employees from csv"
          ? [
              <CalciteComboboxItem
                value={
                  layer?.serviceItemId
                    ? layer.serviceItemId
                    : ""
                }
                key={
                  layer?.serviceItemId
                    ? layer.serviceItemId
                    : 5446498
                }
                heading={layer?.title ? layer.title : ""}
              ></CalciteComboboxItem>,
            ]
          : [null];
      break;
    default:
      throw new Error("Combobox Content Role not Valid");
  }
  return layerItems;
}

export default AddedContent;
