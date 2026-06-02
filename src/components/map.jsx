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
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import { useState, useEffect, useRef, useCallback } from "react";
import { employeeSymbol, featureReductionSettings } from "../map-symbols/MapSymbols";
const MapComponent = () => {
  const map = useAppStateStore((state) => state.map)
  const setMap = useAppStateStore((state) => state.setMap)
  const mapAvailable = useAppStateStore((state) => state.mapAvailable)
  const setMapAvailable = useAppStateStore((state) => state.setMapAvailable)
  const routeLayer = useAppStateStore((state) => state.routeLayer)
  const setRouteLayer = useAppStateStore((state) => state.setRouteLayer)
  const layer = useAppStateStore((state) => state.layer);
  const setLayer = useAppStateStore((state) => state.setLayer)
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const setBaselineLayer = useAppStateStore((state) => state.setBaselineLayer)
  const tradeAreaLayer = useAppStateStore((state) => state.tradeAreaLayer)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const mapRef = useRef(null)
  const [filter, setFilter] = useState("1=1")
  const [submarketSelect, setSubmarketSelect] = useState(null);
  const highlightRef = useRef(null);   
  const oidSelectRef = useRef(null)
  
  
  const handleLayerOrdering = useCallback(() => {
    if (layer !== null) {
      const compLayer = map?.map?.layers.items.find(
        (layer) => layer.title === layer?.title,
      );
      map?.map?.reorder(compLayer, map?.map?.layers?.length - 1);
    }
    if (baselineLayer !== null) {
      const baseLayer = map?.map?.layers.items.find(
        (layer) => layer.title === baselineLayer?.title,
      );
      map?.map?.reorder(baseLayer, map?.map?.layers?.length - 2);
    }
    if (routeLayer) {
      const routingLayer = map?.map?.layers.items.find(
        (layer) => layer.title === routeLayer?.title,
      );
      map?.map?.reorder(routingLayer, map?.map?.layers?.length - 3);
    }
    if (tradeAreaLayer) {
      const AreaLayer = map?.map?.layers.items.find(
        (layer) => layer.title === tradeAreaLayer?.title,
      );
      map?.map?.reorder(AreaLayer, map?.map?.layers?.length - 4);
    }
  }, [
    map,
    routeLayer,
    tradeAreaLayer,
    layer,
    baselineLayer,
  ]);

  async function defineActions(event) {
    const { item } = event;

    if (!item?.layer) return;

    if (!item.layer.loaded) {
      item.layer.when(() => {});
    }

    await item?.layer?.load();
    item.actionsSections = [
      [
        {
          title: "Go to full extent",
          icon: "zoom-out-fixed",
          id: "full-extent",
        },
        {
          id: "delete-feature",
          title: "Delete Feature",
          icon: "trash",
        },
      ],
      [
        {
          title: "Increase opacity",
          icon: "chevron-up",
          id: "increase-opacity",
        },
        {
          title: "Decrease opacity",
          icon: "chevron-down",
          id: "decrease-opacity",
        },
      ],
    ];
  }

  useEffect(() => {
    if (!mapAvailable && !map?.view?.ready) return;
    try {
      const layerExtents = [];
      if (map?.view) {
        map.view.popup = {
          dockEnabled: true,
          dockOptions: {
            position: "bottom-left",
            breakpoint: false,
          },
        };
      }
      if (layer) {
        console.log("layer", layer)
        map?.map?.layers?.add(layer);
        layerExtents.push(layer?.fullExtent);
      }
      if (baselineLayer) {
        map?.map?.layers?.addMany([baselineLayer]);
      }
      if (tradeAreaLayer) {
        const inMapLayer = map?.map?.layers?.find((l) =>
          l.title.includes("Trade Areas"),
        );
        if (!inMapLayer) map?.map?.layers?.addMany([tradeAreaLayer]);
        layerExtents.push(tradeAreaLayer?.fullExtent);
      }
      if (routeLayer) {
        map?.map?.layers?.addMany([routeLayer]);
        layerExtents.push(routeLayer?.fullExtent);
      }
      if (layerExtents?.length > 0)
        map?.view?.goTo(layerExtents.filter((extent) => extent !== null));
      handleLayerOrdering();
    } catch (err) {
      console.error("An error ocurred while loading layers: ", err);
    }
  }, [
    map,
    mapAvailable,
    layer,
    baselineLayer,
    tradeAreaLayer,
    routeLayer,
    handleLayerOrdering,
  ]);

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

  async function layerListTriggerAction(event, map) {
    const actionLayer = event.detail.item.layer;
    // Capture the action id.
    const id = event.detail.action.id;
    if (id === "full-extent") {
      // If the full-extent action is triggered then navigate
      // to the full extent of the visible layer
      map.view.goTo(actionLayer.fullExtent).catch((error) => {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
    } else if (id === "delete-feature") {
      map?.map?.remove(actionLayer);
      if (actionLayer.title === layer?.title) {
        setLayer(null);
      } else if (actionLayer.title === baselineLayer?.title) {
        setBaselineLayer(null);
      } else if (actionLayer.title === routeLayer?.title) {
        setRouteLayer(null);
      } else if (actionLayer.title === tradeAreaLayer?.title) {
        setTradeAreaLayer(null);
      }
    } else if (id === "increase-opacity") {
      // If the increase-opacity action is triggered, then
      // increase the opacity of the GroupLayer by 0.25
      if (actionLayer.opacity < 1) {
        actionLayer.opacity += 0.25;
      }
    } else if (id === "decrease-opacity") {
      // If the decrease-opacity action is triggered, then
      // decrease the opacity of the GroupLayer by 0.25
      if (actionLayer.opacity > 0) {
        actionLayer.opacity -= 0.25;
      }
    }
  }

  return(
    <arcgis-map
      ref={mapRef}
      id="app-map"
      item-id="839bccb84055424897063abafff65b45"
      auto-destroy-disabled
      onarcgisViewReadyChange={handleViewReady}
    >
      <arcgis-expand slot="top-left" icon="basemap">
        <arcgis-basemap-gallery reference-element="app-map"></arcgis-basemap-gallery>
      </arcgis-expand>
      <arcgis-expand slot="top-left" icon="layers"> 
        <arcgis-layer-list
          reference-element="app-map"
          dragEnabled={true}
          listItemCreatedFunction={defineActions}
          onarcgisTriggerAction={(e) => {
            layerListTriggerAction(e, map);
          }}
        ></arcgis-layer-list>
      </arcgis-expand>
      <arcgis-zoom slot="top-left"></arcgis-zoom>
    </arcgis-map>
  );
};

export default MapComponent;
