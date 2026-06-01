import { 
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteLabel,
  CalciteInput,
  CalciteInputNumber,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteInputTimePicker,
  CalciteButton,
} from "@esri/calcite-components-react";

import MapComponent from "../map";
import { useState, useEffect, useRef, useCallback, } from "react";
import "@arcgis/map-components/components/arcgis-search";
import useAppStateStore from "../../stores/AppStateStore";
import useUIStore from "../../stores/UIStore";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import CompFeatureList from "./CompFeatureList";
import BaseFeatureList from "./BaseFeatureList";
import ColliersLogo from "../../images/ColliersLogo.png"
import { fieldList, popupTemplate, compRenderer, baseRenderer } from "../../helpers/layerHandling";
import { getTravelTimeAreas, getRoutes } from "../../helpers/travel_time_helpers";
import AddEmployees from "./CSVHandling/AddEmployees";

function ReportContent() {
  const map = useAppStateStore((state) => state.map)
  const setLayer = useAppStateStore((state) => state.setLayer)
  const layer = useAppStateStore((state) => state.layer) 
  const setBaselineLayer = useAppStateStore((state) => state.setBaselineLayer)
  const baselineLayer = useAppStateStore((state) => state.baselineLayer) 
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures)
  const setBaselineFeatures = useAppStateStore((state) => state.setBaselineFeatures)
  const compareFeatures = useAppStateStore((state) => state.compareFeatures)
  const setCompareFeatures = useAppStateStore((state) => state.setCompareFeatures)
  const setRouteLayer = useAppStateStore((state) => state.setRouteLayer)
  const routeLayer = useAppStateStore((state) => state.routeLayer)
  const tradeAreaLayer = useAppStateStore((state) => state.tradeAreaLayer)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const siteFileName = useUIStore((state) => state.siteFileName);
  const employeeFileName = useUIStore((state) => state.employeeFileName);
  const {
    setSiteFileName,
    setEmployeeFileName,
  } = useUIStore.getState();
  const formattedTime = new Date().toTimeString().slice(0, 5)
  const [time, setTime] = useState(formattedTime)
  const [pointActive, setPointActive] = useState(false);
  const [configOpen, setConfigOpen] = useState(false)
  const [radius, setRadius] = useState(null)
  const [travelDuration, setTravelDuration] = useState(20)
  const [areaType, setAreaType] = useState("isochrone")
  const [isLoading, setIsLoading] = useState(false)
  const [pointIndex, setPointIndex] = useState(1)
  const searchRef = useRef(null); 
  const baseSearchRef = useRef(null); 
  
  useEffect(() => {    
    if (!map) return;
    const existingLayer = map.map.layers.find((l) => l.title === employeeFileName);
    if (layer && !existingLayer) {
      layer.queryFeatureCount().then((count) => {
        if (count >= 100) {
          layer.featureReduction = {
            ...featureReductionSettings,
            symbol: employeeSymbol.symbol,
          };
        }
      });
      map?.map?.layers?.addMany([layer]);
      map?.view?.goTo(layer);
    }
  }, [layer, map])
  
  useEffect(() => {
    if (baselineFeatures?.length) {
      setTimeout(() => {
        handleCreateTradeAreas();
      }, 2000);
    }
  }, [baselineFeatures])

  useEffect(() => {
    if (baselineFeatures?.length && compareFeatures?.length) {
      setTimeout(() => {
        handleCreateRoutes();
      }, 2000);
    }
  }, [baselineFeatures, compareFeatures])

  async function startDrawing(condition) {
    if (!map?.view) return;
    // ✅ Change cursor
    map.view.container.style.cursor = "crosshair";
    // ✅ Listen for ONE click only
    map.view.once("click", (event) => {
      const { latitude, longitude, x, y } = event.mapPoint;
      const feature = new Graphic({
        attributes: {
          name: `${condition} Point ${pointIndex}`,
          latitude,
          longitude,
          x,
          y,
        },
        geometry: event.mapPoint,
      });
      setPointActive(false)
      let layer 
      if (condition === "compare") {
        layer = map.map.layers.find(
          (l) => l.title === "Comparison Locations"
        );
      } if (condition ==="baseline") {
        layer = map.map.layers.find(
          (l) => l.title === "Baseline Locations"
        );
      }
      if (!layer) {
        // console.log("feature", feature)
        CreateFeatureLayer(feature, condition);
      } else {
        updateLayer(map, feature, layer, condition);
      }
      setPointIndex(pointIndex + 1)
      // ✅ Reset cursor
      map.view.container.style.cursor = "default";
    });

  }

  function handleCreateRoutes() {
    setIsLoading(true);
    try {
      // Call the helper function to get travel time areas
      const resultsLayer = map?.map?.layers?.find((l) =>
        l?.title?.includes("Travel Routes"),
      );
      if (resultsLayer){
        map?.map?.remove(resultsLayer)
      };
      const routeTime = {"Arrival Time": time, "Departure Time": time}
      const routeCost = {fuelPerGal: 3, wagePerHour:27}
      // console.log(
      //   "compareFeatures", compareFeatures,
      //   "baselineFeatures", baselineFeatures,
      //   "Time",routeTime,
      //   "routeCost",routeCost,)
      if (
        (!compareFeatures?.length && !baselineFeatures?.length)
      ) {
        setIsLoading(false);
        return;
      }
      console.log("Getting Routes");
      getRoutes(
        layer,
        baselineFeatures,
        null,
        routeTime,
        routeCost
      ).then(([RouteLayer, rankedSiteRouting]) => {
        // console.log("RouteLayer", RouteLayer)
        // console.log("rankedSiteRouting", rankedSiteRouting)
        map?.map?.layers?.add(RouteLayer)
        setRouteLayer(RouteLayer)
        if (
          resultsLayer &&
          resultsLayer.title === `Travel Routes` &&
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
      throw new Error("Problem generating routes: ", err);
    }
  }

  function handleCreateTradeAreas() {
    setIsLoading(true);
    try {
      // console.log("starting Create Trade Area")
      // Call the helper function to get travel time areas
      const resultsLayer = map?.map?.layers?.find((l) =>
        l?.title?.includes("Trade Areas"),
      );
      if (resultsLayer){
        map?.map?.remove(resultsLayer)
      };
      // console.log(
      //   "areaType", areaType,
      //   "baselineFeatures", baselineFeatures,
      //   "TravelMode", "driving",
      //   "travelDuration", travelDuration*60,
      //   "radius",radius,)
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
        // console.log("tradeAreasLayer", tradeAreasLayer)
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

  async function CreateFeatureLayer(features, condition) {
    if (condition === "compare") {
      const CompareLayer = new FeatureLayer({
        title:"Comparison Locations",
        source: [features],
        spatialReference: {wkid:4326},
        geometryType: "point",
        objectIdField: "objectid",
        popupEnabled: true,
        fields: fieldList,
        popupTemplate: popupTemplate,
        renderer: compRenderer
      })
      setSiteFileName("Comparison Location")
      // console.log("CompareLayer",CompareLayer)
      map?.map?.layers?.add(CompareLayer)
      setLayer(CompareLayer)
      CompareLayer
          ?.queryFeatures()
          .then((results) => {
            // console.log("resultFeatures", results?.features)
            setCompareFeatures(results?.features)
          });
    }
    if (condition === "baseline") {
      const BaselineLayer = new FeatureLayer({
        title:"Baseline Locations",
        source: [features],
        spatialReference: {wkid:4326},
        geometryType: "point",
        objectIdField: "objectid",
        popupEnabled: true,
        fields: fieldList,
        popupTemplate: popupTemplate,
        renderer: baseRenderer
      })
      setSiteFileName("Baseline Location")
      // console.log("BaselineLayer",BaselineLayer)
      map?.map?.layers?.add(BaselineLayer)
      setBaselineLayer(BaselineLayer)
      BaselineLayer
        ?.queryFeatures()
        .then((results) => {
          // console.log("resultFeatures", results?.features)
          setBaselineFeatures(results?.features)
          if (!areaType) {
            setAreaType("isochrone")
          }
          if (!travelDuration) {
            setTravelDuration(20)
          }
        });
    }
  }

  useEffect(() => {
    compSearchControl()
    baseSearchControl()
  }, [map]);

  function baseSearchControl() {
    const baseSearchEl = baseSearchRef.current;
    if (!baseSearchEl) return;
    const handleSelect = (e) => {
      const result = e.detail.result;
      const geom = result?.feature?.geometry;
      if (geom) {
        // console.log("Result:",result)
        const feature = new Graphic({
          attributes: {
            name:result.name,
            latitude: geom.latitude,
            longitude: geom.longitude,
            x: geom.x,
            y: geom.y,
          },
          geometry: geom
        })
        let layer = map.map.layers.find(
          (l) => l.title === "Baseline Locations"
        );
        // console.log(layer)
        if (!layer) {
          CreateFeatureLayer(feature, "baseline")
        } else {
          // console.log("layer Exists")
          updateLayer(map, feature, layer, "baseline");
        }
      }
    };
    baseSearchEl.addEventListener("arcgisSelectResult", handleSelect);
    return () => {
      baseSearchEl.removeEventListener("arcgisSelectResult", handleSelect);
    };
  }

  function compSearchControl() {
    const searchEl = searchRef.current;
    if (!searchEl) return;
    const handleSelect = (e) => {
      const result = e.detail.result;
      const geom = result?.feature?.geometry;
      if (geom) {
        // console.log("Result:",result)
        const feature = new Graphic({
          attributes: {
            name:result.name,
            latitude: geom.latitude,
            longitude: geom.longitude,
            x: geom.x,
            y: geom.y,
          },
          geometry: geom
        })
        let layer = map.map.layers.find((l) => l.title === "Comparison Locations");
        // console.log(layer)
        if (!layer) {
          CreateFeatureLayer(feature, "compare")
        } else {
          // console.log("layer Exists")
          updateLayer(map, feature, layer, "compare");
        }
      }
    };
    searchEl.addEventListener("arcgisSelectResult", handleSelect);
    return () => {
      searchEl.removeEventListener("arcgisSelectResult", handleSelect);
    };
  }
  
  async function updateLayer(map, feature, layer, condition) {
    // ✅ Append features instead of recreating layer
    await layer.applyEdits({
      addFeatures: [feature]
    });
    layer.refresh()    
    if (condition === "compare") {
      setLayer(layer)
    }
    if (condition === "baseline") {
      setBaselineLayer(layer)
    }
    layer
        ?.queryFeatures()
        .then((results) => {
          // console.log("resultFeatures", results?.features)
          if (condition === "compare") {
            setCompareFeatures(results?.features)
          }
          if (condition === "baseline") {
            setBaselineFeatures(results?.features)
          }
        });
    // console.log("layer",layer)
  }


  return (
    <div style={{display:"flex", flexDirection:"column", height:"100vh", width:"100vw"}}>
        <div style={{display:"flex", flexDirection:"row", height:"13%", width:"100%", backgroundColor: "#000759"}}>
          <div style={{width:"50%", height:"100%", display:"flex", alignItems:"center", flexDirection:"row", gap:"10px"}}>
            <img src={ColliersLogo} alt="" style={{height:"50%", width:"80px", objectFit:"contain", marginLeft:"10px"}}></img>
            <h1 style={{color: "white"}}>Colliers Route Comparison App</h1>
          </div>
          <div style={{ width:"50%", height:"100%", display:"flex", flexDirection:"row"}}>
            <div style={{width:"25%", height:"100%", alignItems:"center", display:"flex", color:"white", flexDirection:"column", gap:"10px", marginTop:"10px"}}>
                <span>Select a Departure Time</span>
                <CalciteInputTimePicker
                  value={time}
                  onCalciteInputTimePickerChange={(e) => {
                    // console.log(e.target.value) 
                    setTime(e.target.value)
                  }}
                />
            </div>
            <div style={{width:"75%", height:"100%", justifyItems:"center", alignItems:"center", display:"flex", flexDirection:"column", gap:"5px", marginTop:"8px"}}>
              <div style={{width:"100%", height:"100%", justifyItems:"center", alignItems:"center", display:"flex", flexDirection:"column", gap:"5px", marginTop:"8px"}}>
                <span style={{color:"white"}}>Define Baseline Site</span>
                <arcgis-search ref={baseSearchRef} referenceElement={map}/>
                <CalciteButton scale="s"
                  disabled={pointActive}
                  onClick={() => {
                    setPointActive(true)
                    startDrawing("baseline");
                  }}
                >Click to draw point on map</CalciteButton>\
              <div style={{textAlign:"center",color:"#000759", textAlign:"center", marginTop:"10px", marginBottom:"8px"}}>
                {baselineFeatures?.length > 0 && (
                  <div style={{position:"absolute", top:"3%", right:"1%", width:"90px"}}>
                    <CalciteDropdown
                      close-on-select-disabled
                      open={configOpen}
                      scale="l"
                    >
                      <CalciteButton slot="trigger" style={{fontSize:"12px", borderRadius:"10px", whiteSpace:"normal", height:"auto"}} onClick={()=>setConfigOpen(true)}>Route and<br/>Trade Area<br/>Config</CalciteButton>
                        <CalciteDropdownItem>
                          <CalciteLabel layout="block"> Set Trade Area Type
                            <CalciteCombobox
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
                        </CalciteDropdownItem>
                        {areaType === "radial" && (
                          <CalciteDropdownItem>
                            <CalciteLabel layout="block"> Set Radius
                              <CalciteInputNumber
                                onCalciteInputNumberChange={(e) => {setRadius(e.target.value)}}
                                value={radius}
                              ></CalciteInputNumber>
                            </CalciteLabel>
                          </CalciteDropdownItem>
                        )}
                        {areaType === "isochrone" && (
                          <CalciteDropdownItem>
                            <CalciteLabel layout="block"> Set Travel Time
                              <CalciteInputNumber
                                onCalciteInputNumberChange={(e) => {setTravelDuration(e.target.value)}}
                                value={String(travelDuration)}
                              ></CalciteInputNumber>
                            </CalciteLabel>
                          </CalciteDropdownItem>
                        )}
                        <CalciteDropdownItem>
                          <CalciteButton width="full"
                            onClick={()=>{
                              setConfigOpen(false)
                              handleCreateTradeAreas()
                            }}
                          >Submit</CalciteButton>
                        </CalciteDropdownItem>
                    </CalciteDropdown>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{width:"100%", height:"89%", display:"flex", flexDirection:"row"}}>
          <MapComponent />
          <div style={{width:"50%", height:"100%",display:"flex", flexDirection:"column"}}>
            <div style={{width:"100%", justifyContent:"center", outline:"1px solid #CCCDD5", marginBottom:"5px"}}>
                <AddEmployees/>
            </div>
              <div style={{display:"flex", flexDirection:"column", height:"86%", gap:"10px"}}>
                {baselineFeatures?.length && (
                  <>
                    <div style={{width:"97%", marginInline:"auto", backgroundColor:"#eaeaeb", outline:"1px solid #CCCDD5", marginBottom:"4px", marginTop:"2px", borderRadius: "var(--root-border-radius)",boxShadow: "var(--optimal-shadow)",}}>
                      <h2 style={{textAlign:"center"}}>Baseline Sites</h2>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", overflow:"auto", minHeight:"20%", maxheight:"50%", width:"98%"}}>
                      <BaseFeatureList />              
                    </div>
                  </>
                )}
                {compareFeatures?.length && (
                  <>
                    <div style={{width:"97%", marginInline:"auto", backgroundColor:"#eaeaeb", outline:"1px solid #CCCDD5", marginBottom:"4px", marginTop:"2px", borderRadius: "var(--root-border-radius)",boxShadow: "var(--optimal-shadow)",}}>
                      <h2 style={{textAlign:"center"}}>Comparison Sites</h2>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", overflow:"auto", minHeight:"20%", maxheight:"50%"}}>
                      <CompFeatureList />
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>
    </div>
  );
};

export default ReportContent;
