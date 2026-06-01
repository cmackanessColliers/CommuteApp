
import {
  CalciteCardGroup,
  CalciteCard,
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteButton,
  CalciteInput,
  CalciteBlock,
} from "@esri/calcite-components-react";

import { useState, useRef, useEffect } from "react";
import useAppStateStore from "../../stores/AppStateStore";

function CompFeatureList() {
  const layer = useAppStateStore((state) => state.layer);
  const setCompareFeatures = useAppStateStore((state) => state.setCompareFeatures);
  const compareFeatures = useAppStateStore((state) => state.compareFeatures);
  const routeLayer = useAppStateStore((state) => state.routeLayer)
  const map = useAppStateStore((state) => state.map)
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [routeFeatures, setRouteFeatures] = useState(null)
  const highlightRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (routeLayer) {
      routeLayer
        ?.queryFeatures()
        .then((results) => {
          console.log("resultFeatures", results?.features)
          setRouteFeatures(results?.features)
        });
    }
  }, [routeLayer])
  
  async function removeFeature(feature, index) {
    await layer.applyEdits({ deleteFeatures: [feature] });

    const updatedFeatures = compareFeatures.filter((_, i) => i !== index);
    setCompareFeatures(updatedFeatures);
  }

  async function renameFeature(feature, name, index) {
    const updatedFeature = feature;
    updatedFeature.attributes.name = name

    await layer.applyEdits({ updateFeatures: [updatedFeature] });

    const updatedFeatures = compareFeatures.map((f, i) =>
      i === index ? updatedFeature : f
    );

    setCompareFeatures(updatedFeatures);
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
      layer.title.includes(layerView.layer.title)
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
    <CalciteCardGroup style={{display:"flex", flexDirection:"column", height:"100%", width:"100%", gap:"10px", marginInline:"auto", marginBottom:"10px"}}>
      {compareFeatures?.map((feature, index) => (
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
              <div style={{width:"60", display:"flex", flexDirection:"column"}}>
                {renamingIndex !== index && (
                  <div style={{width:"90%", fontSize:"15px", fontWeight:"bold"}}>{feature.attributes.name}</div>
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
                {routeLayer && routeFeatures?.length && (
                  // <CalciteBlock heading="routeStatistics" expanded collapsible>
                    <div style={{paddingTop:"10px",marginRight:"10px"}}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{outline:"1px solid #CCCDD5", padding:"3px", fontSize:"12px"}}>Location</th>
                            <th style={{outline:"1px solid #CCCDD5", padding:"3px", fontSize:"12px"}}>Candidate Site</th>
                            <th style={{outline:"1px solid #CCCDD5", padding:"3px", fontSize:"12px"}}>Duration</th>
                            <th style={{outline:"1px solid #CCCDD5", padding:"3px", fontSize:"12px"}}>Distance</th>
                            <th style={{outline:"1px solid #CCCDD5", padding:"3px", fontSize:"12px"}}>Rail Crossings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {routeFeatures
                            .filter((routeFeature) => routeFeature?.attributes?.routedSite === feature?.attributes?.objectid)
                            .map((routeFeature, i) => (
                              <tr key={i}>
                                <td style={{outline:"1px solid #CCCDD5", paddingInline:"8px", padding:"3px", fontSize:"12px", textAlign:"center"}}>{feature?.attributes?.name}</td>
                                <td style={{outline:"1px solid #CCCDD5", paddingInline:"8px", padding:"3px",  fontSize:"12px", textAlign:"center"}}>{routeFeature?.attributes?.candidateSite}</td>
                                <td style={{outline:"1px solid #CCCDD5", paddingInline:"8px", padding:"3px",  fontSize:"13px", textAlign:"center"}}>{routeFeature?.attributes?.duration}</td>
                                <td style={{outline:"1px solid #CCCDD5", paddingInline:"8px", padding:"3px",  fontSize:"13px", textAlign:"center"}}>{routeFeature?.attributes?.distance}</td>
                                <td style={{outline:"1px solid #CCCDD5", paddingInline:"8px", padding:"3px",  fontSize:"13px", textAlign:"center"}}>{routeFeature?.attributes?.railCrossings}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  // </CalciteBlock>
                )}
              </div>
              <CalciteDropdown
                open={openIndex === index}
                onCalciteDropdownOpen={() => setOpenIndex(index)}
                onCalciteDropdownClose={() => setOpenIndex(null)}
                overlayPositioning="fixed"
                placement="top-start"
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
          </CalciteCard>
      ))}
    </CalciteCardGroup>
  );
}

export default CompFeatureList;
