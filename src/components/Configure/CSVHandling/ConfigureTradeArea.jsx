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
  const map = useAppStateStore((state) => state.map)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const formattedTime = new Date().toTimeString().slice(0, 5)
  const [time, setTime] = useState(formattedTime)
  const [configOpen, setConfigOpen] = useState(true)
  const [radius, setRadius] = useState(null)
  const [travelDuration, setTravelDuration] = useState(20)
  const [areaType, setAreaType] = useState("isochrone")
  const [isLoading, setIsLoading] = useState(false)
  
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
        (travelDuration < 1 && areaType === "isochrone") ||
        (radius < 1 && areaType === "radial")
      ) {
        setIsLoading(false);
        return;
      }
      // console.log("Getting Travel Time");
      getTravelTimeAreas(
        areaType,
        baselineFeatures,
        "driving",
        travelDuration*60,
        radius,
        null,
        resultsLayer,
      ).then((tradeAreasLayer) => {
        console.log("tradeAreasLayer", tradeAreasLayer)
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
          <span>Optional - Generate a trade area around a baseline site</span>
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
              <div style={{textAlign:"center",color:"#000759", textAlign:"center", marginTop:"10px", marginBottom:"8px"}}>
                <CalciteBlock
                  heading="Configure Trade Area"
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
                          <CalciteLabel slot="content" layout="block" style={{marginTop:"3px", marginBottom:"3px"}}> Set Radius
                            <CalciteInputNumber
                              scale="s"
                              onCalciteInputNumberChange={(e) => {setRadius(e.target.value)}}
                              value={radius}
                            ></CalciteInputNumber>
                          </CalciteLabel>
                        </CalciteListItem>
                      )}
                      {areaType === "isochrone" && (
                        <CalciteListItem>
                          <CalciteLabel slot="content" scale="s" layout="block" style={{marginTop:"3px", marginBottom:"3px"}}> Set Travel Time
                            <CalciteInputNumber
                              scale="s"
                              onCalciteInputNumberChange={(e) => {setTravelDuration(e.target.value)}}
                              value={String(travelDuration)}
                            ></CalciteInputNumber>
                          </CalciteLabel>
                        </CalciteListItem>
                      )}
                      <CalciteListItem>
                        <CalciteButton slot="content" width="full"
                          onClick={()=>{
                            handleCreateTradeAreas()
                            setConfigOpen(false)
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
