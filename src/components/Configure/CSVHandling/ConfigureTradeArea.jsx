import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteLabel,
  CalciteList,
  CalciteListItem,
  CalciteTooltip,
  CalciteCheckbox,
  CalciteIcon,
  CalciteInputNumber,
  CalciteButton,
  CalciteInputTimePicker,
  CalciteBlock
} from "@esri/calcite-components-react";
import { useState, useEffect, useRef } from "react";
import useAppStateStore from "../../../stores/AppStateStore";
import { getTravelTimeAreas } from "../../../helpers/travel_time_helpers";

function ConfigureTradeArea() {
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures);
  const baselineLayer = useAppStateStore((state) => state.baselineLayer)
  const keyFeature = useAppStateStore((state) => state.keyFeature);
  const buildingField = useAppStateStore((state) => state.buildingField);
  const setKeyFeature = useAppStateStore((state) => state.setKeyFeature);
  const setBaselineLayer = useAppStateStore((state) => state.setBaselineLayer)
  const tradeAreaLayer = useAppStateStore((state) => state.tradeAreaLayer)
  const useTradeArea = useAppStateStore((state) => state.useTradeArea)
  const setUseTradeArea = useAppStateStore((state) => state.setUseTradeArea)
  const travelDurations = useAppStateStore((state) => state.travelDurations)
  const setTravelDurations = useAppStateStore((state) => state.setTravelDurations)
  const radii = useAppStateStore((state) => state.radii)
  const setRadii = useAppStateStore((state) => state.setRadii)
  const map = useAppStateStore((state) => state.map)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const formattedTime = new Date().toTimeString().slice(0, 5)
  const [time, setTime] = useState(formattedTime)
  const [travelMode, setTravelMode] = useState("driving")
  const [configOpen, setConfigOpen] = useState(true)
  const [areaType, setAreaType] = useState("isochrone")
  const [isLoading, setIsLoading] = useState(false)
  const travelModeLookup = {
    walking: "Walking",
    public_transport: "Public Transport",
    cycling: "Cycling",
    "cycling+public_transport": "Cycling & Public Transport",
    driving: "Driving",
  };
  
  function handleCreateTradeAreas() {
    setIsLoading(true);
    try {
      // console.log("starting Create Trade Area")
      const resultsLayer = map?.map?.layers?.find((l) =>
        l?.title?.includes("Trade Areas"),
      );
      if (resultsLayer){
        map?.map?.remove(resultsLayer)
      };
      if (
        (travelDurations < 1 && areaType === "isochrone") ||
        (radii < 1 && areaType === "radial")
      ) {
        setIsLoading(false);
        return;
      }
      // console.log("Getting Travel Time");
      getTravelTimeAreas(
        areaType,
        baselineFeatures,
        travelMode,
        travelDurations,
        radii,
        null,
        resultsLayer,
      ).then((tradeAreasLayer) => {
        console.log("tradeAreasLayer", tradeAreasLayer.source.items)
        map?.map?.layers?.add(tradeAreasLayer)
        setTradeAreaLayer(tradeAreasLayer)
        extentGetAndGo(tradeAreasLayer)
        if (
          resultsLayer &&
          resultsLayer.title === `Trade Areas (${areaType})` &&
          areaType !== "h3"
        ) {
          resultsLayer.refresh();
          setIsLoading(false);
          return;
        }
        map?.map?.remove(resultsLayer);
        setIsLoading(false);
      });
    } catch (err) {
      setIsLoading(false);
      throw new Error("Problem generating trade area: ", err);
    }
  }

  const updateTravelDuration = (index, value) => {
    if (Number(value)) {
      const updated = [...travelDurations];
      updated[index] = Number(value*60);
      setTravelDurations(updated);
    }
  };

  const addTravelDuration = () => {
    setTravelDurations([...travelDurations, null]);
  };

  const removeTravelDuration = (index) => {
  const updated = travelDurations.filter((_, i) => i !== index);
  setTravelDurations(updated);
};

  const updateRadius = (index, value) => {
    const updated = [...radii];
    updated[index] = Number(value);
    setRadii(updated);
  };

  const addRadius = () => {
    setRadii([...radii, null]);
  };
  const removeRadius = (index) => {
    const updated = radii.filter((_, i) => i !== index);
    setRadii(updated);
  };

  
  async function extentGetAndGo(layer) {
    await layer.when()
    
    const extent = await layer.queryExtent();

    if (extent?.extent) {
      map.view.goTo(extent.extent);
    }
  }

  return (
    <>
    {baselineLayer && (
      <>
        <CalciteTooltip 
          referenceElement="useTradeAreaInfo"
          overlayPositioning="fixed"
          placement="right-start"
        >
          <span>Optional - Show Drive Times</span>
        </CalciteTooltip>
        <CalciteListItem id="TradeAreaListItem" scale="s">
          <div slot="content" style={{ display:"flex", flexDirection:"column", paddingTop:"15px", paddingBottom:"5px"}}>
            <CalciteLabel layout="inline" style={{marginInline:"auto"}} sclae="s">
                Show Origin Trade Areas
                <CalciteCheckbox scale="s" style={{ boxShadow: "var(--optimal-shadow)"}}
                  checked={useTradeArea} onCalciteCheckboxChange={(e) => {
                    console.log(e.target.checked)
                    setUseTradeArea(e.target.checked)
                  }}
                ></CalciteCheckbox>
                <CalciteIcon icon="information" scale="s" id="useTradeAreaInfo"/>
            </CalciteLabel>  
            {useTradeArea && (
              <div style={{textAlign:"center",color:"#000759", marginTop:"10px", marginBottom:"8px"}}>
                <CalciteBlock
                  heading="Set up Drive Times"
                  collapsible
                  expanded = {configOpen}
                  icon-start="map"
                >
                  <CalciteList
                    close-on-select-disabled
                    overlayPositioning="fixed"
                  >
                    <CalciteListItem>
                      <CalciteLabel slot="content" layout="block" scale="s" style={{marginTop:"3px", marginBottom:"3px"}}> Set Departure Time 
                        <CalciteInputTimePicker
                          scale="s"
                          value={time}
                          onCalciteInputTimePickerChange={(e) => {
                            // console.log(e.target.value) 
                            setTime(e.target.value)
                          }}
                        />
                      </CalciteLabel>
                    </CalciteListItem>
                    <CalciteListItem>
                      <CalciteLabel slot="content" layout="block" scale="s" style={{marginTop:"3px", marginBottom:"3px"}}> Set Trade Area Type
                        <CalciteCombobox
                          scale="s"
                          selectionMode="single"
                          overlayPositioning="fixed"
                          value={areaType}
                          onCalciteComboboxChange={(e)=>setAreaType(e.target.value)}
                          placeholder="Select Trade Area Type"
                        >
                          <CalciteComboboxItem value="isochrone" heading={"Travel Time"} selected={areaType==="isochrone"}></CalciteComboboxItem>
                          <CalciteComboboxItem value="radial" heading={"Radius"}></CalciteComboboxItem>
                        </CalciteCombobox>
                      </CalciteLabel>
                    </CalciteListItem>
                      {areaType === "radial" && (
                        <CalciteListItem>
                          
                          <CalciteLabel
                            slot="content"
                            scale="s"
                            layout="block"
                            style={{ marginTop: "3px", marginBottom: "3px" }}
                          >
                            Set Radius
                            {radii.map((radius, index) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginBottom: "6px",
                                  alignItems: "center",
                                }}
                              >
                                <CalciteInputNumber
                                  scale="s"
                                  style={{width:"90%"}}
                                  value={String(radius)}
                                  onCalciteInputNumberChange={(e) =>
                                    updateRadius(index, e.target.value)
                                  }
                                />

                                <CalciteButton
                                  appearance="outline"
                                  scale="s"
                                  color="red"
                                  icon-start="trash"
                                  onClick={() => removeRadius(index)}
                                  disabled={radii.length === 1}
                                >
                                </CalciteButton>
                              </div>
                            ))}
                            <CalciteButton
                              appearance="outline"
                              scale="s"
                              onClick={addRadius}
                            >
                              Add Radius
                            </CalciteButton>
                          </CalciteLabel>
                        </CalciteListItem>
                      )}
                      {areaType === "isochrone" && (
                        <>
                          {/* <CalciteListItem>
                            <CalciteLabel slot="content" layout="block" scale="s" style={{marginTop:"3px", marginBottom:"3px"}}> Set Trade Area Type
                              <CalciteCombobox
                                scale="s"
                                selectionMode="single"
                                overlayPositioning="fixed"
                                value={travelMode}
                                onCalciteComboboxChange={(e)=>{
                                  console.log(e.target.value)
                                  setTravelMode(e.target.value)
                                }}
                                placeholder="Select Trade Area Type"
                              >
                                {Object.entries(travelModeLookup).map(([key, value]) => (
                                  <CalciteComboboxItem
                                    value={key}
                                    key={key}
                                    selected={key === travelMode}
                                    heading={value}
                                  ></CalciteComboboxItem>
                                ))}
                              </CalciteCombobox>
                            </CalciteLabel>
                          </CalciteListItem> */}
                          <CalciteListItem>
                            <CalciteLabel
                              slot="content"
                              scale="s"
                              layout="block"
                              style={{ marginTop: "3px", marginBottom: "3px" }}
                            >
                              Set Travel Times
                              {travelDurations.map((duration, index) => (
                                <div
                                  key={index}
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginBottom: "6px",
                                    alignItems: "center",
                                  }}
                                >
                                  <CalciteInputNumber
                                    scale="s"
                                    style={{width:"90%"}}
                                    value={String(duration / 60)}
                                    onCalciteInputNumberChange={(e) =>
                                      updateTravelDuration(index, e.target.value)
                                    }
                                  />

                                  <CalciteButton
                                    appearance="outline"
                                    scale="s"
                                    color="red"
                                    icon-start="trash"
                                    onClick={() => removeTravelDuration(index)}
                                    disabled={travelDurations.length === 1}
                                  >
                                  </CalciteButton>
                                </div>
                              ))}
                              <CalciteButton
                                appearance="outline"
                                scale="s"
                                onClick={addTravelDuration}
                              >
                                Add Travel Time
                              </CalciteButton>
                            </CalciteLabel>
                          </CalciteListItem>
                        </>
                      )}
                      <CalciteListItem>
                        <CalciteButton slot="content" width="full"
                          disabled={isLoading}
                          onClick={()=>{
                            handleCreateTradeAreas()
                            // setConfigOpen(false)
                          }}
                        >Submit</CalciteButton>
                      </CalciteListItem>
                  </CalciteList>
                </CalciteBlock>
              </div>
            )}
          </div>
        </CalciteListItem>
      </>
    )}
    </>
  );
}

export default ConfigureTradeArea;
