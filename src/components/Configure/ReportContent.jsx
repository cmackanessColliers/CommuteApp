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
import BarChartStaging from "../Printing/BarChartStaging";
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
import { employeeSymbol, featureReductionSettings } from "../../map-symbols/MapSymbols";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import { generateCommuteAnalysis } from "../../helpers/CommuteAnalysis";
import ConfigBlock from "./ConfigBlock";

function ReportContent() {
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
  const routeLayer = useAppStateStore((state) => state.routeLayer)
  const tradeAreaLayer = useAppStateStore((state) => state.tradeAreaLayer)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const employeeCountField = useAppStateStore((state) => state.employeeCountField);
  const configReady = useAppStateStore((state) => state.configReady);
  const printingActive = useAppStateStore((state) => state.printingActive);
  const setConfigReady = useAppStateStore((state) => state.setConfigReady)
  const commuteGraphics = useAppStateStore((state) => state.commuteGraphics)
  const barChartData = useAppStateStore((state) => state.barChartData)
  const selectedSiteName = useAppStateStore((state) => state.selectedSiteName)
  const setCommuteGraphics = useAppStateStore((state) => state.setCommuteGraphics)
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



  return (
    <div style={{display:"flex", flexDirection:"column", height:"100vh", width:"100vw"}}>
        <div style={{display:"flex", flexDirection:"row", height:"8%", width:"100%", backgroundColor: "#000759", justifyContent:"space-between"}}>
          <div style={{width:"50%", height:"100%", display:"flex", alignItems:"center", flexDirection:"row", gap:"10px"}}>
            <img src={ColliersLogo} alt="" style={{height:"50%", width:"80px", objectFit:"contain", marginLeft:"10px"}}></img>
            <h1 style={{color: "white"}}>Colliers Commutalyzer</h1>
          </div>
          {configReady && (
            <div style={{marginRight:"30px", alignContent:"center",}}>
              <CalciteButton appearance="outline-fill" iconStart="app-gear" onClick={() => {setConfigReady(false)}}>Open Config</CalciteButton>
            </div>
          )}
        </div>
        <div style={{width:"100%", height:"92%", display:"flex", flexDirection:"row"}}>
          <div style={{flex: printingActive ? 1 : "1 1 50%", display:"flex", flexDirection:"column",}}>
            <MapComponent />
            {(!printingActive && barChartData && configReady) && (
              <div style={{ flex: "1 1 50%", height:"50%", display:"flex", flexDirection:"column"}}>
                <div style={{textAlign:"center", fontWeight:"bold", fontSize:"20px"}}>Average Travel Time and Distance By Site</div>
                <BarChartStaging chartData={barChartData} selectedSiteName={selectedSiteName}/>
              </div>
            )}
          </div>
          {!printingActive && (
            <div style={{width:"40%", height:"100%",display:"flex", flexDirection:"column"}}>
              {configReady && (
                <div style={{display:"flex", flexDirection:"column", height:"100%", gap:"10px"}}>
                  {baselineFeatures?.length && (
                    <>
                      <div style={{width:"97%", marginInline:"auto", backgroundColor:"#eaeaeb", outline:"1px solid #CCCDD5", marginBottom:"4px", marginTop:"2px", borderRadius: "var(--root-border-radius)",boxShadow: "var(--optimal-shadow)",}}>
                        <div style={{textAlign:"center", fontSize:"20px", padding:"5px"}}>Baseline Sites</div>
                      </div>
                      <div style={{display:"flex", flexDirection:"column", overflow:"auto", minHeight:"20%", maxheight:"100%", width:"98%"}}>
                        <BaseFeatureList />              
                      </div>
                    </>
                  )}
                </div>
              )}
              {!configReady && (
                <ConfigBlock />
              )}
            </div>
          )}
        </div>
    </div>
  );
};

export default ReportContent;
