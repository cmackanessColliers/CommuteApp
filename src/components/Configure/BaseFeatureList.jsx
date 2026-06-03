
import {
  CalciteCardGroup,
  CalciteCard,
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteButton,
  CalciteInput
} from "@esri/calcite-components-react";

import { useState, useRef, useEffect } from "react";
import useAppStateStore from "../../stores/AppStateStore";

function CompFeatureList() {
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const setBaselineFeatures = useAppStateStore((state) => state.setBaselineFeatures);
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures);
  const buildingField = useAppStateStore((state) => state.buildingField)
  const map = useAppStateStore((state) => state.map);
  const commuteGraphics = useAppStateStore((state) => state.commuteGraphics);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const highlightRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }
    };
  }, []);
  
  
  async function removeFeature(feature, index) {
    console.log(feature)
    await baselineLayer.applyEdits({ deleteFeatures: [feature] });

    const updatedFeatures = baselineFeatures.filter((_, i) => i !== index);
    setBaselineFeatures(updatedFeatures);
  }

  async function renameFeature(feature, name, index) {
    const updatedFeature = feature;
    updatedFeature.attributes.name = name
    console.log("updatedFeature", updatedFeature)
    await baselineLayer.applyEdits({ updateFeatures: [updatedFeature] });

    const updatedFeatures = baselineFeatures.map((f, i) =>
      i === index ? updatedFeature : f
    );

    setBaselineFeatures(updatedFeatures);
    setRenamingIndex(null);
    setRenameValue("")
  }

  
  async function handleHoverHighlight(oid, condition) {
    // Always clear first
    if (highlightRef.current) {
      highlightRef.current.remove();
      highlightRef.current = null;
    }

    if (condition === "leave" || !oid) return;

    const featureLayerView = map?.view?.layerViews?.find((layerView) =>
      baselineLayer.title.includes(layerView.layer.title)
    );

    if (!featureLayerView) return;

    const results = await featureLayerView.queryFeatures({
      objectIds: [oid],
      returnGeometry: true,
    });

    if (results?.features?.length) {
      highlightRef.current = featureLayerView.highlight(
        results.features[0],
        { name: "temporary" }
      );
    }
  }

  return (
    <CalciteCardGroup style={{display:"flex", flexDirection:"column", height:"100%", width:"100%", gap:"10px", marginInline:"auto",}}>
      {baselineFeatures?.map((feature, index) => (
        <CalciteCard key={index} style={{width:"97%", marginInline:"auto",}}
          onMouseEnter={() => {
            handleHoverHighlight(
              feature?.attributes?.[feature?.layer?.objectIdField],
              "enter"
            );
          }}
          onMouseLeave={() => {
            handleHoverHighlight(null, "leave");
          }}
        >
          <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>  
            {renamingIndex !== index && (
              <div style={{width:"70%", fontSize:"15px", fontWeight:"bold"}}>{feature.attributes[buildingField]}</div>
            )}
            {renamingIndex === index && (
              <div style={{display:"flex", flexDirection:"row", gap:"2px"}}>
                <CalciteInput
                  placeholder="Enter new name"
                  value={renameValue}
                  onCalciteInputInput={(e) => setRenameValue(e.target.value)}
                >
                  <CalciteButton slot="action" iconStart="check-circle-f"
                    onClick={()=>{
                      renameFeature(feature, renameValue, index)
                      setOpenIndex(null)
                      setRenamingIndex(null)
                    }}
                  ></CalciteButton>
                </CalciteInput>
              </div>
            )}
            <CalciteDropdown
              open={openIndex === index}
              onCalciteDropdownOpen={() => setOpenIndex(index)}
              onCalciteDropdownClose={() => setOpenIndex(null)}
              overlayPositioning="fixed"
            >
              <CalciteButton slot="trigger" appearance="outline" style={{ height:"25px", alignSelf:"center", marginRight:"5px"}}>
                Options
              </CalciteButton>

              <CalciteDropdownItem
                onClick={() => setRenamingIndex(index)}
              >
                Rename
              </CalciteDropdownItem>

              <CalciteDropdownItem
                onClick={() => removeFeature(feature, index)}
              >
                Delete
              </CalciteDropdownItem>
            </CalciteDropdown>
          </div>
          {commuteGraphics && (
            <div style={{marginTop:"5px"}}>
              <table>
                <thead>
                  <tr>
                    <th>{"<10 mins"}</th>
                    <th>{"10-20 mins"}</th>
                    <th>{"20-30 mins"}</th>
                    <th>{"30-40 mins"}</th>
                    <th>{"40-50 mins"}</th>
                    <th>{"50-60 mins"}</th>
                    <th>{">1hr mins"}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(commuteGraphics)
                    .filter(([_, graphic]) => (feature.attributes[buildingField] === graphic[buildingField]))
                    .map(([key,graphic]) => (
                      <tr key={key}>
                        <td>{graphic.CommuteTime_Under10}</td>
                        <td>{graphic.CommuteTime_10_20}</td>
                        <td>{graphic.CommuteTime_20_30}</td>
                        <td>{graphic.CommuteTime_30_40}</td>
                        <td>{graphic.CommuteTime_40_50}</td>
                        <td>{graphic.CommuteTime_50_60}</td>
                        <td>{graphic.CommuteTime_60Plus}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </CalciteCard>
      ))}
    </CalciteCardGroup>
  );
}

export default CompFeatureList;
