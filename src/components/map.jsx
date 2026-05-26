import useAppStateStore from "../stores/AppStateStore";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-placement";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter.js";
import Query from "@arcgis/core/rest/support/Query.js";
import { useState, useEffect, useRef } from "react";
const MapComponent = () => {
  const {} = useAppStateStore()
  const mapRef = useRef(null)
  const [filter, setFilter] = useState("1=1")
  const [map, setMap] = useState(null);
  const [mapAvailable, setMapAvailable] = useState(false);
  const [submarketSelect, setSubmarketSelect] = useState(null);
  const highlightRef = useRef(null);   
  const oidSelectRef = useRef(null)

  async function handleViewReady(e) {
    setMap(e.target);
    if (!map || !mapAvailable) {
      await e.target?.view.when(
        () => {
          // dispatcherSiteSelection({ type: "SET_MAP_AVAILABLE", payload: true }); 
          setMapAvailable(true)     
          setMap(e.target)      
          const view = e.target.view;        
          view.highlights = [
            {
              name: "default",
              //Colliers Teal
              color: [42, 182, 169],
            },
            // Colliers Yellow
            { name: "temporary", color: [255, 212, 0] },
          ];
          view.on("click", function(event) {
              const screenPoint = { x: event.x, y: event.y };
  
              view.hitTest(screenPoint).then(function(response) {
                  if (response.results.length) {
                      // console.log("HitTest Response:", response);
                      const graphicResult = response.results.filter(function(result) {
                          return result.graphic;
                      })[0];
  
                      // if (graphicResult.graphic && graphicResult?.graphic?.layer?.title === "Colliers Submarkets") {
                      //     const graphic = graphicResult.graphic;
                      //     // console.log("Clicked Feature Attributes:", graphic.attributes);
                      //     // console.log("Clicked Feature Submarket Name:", graphic.attributes.submarketname);
                      //     // console.log('OID Select State', oidSelectRef.current)
                      //     // console.log('Selected OID', graphic.attributes.objectId)
                      //     if (oidSelectRef.current !== graphic.attributes.objectid) {
                      //       setSubmarketSelect(graphic.attributes.submarketname)
                      //       dispatcherSiteSelection({
                      //         type: "SET_SUBMARKET_HIGHLIGHT",
                      //         payload: graphic.attributes.submarketname,
                      //       })
                      //       layerViewHighlight(view, graphic.attributes.objectid, 'select')
                      //       oidSelectRef.current = graphic.attributes.objectid
                      //     } else if (oidSelectRef.current === graphic.attributes.objectid) {
                      //       layerViewHighlight(view, null, 'remove')
                      //     }
                      // }
                  } else {
                    return
                  }
              });
          });
        },
        (error) => {
          console.error("Map component unmount error: ", error);
        }
      );
    }
  }


  return(
    <arcgis-map
      ref={mapRef}
      id="app-map"
      // item-id="87a69fb0587e4203ac20a214aeaff134"
      auto-destroy-disabled
      onarcgisViewReadyChange={handleViewReady}
    >
      <arcgis-expand slot="top-left" icon="basemap">
        <arcgis-basemap-gallery reference-element="app-map"></arcgis-basemap-gallery>
      </arcgis-expand>
      <arcgis-zoom slot="top-left"></arcgis-zoom>
    </arcgis-map>
  );
};

export default MapComponent;
