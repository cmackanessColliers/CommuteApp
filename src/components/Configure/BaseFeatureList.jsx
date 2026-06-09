
import {
  CalciteCardGroup,
  CalciteCard,
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteButton,
  CalciteInput,
  CalciteChip
} from "@esri/calcite-components-react";

import { useState, useRef, useEffect } from "react";
import useAppStateStore from "../../stores/AppStateStore";
import PieChartStaging from "../Printing/PieChartStaging";
import { formatter, intFormatter } from "../../helpers/utils";

function CompFeatureList() {
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const setBaselineFeatures = useAppStateStore((state) => state.setBaselineFeatures);
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures);
  const buildingField = useAppStateStore((state) => state.buildingField)
  const map = useAppStateStore((state) => state.map);
  const commuteGraphics = useAppStateStore((state) => state.commuteGraphics);
  const pieChartData = useAppStateStore((state) => state.pieChartData);
  const setSelectedSite = useAppStateStore((state) => state.setSelectedSite);
  const keyFeature = useAppStateStore((state) => state.keyFeature);
  const empCommuteLayer = useAppStateStore((state) => state.empCommuteLayer);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [baselineValues, setBaselineValues] = useState(null);
  const [resultFeatures, setResultFeatures] = useState([]);
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
    async function getAndSetBaseline() {
      const baselineVals = keyFeature?.map((feature) => 
        resultFeatures?.find((resultFeature) => resultFeature?.objectid === feature?.attributes?.objectid)
      )?.[0];
      setBaselineValues(baselineVals);
    }
    getAndSetBaseline();
  }, [keyFeature, resultFeatures]);

  useEffect(() => {
      const sortedCommuteGraphics = Array.isArray(commuteGraphics)
        ? [...commuteGraphics].sort((a, b) => a.AverageCommuteTime - b.AverageCommuteTime)
        : Object.values(commuteGraphics || {}).sort(
            (a, b) => a.AverageCommuteTime - b.AverageCommuteTime
          );
      setResultFeatures(sortedCommuteGraphics)
  }, [commuteGraphics]);


  
  
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
    <CalciteCardGroup style={{height:"100%", width:"100%", marginInline:"auto"}}
      label="BaselineSites"
      selection-mode="single"
      onCalciteCardGroupSelect={(e) => {
        if (e.target.selectedItems?.length) {
          // console.log(e.target.selectedItems[0].label)
          setSelectedSite(e.target.selectedItems[0].label)
        } else {
          setSelectedSite(null)
        }
      }}
    >
      {resultFeatures?.map((feature, index) => (
          <CalciteCard style={{width:"97%", marginInline:"auto"}}
            label={`${feature.objectid}`}
            id={`${feature.objectid}`}
            key={`${feature.objectid}`}
            onMouseEnter={() => {
              handleHoverHighlight(
                feature?.objectid,
                "enter"
              );
            }}
            onMouseLeave={() => {
              handleHoverHighlight(null, "leave");
            }}
          >
            <div slot="heading" style={{display:"flex", flexDirection:"row", gap:"10px"}}>  
              {renamingIndex !== index && (
                <>
                  <div style={{fontSize:"15px", fontWeight:"bold", marginTop:"1px"}}>{feature[buildingField]}</div>
                  {(baselineValues && (baselineValues?.objectid === feature?.objectid)) && (
                    <CalciteChip
                      slot="footer-end"
                      value="calcite chip"
                      scale="s"
                      appearance="solid"
                      style={{ flexShrink: "3" }}
                      kind="brand"
                    >
                      Baseline Site
                    </CalciteChip>
                  )}
                </>
              )}
            </div>
            {commuteGraphics && (
              <div slot="description" style={{marginTop:"5px", width:"99%", display:"flex", flexDirection:"row", gap:"10px"}}>
                <div style={{display:"flex", flexDirection:"column", width:"30%", marginTop:"auto", marginBottom:"auto"}}>
                  <table>
                    <tbody>
                      <tr>
                        <th style={{paddingTop:"5px", paddingBottom:"5px"}}>Avg Time</th>
                        <td style={{paddingTop:"5px", paddingBottom:"5px"}}>
                          <div style={{display:"flex", flexDirection:"column"}}>
                            <span>{feature.AverageCommuteTime}</span>
                            {feature?.CommuteTimeDifference !== null && (
                              <>
                                {feature?.CommuteTimeDifference > 0 && (
                                  <span style={{fontSize:"10px", color:"red"}}>+{feature.CommuteTimeDifference} mi</span>
                                )}
                                {feature?.CommuteTimeDifference < 0 && (
                                  <span style={{fontSize:"10px", color:"#1C54F4"}}>{(feature.CommuteTimeDifference)} mi</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th style={{paddingTop:"5px", paddingBottom:"5px"}}>Avg Dist</th>
                        <td style={{paddingTop:"5px", paddingBottom:"5px"}}>
                          <div style={{display:"flex", flexDirection:"column"}}>
                            <span>{feature.AverageCommuteDist}</span>
                            {feature?.CommuteDistDifference !== null && (
                              <>
                                {feature?.CommuteDistDifference > 0 && (
                                  <span style={{fontSize:"10px", color:"red"}}>+{feature.CommuteDistDifference} mi</span>
                                )}
                                {feature?.CommuteDistDifference < 0 && (
                                  <span style={{fontSize:"10px", color:"#1C54F4"}}>{(feature.CommuteDistDifference)} mi</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* <table>
                  <thead>
                    <tr>
                      <th>{"<30 mins"}</th>
                      <th>{"31-45 mins"}</th>
                      <th>{"46-60 mins"}</th>
                      <th>{"61-90 mins"}</th>
                      <th>{"91-120 mins"}</th>
                      <th>{"121-3 hrs"}</th>
                      <th>{">3 hrs"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{feature.CommuteTime_Under30}</td>
                      <td>{feature.CommuteTime_31_45}</td>
                      <td>{feature.CommuteTime_46_60}</td>
                      <td>{feature.CommuteTime_61_90}</td>
                      <td>{feature.CommuteTime_91_120}</td>
                      <td>{feature.CommuteTime_121_3}</td>
                      <td>{feature.CommuteTime_3Plus}</td>
                    </tr>
                  </tbody>
                </table> */}
                <div style={{width:"70%", height:"175px", alignContent:"center", justifyContent:"center", marginTop:"-20px"}}>
                  <div style={{width:"100%", textAlign:"center", fontWeight:"bold", fontSize:"12px", padding:"10px", marginTop:"-20px"}}>Commuters Per Time Range</div>
                  <div style={{height:"110px"}}>
                    <PieChartStaging printChartData={pieChartData[feature.objectid]} />
                  </div>
                </div>
              </div>
            )}
            {/* <CalciteBlock
              heading="Commute Chart"
              collapsible
            >
              <div style={{width:"100%", height:"175px", alignContent:"center", justifyContent:"center"}}>
                <PieChartStaging printChartData={pieChartData[feature.objectid]} />
              </div>
            </CalciteBlock> */}
          </CalciteCard>
        ))}
    </CalciteCardGroup>
  );
}

export default CompFeatureList;
