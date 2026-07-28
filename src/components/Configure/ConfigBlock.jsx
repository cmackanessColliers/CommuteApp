import { 
  CalciteBlock,
  CalciteList,
  CalciteListItem,
  CalciteDropdown,
  CalciteDropdownItem,
  CalciteLabel,
  CalciteInput,
  CalciteInputNumber,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteInputTimePicker,
  CalciteButton,
  CalciteCheckbox,
} from "@esri/calcite-components-react";

import { useState, useEffect, useRef, useCallback, use, } from "react";
import "@arcgis/map-components/components/arcgis-search";
import useAppStateStore from "../../stores/AppStateStore";
import useUIStore from "../../stores/UIStore";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import CSVTemplateDownloader from "./CSVHandling/CsvTemplateDownloader";
import { getTravelTimeAreas, getRoutes } from "../../helpers/travel_time_helpers";
import AddEmployees from "./CSVHandling/AddEmployees";
import AddSites from "./CSVHandling/AddSites";
import { generateCommuteAnalysis } from "../../helpers/CommuteAnalysis";
import ConfigureTradeArea from "./CSVHandling/ConfigureTradeArea";
import { EmpCommuteRenderer, EmpCommuteVisualVariables } from "../../map-symbols/MapSymbols";
import { pieChartFormatting, barChartFormatting, CommuteChangeChartFormatting } from "../../helpers/utils";
import { BaselineSymbolRenderer, createBuildingRenderer } from "../../helpers/BaselineSymbology";
import SetCustomSymbology from "./CustomSymbology";
import createEMPCommuteRenderer from "./CustomSymbolGenerator";

function ConfigBlock() {
  const map = useAppStateStore((state) => state.map)
  const setLayer = useAppStateStore((state) => state.setLayer)
  const layer = useAppStateStore((state) => state.layer) 
  const nameField = useAppStateStore((state) => state.nameField)
  const setBaselineLayer = useAppStateStore((state) => state.setBaselineLayer)
  const baselineLayer = useAppStateStore((state) => state.baselineLayer) 
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures)
  const setBaselineFeatures = useAppStateStore((state) => state.setBaselineFeatures)
  const compareFeatures = useAppStateStore((state) => state.compareFeatures)
  const setCompareFeatures = useAppStateStore((state) => state.setCompareFeatures)
  const setRouteLayer = useAppStateStore((state) => state.setRouteLayer)
  const setCustomSymbology = useAppStateStore((state) => state.setCustomSymbology)
  const routeLayer = useAppStateStore((state) => state.routeLayer)
  const keyFeature = useAppStateStore((state) => state.keyFeature)
  const tradeAreaLayer = useAppStateStore((state) => state.tradeAreaLayer)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const setPieChartData = useAppStateStore((state) => state.setPieChartData)
  const setBarChartData = useAppStateStore((state) => state.setBarChartData)
  const setCommuteChangeChartData = useAppStateStore((state) => state.setCommuteChangeChartData)
  const setConfigReady = useAppStateStore((state) => state.setConfigReady);
  const setCommuteGraphics = useAppStateStore((state) => state.setCommuteGraphics)
  const setEmpCommuteLayer = useAppStateStore((state) => state.setEmpCommuteLayer)
  const empCommuteLayer = useAppStateStore((state) => state.empCommuteLayer)
  const buildingField = useAppStateStore((state) => state.buildingField);
  const employeeCountField = useAppStateStore((state) => state.employeeCountField);
  const commuteTimeSymbol = useAppStateStore((state) => state.commuteTimeSymbol);
  const useCustomCommuteSymbol = useAppStateStore((state) => state.useCustomCommuteSymbol);
  const setUseCustomCommuteSymbol = useAppStateStore((state) => state.setUseCustomCommuteSymbol);
  const formattedTime = new Date().toTimeString().slice(0, 5)
  const [time, setTime] = useState(formattedTime)
  const [pointActive, setPointActive] = useState(false);
  const [DestinationOpen, setDestinationOpen] = useState(true)
  const [radius, setRadius] = useState(null)
  const [travelDuration, setTravelDuration] = useState(20)
  const [areaType, setAreaType] = useState("isochrone")
  const [isLoading, setIsLoading] = useState(false)
  const [useCustomSymbology, setUseCustomSymbology] = useState(!useCustomCommuteSymbol)

  useEffect(
    function () {
     if (keyFeature !== null && keyFeature !== undefined) {
      setSymbologyGlobal()
     }
    },
    [keyFeature]
  );
  
  useEffect(
    function () {
     if (empCommuteLayer !== null && empCommuteLayer !== undefined) {
      createEMPCommuteRenderer(commuteTimeSymbol).then((renderer) => {
        // console.log("Setting EMP Commute Layer Renderer", renderer)
        empCommuteLayer.renderer = renderer
        if (employeeCountField) {
          EmpGraphicsLayer.renderer.visualVariables = EmpCommuteVisualVariables
        }
        setEmpCommuteLayer(empCommuteLayer)
      })
     }
    },
    [empCommuteLayer, commuteTimeSymbol]
  );
  

  async function setSymbologyGlobal() {
    if (baselineLayer && keyFeature?.length) {
      const oidField = "objectid"
      const baselineInfo = {
        oidField: oidField,
        keyFeature: null,
        keySymbolValue: null,
      }
      if (keyFeature !== null && keyFeature !== undefined) {
        baselineInfo.keyFeature =  keyFeature[0].attributes.objectid
      }
      // const customSymbol = await BaselineSymbolRenderer(baselineInfo)
      const customSymbol = await createBuildingRenderer(keyFeature, buildingField)      
      setCustomSymbology(customSymbol)
    }
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
        routeCost,
        nameField || "name",
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
        }
        map?.map?.remove(resultsLayer);
        setIsLoading(false);
      });
    } catch (err) {
      setIsLoading(false);
      throw new Error("Problem generating routes: ", err);
    }
  }

  function handleCommuteAnalysis() {
    setIsLoading(true);
    try {
      if (
        (!compareFeatures?.length && !baselineFeatures?.length)
      ) {
        setIsLoading(false);
        return;
      }      
        generateCommuteAnalysis(
          baselineFeatures,
          layer,
          "driving",
          keyFeature,
          employeeCountField,
          nameField || "name",
        ).then(([Facilitygraphics, EmpGraphics]) => {
          console.log("CommuteGraphics", Facilitygraphics)
          console.log("EmpCommuteGraphics", EmpGraphics)
          pieChartFormatting(Facilitygraphics, commuteTimeSymbol).then((data) => setPieChartData(data))
          barChartFormatting(Facilitygraphics, buildingField).then((data) => {{setBarChartData(data)}})
          if (keyFeature) {            
            CommuteChangeChartFormatting(Facilitygraphics, buildingField, keyFeature).then((data) => {{setCommuteChangeChartData(data)}})
          }
          buildEmpGraphicsLayer(EmpGraphics)
          setCommuteGraphics(Facilitygraphics)
          setIsLoading(false);
      });
    } catch (err) {
      setIsLoading(false);
      throw new Error("Problem generating routes: ", err);
    }
  }

  async function buildEmpGraphicsLayer(graphics) {
    const empFields = [
      ...layer.fields, // reuse all existing fields
      {
        name: "BLDSite",
        alias: "Building Site",
        type: "string",
      },
      {
        name: "travelTime",
        alias: "Travel Time",
        type: "double",
      },
      {
        name: "travelDist",
        alias: "Travel Distance",
        type: "double",
      },
      {
        name: "CommuterCount",
        alias: "Commuters",
        type: "double",
      }
    ];
    // console.log(empFields)
    
    const EmpGraphicsLayer = new FeatureLayer({
      title: "Employee Commute Graphics",
      source: graphics,
      objectIdField: "objectid",
      fields: empFields,
      geometryType: "point",
      spatialReference: layer.spatialReference,
    });
    createEMPCommuteRenderer(commuteTimeSymbol).then((renderer) => {
      // console.log("Setting EMP Commute Layer Renderer", renderer)
      EmpGraphicsLayer.renderer = renderer
      if (employeeCountField) {
        EmpGraphicsLayer.renderer.visualVariables = EmpCommuteVisualVariables
      }
      setEmpCommuteLayer(EmpGraphicsLayer)
    })
    // console.log("EmpGraphicsLayer", EmpGraphicsLayer.source)
    // console.log("EmpGraphicsLayer Attributes", EmpGraphicsLayer.source.items[0].attributes)
  }
  

  return (
    <>
      <CalciteList style={{width:"100%", height:"100%",display:"flex", flexDirection:"column", overflowY:"auto", padding:"10px", boxSizing:"border-box"}}>
        <CalciteListItem>
          <div slot="content">
            <CSVTemplateDownloader />
          </div>
        </CalciteListItem>
        {DestinationOpen && (
          <CalciteListItem style={{width:"100%", justifyContent:"center", outline:"1px solid #CCCDD5", marginBottom:"5px"}}>
          <CalciteBlock
            slot="content"
            heading="Add Potential Sites"
            collapsible
            expanded={DestinationOpen}
            icon-start="3d-building"
          >
            <AddSites/>
            {baselineLayer && buildingField && (
              <div>
                <CalciteButton
                  width="full"
                  onClick={() => setDestinationOpen(!DestinationOpen)}
                >
                  Next
                </CalciteButton>
              </div>
            )}
          </CalciteBlock>
        </CalciteListItem>
      )}
        {!DestinationOpen && (
          <CalciteListItem style={{width:"100%", justifyContent:"center", outline:"1px solid #CCCDD5", marginBottom:"5px"}}>
            <div slot="content">
              <CalciteButton
                width="full"
                onClick={() => setDestinationOpen(!DestinationOpen)}
              >
                Back
              </CalciteButton>
            </div>
            <CalciteBlock
              slot="content"
              heading="Add Employee Locations"
              collapsible
              expanded={!DestinationOpen}
              icon-start="3d-building"
            >
              <AddEmployees/> 
            </CalciteBlock>
            {!DestinationOpen && (
              <>
                <div slot="content" style={{display:"flex", flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginTop:"10px"}}>
                  <CalciteLabel layout="inline" style={{marginInline:"auto"}} id="LaborTypeCheckbox">
                    Adjust Commute Time Symbology
                    <CalciteCheckbox style={{ boxShadow: "var(--optimal-shadow)"}} checked={useCustomCommuteSymbol} onCalciteCheckboxChange={() => {setUseCustomCommuteSymbol(!useCustomCommuteSymbol)}}></CalciteCheckbox>
                  </CalciteLabel>
                </div>
                {useCustomCommuteSymbol && (
                    <SetCustomSymbology />
                )}
              </>
            )}
          </CalciteListItem>
        )}
      </CalciteList>
      <div slot="footer" style={{marginTop:"5px", marginBottom:"5px", marginInline:"auto"}}>
        <CalciteButton 
          onClick={() => {
            handleCommuteAnalysis()
            setConfigReady(true)
          }}
          disabled={baselineLayer === null || layer === null || nameField === null || buildingField === null}
        >Proceed To Analysis</CalciteButton>
      </div>
    </>
  );
};

export default ConfigBlock;
