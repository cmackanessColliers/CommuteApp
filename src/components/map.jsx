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
import { CalciteButton } from "@esri/calcite-components-react";
import { openPdfInNewTab } from "./Printing/PDFRenderer";

import {
  Chart as ChartJS,
  ArcElement,  
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);
const MapComponent = () => {
  const map = useAppStateStore((state) => state.map)
  const setMap = useAppStateStore((state) => state.setMap)
  const mapAvailable = useAppStateStore((state) => state.mapAvailable)
  const setMapAvailable = useAppStateStore((state) => state.setMapAvailable)
  const routeLayer = useAppStateStore((state) => state.routeLayer)
  const setRouteLayer = useAppStateStore((state) => state.setRouteLayer)
  const layer = useAppStateStore((state) => state.layer);
  const setLayer = useAppStateStore((state) => state.setLayer)
  const compareFeatures = useAppStateStore((state) => state.compareFeatures);
  const baselineFeatures = useAppStateStore((state) => state.baselineFeatures);
  const pieChartData = useAppStateStore((state) => state.pieChartData);
  const baselineLayer = useAppStateStore((state) => state.baselineLayer);
  const setBaselineLayer = useAppStateStore((state) => state.setBaselineLayer)
  const tradeAreaLayer = useAppStateStore((state) => state.tradeAreaLayer)
  const setTradeAreaLayer = useAppStateStore((state) => state.setTradeAreaLayer)
  const empCommuteLayer = useAppStateStore((state) => state.empCommuteLayer)
  const commuteGraphics = useAppStateStore((state) => state.commuteGraphics)
  const setSelectedSite = useAppStateStore((state) => state.setSelectedSite);
  const selectedSite = useAppStateStore((state) => state.selectedSite);
  const configReady = useAppStateStore((state) => state.configReady);
  const imageArray = useAppStateStore((state) => state.imageArray);
  const setImageArray = useAppStateStore((state) => state.setImageArray);
  const buildingField = useAppStateStore((state) => state.buildingField);
  const nameField = useAppStateStore((state) => state.nameField);
  const setPrintingActive = useAppStateStore((state) => state.setPrintingActive);
  const employeeCountField = useAppStateStore((state) => state.employeeCountField);
  const [chartImages, setChartImages] = useState(null)
  const mapRef = useRef(null)
  const siteLayerViewRef = useRef(null);
  const commuteLayerViewRef = useRef(null);

  useEffect(() => {
    if (imageArray?.length) {
      getFeatures(empCommuteLayer).then((empCommuteFeatures) => {
        const multiEmployeeDict = {
          "OneToFour": [],
          "FiveToNine": [],
          "TenToFifteen": [],
          "FifteenPlus": [],
        }
        if (employeeCountField) {
          compareFeatures.map((feature) => {
            if (feature.attributes?.[employeeCountField] <= 4) {
              multiEmployeeDict.OneToFour.push(feature.attributes?.[employeeCountField])
            }
            if (feature.attributes?.[employeeCountField] > 4 && feature.attributes?.[employeeCountField] < 9) {
              multiEmployeeDict.FiveToNine.push(feature.attributes?.[employeeCountField])
            }
            if (feature.attributes?.[employeeCountField] > 9 && feature.attributes?.[employeeCountField] < 15) {
              multiEmployeeDict.TenToFifteen.push(feature.attributes?.[employeeCountField])
            }
            if (feature.attributes?.[employeeCountField] > 15) {
              multiEmployeeDict.FifteenPlus.push(feature.attributes?.[employeeCountField])
            }
          })
        } 
        console.log(
          "title", "Commute Analysis", 
          "baselineFeatures", baselineFeatures, 
          "imageArray", imageArray, 
          "empCommuteFeatures", empCommuteFeatures, 
          "commuteGraphics", commuteGraphics, 
          "buildingField", buildingField, 
          "nameField", nameField,
          "countField", employeeCountField,
          "multiEmployeeDict", multiEmployeeDict,
          "chartImages",chartImages
        )
        openPdfInNewTab({
          title: "Commute Analysis", 
          baselineFeatures: baselineFeatures, 
          imageArray: imageArray, 
          empCommuteFeatures: empCommuteFeatures, 
          commuteGraphics: commuteGraphics, 
          buildingField: buildingField, 
          nameField: nameField,
          countField: employeeCountField || null,
          multiEmployeeDict: multiEmployeeDict,
          chartImages: chartImages
        })
      })
    }
  }, [imageArray]);

    useEffect(() => {
    const run = async () => {
      if (!pieChartData) return;
      const newImages = {};
      for (const key of Object.keys(pieChartData)) {
        const cfg = buildChartConfig(pieChartData, key);
        newImages[`${key}`] = await generateChartDataUrl(cfg);
      }
      setChartImages(newImages);
    };
    run();
  }, [pieChartData]);

  const buildChartConfig = (pieChartData, key) => {
    if (!pieChartData) return null;
    const data = {
      labels: pieChartData[key].xValues,
      datasets: [{
        label: "Commuters by Time Range",
        data: pieChartData[key].yValues,
        backgroundColor: pieChartData[key].barColors,
        hoverOffset: 4
      }]
    }
    return data
  }

   const generateChartDataUrl = async (chartConfig, width = 500, height = 500) => {
    if (!chartConfig) return null;
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const chart = new ChartJS(canvas.getContext('2d'), {
      type: 'pie',
      data: chartConfig,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        layout: { padding: 10 },
        animation: false,
        plugins: {
          tooltip: { enabled: true },
          legend: {
            position: "right",
            labels: {
              boxWidth: 10,
              font: {size:18},
              filter: (legendItem, data) => {
                return data.datasets[0].data[legendItem.index] !== 0;
              }
            },
          },
          datalabels: {
            color: "#fff",
            display: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value !== 0;   // ✅ hide labels when value is 0
            },
            font: { weight: "bold", size: 18 }
          },
        },
      },
    });

    await new Promise(requestAnimationFrame); // ensure first draw completed
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    chart.destroy();
    return dataUrl;
  };
  
  async function getFeatures(layer) {
    const query = layer.createQuery();
    query.where = "1=1";
    query.outFields = ["objectid"];

    const result = await layer.queryFeatures(query);
    return result.features;
  }


  async function exportAllMaps() {
    const features = await getFeatures(baselineLayer);
    const images = [];

    for (const feature of features) {
      const oid = feature.attributes.objectid;
      await handleFeatureSelect(oid);
      await map.view.whenLayerView(baselineLayer);
      await map.view.whenLayerView(empCommuteLayer);
      await map.view.when(() => !map.view.updating);
      await new Promise(resolve => setTimeout(resolve, 500));
      const screenshot = await map.view.takeScreenshot({
        format: "png",
        quality: 400
      });
      images.push({
        oid,
        dataUrl: screenshot.dataUrl
      });
    }
    console.log("Captured images:", images);
    setImageArray(images)
    setPrintingActive(false)
    return images;
  };


  const handleFeatureSelect = useCallback(async (oid) => {
    if (baselineLayer && empCommuteLayer) {
      const inMapLayer = map?.map?.layers?.find(l => l?.title?.includes(baselineLayer.title));
      const inMapCommuteLayer = map?.map?.layers?.find(l => l?.title?.includes(empCommuteLayer.title));
      const inMapTradeAreaLayer = map?.map?.layers?.find(l => l?.title?.includes("Trade Areas"))
      if (!oid) {
        // empCommuteLayer.queryFeatures().then((results) => console.log("layer features", results.features))
        const layerView = await map?.view.whenLayerView(inMapLayer);
        layerView.title = `${baselineLayer.title} layer view`;
        layerView.filter = new FeatureFilter({where: `1=1`});
        const commuteLayerView = await map?.view.whenLayerView(inMapCommuteLayer);
        commuteLayerView.title = `${empCommuteLayer.title} layer view`;
        commuteLayerView.filter = new FeatureFilter({where: `1=0`});
        if (inMapTradeAreaLayer) {
          const tradeAreaLayerView = await map?.view.whenLayerView(inMapTradeAreaLayer);
          tradeAreaLayerView.title = `${tradeAreaLayer.title} layer view`;
          tradeAreaLayerView.filter = new FeatureFilter({where: `1=0`});
        }
        return;
      }
      const layerView = await map?.view.whenLayerView(inMapLayer);
      layerView.title = `${baselineLayer.title} layer view`;
      layerView.filter = new FeatureFilter({where: `objectid = ${oid}`});
        
      // empCommuteLayer.queryFeatures().then((results) => console.log("layer features", results.features))
      const commuteLayerView = await map?.view.whenLayerView(inMapCommuteLayer);
      commuteLayerView.title = `${empCommuteLayer.title} layer view`;
      const commuteWhere = `bldsite = '${String(oid)}'`
      commuteLayerView.filter = new FeatureFilter({where: commuteWhere});
      
      if (inMapTradeAreaLayer) {
        const tradeAreaLayerView = await map?.view.whenLayerView(inMapTradeAreaLayer);
        tradeAreaLayerView.title = `${tradeAreaLayer.title} layer view`;
        tradeAreaLayerView.filter = new FeatureFilter({where: `objectid = ${oid}`});
      }
    }
  }, [baselineLayer, empCommuteLayer, setSelectedSite]);
  
  
  const handleLayerOrdering = useCallback(() => {
    if (layer !== null) {
      const compLayer = map?.map?.layers.items.find(
        (maplayer) => maplayer.title === layer?.title,
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
    if (empCommuteLayer) {
      const commLayer = map?.map?.layers.items.find(
        (layer) => layer.title === empCommuteLayer?.title,
      );
      map?.map?.reorder(commLayer, map?.map?.layers?.length - 4);
    }
    if (tradeAreaLayer) {
      const AreaLayer = map?.map?.layers.items.find(
        (layer) => layer.title === tradeAreaLayer?.title,
      );
      map?.map?.reorder(AreaLayer, map?.map?.layers?.length - 5);
    }
  }, [
    map,
    routeLayer,
    tradeAreaLayer,
    layer,
    empCommuteLayer,
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
        map?.map?.layers?.add(layer);
        layerExtents.push(layer?.fullExtent);
      }      
      if (empCommuteLayer) {
        const compLayer = map?.map?.layers.items.find(
          (maplayer) => maplayer.title === layer?.title,
        );
        if (compLayer) {
          map?.map?.remove(compLayer);
        }
        map?.map?.layers?.add(empCommuteLayer);
        layerExtents.push(empCommuteLayer?.fullExtent);
        const featureLayerView = map?.view?.layerViews?.find((layerView) =>
          empCommuteLayer.title === layerView.title,
        );
        commuteLayerViewRef.current = featureLayerView;
        handleFeatureSelect(null)
      }
      if (baselineLayer) {
        map?.map?.layers?.addMany([baselineLayer]);
        layerExtents.push(baselineLayer?.fullExtent);
        const featureLayerView = map?.view?.layerViews?.find((layerView) =>
          baselineLayer.title === layerView.title,
        );
        siteLayerViewRef.current = featureLayerView;
      }
      if (tradeAreaLayer) {
        const inMapLayer = map?.map?.layers?.find((l) =>
          l.title.includes("Trade Areas"),
        );
        if (!inMapLayer) map?.map?.layers?.addMany([tradeAreaLayer]);
        layerExtents.push(tradeAreaLayer?.fullExtent);
        handleFeatureSelect(null)
      }
      if (routeLayer) {
        map?.map?.layers?.addMany([routeLayer]);
        layerExtents.push(routeLayer?.fullExtent);
      }
      if (layerExtents?.length > 0) {
        map?.view?.goTo(layerExtents.filter((extent) => extent !== null));
      }
      handleLayerOrdering();
      handleFeatureSelect(selectedSite)
    } catch (err) {
      console.error("An error ocurred while loading layers: ", err);
    }
  }, [
    map,
    mapAvailable,
    layer,
    empCommuteLayer,
    baselineLayer,
    tradeAreaLayer,
    routeLayer,
    handleLayerOrdering,
    selectedSite,
    handleFeatureSelect
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
      <arcgis-expand slot="top-left" icon="legend">
        <arcgis-legend reference-element="app-map"></arcgis-legend>
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
      {configReady && (
        <arcgis-placement slot="top-right">
          <CalciteButton appearance="outline-fill" iconStart="file-report" 
            onClick={() => {
              setPrintingActive(true)
              exportAllMaps()
            }}
          >View Report</CalciteButton>
        </arcgis-placement>
      )}
      <arcgis-zoom slot="top-left"></arcgis-zoom>
    </arcgis-map>
  );
};

export default MapComponent;
