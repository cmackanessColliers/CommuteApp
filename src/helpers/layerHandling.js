import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";

async function CreateFeatureLayer(features) {
    const fieldList = [
      {
        name:"objectid",
        alias: "objectid",
        type:"oid"
      },
      {
        name:"name",
        alias: "Name",
        type:"string"
      }, 
      {
        name:"latitude",
        alias: "Latitude",
        type:"double"
      }, 
      {
        name:"longitude",
        alias: "Longitude",
        type:"double"
      },
      {
        name:"x",
        alias: "X",
        type:"double"
      },
      {
        name:"y",
        alias: "Y",
        type:"double"
      }
    ]
    const popupTemplate = [
      {
        fieldName:"name",
        label: "Name"
      },
      {
        fieldName:"latitude",
        label: "Latitude"
      },
      {
        fieldName:"longitude",
        label: "Longitude"
      },
      {
        fieldName:"x",
        label: "X"
      },
      {
        fieldName:"y",
        label: "Y"
      },
    ]
    const CompareLayer = new FeatureLayer({
      title:"Comparison Locations",
      source: features,
      spatialReference: {wkid:4326},
      geometryType: "point",
      objectIdField: "objectid",
      popupEnabled: true,
      fields: fieldList,
      popupTemplate: popupTemplate
    })
    return CompareLayer
}
const fieldList = [
    {
      name:"objectid",
      alias: "objectid",
      type:"oid"
    },
    {
      name:"name",
      alias: "Name",
      type:"string"
    }, 
    {
      name:"latitude",
      alias: "Latitude",
      type:"double"
    }, 
    {
      name:"longitude",
      alias: "Longitude",
      type:"double"
    },
    {
      name:"x",
      alias: "X",
      type:"double"
    },
    {
      name:"y",
      alias: "Y",
      type:"double"
    }
  ]
  const popupTemplate = [
    {
      fieldName:"name",
      label: "Name"
    },
    {
      fieldName:"latitude",
      label: "Latitude"
    },
    {
      fieldName:"longitude",
      label: "Longitude"
    },
    {
      fieldName:"x",
      label: "X"
    },
    {
      fieldName:"y",
      label: "Y"
    },
  ]
const compRenderer = {
        type:"simple",
        symbol: {
          type: "simple-marker", // Automatically instantiates a SimpleMarkerSymbol
          style: "circle",
          color: "#1C54F4", // Orange color (RGB)
          size: "14px",
          outline: {            // Automatically instantiates a SimpleLineSymbol
            color: [255, 255, 255], // White outline
            width: 2
          }
        }
      }
const baseRenderer = {
        type:"simple",
        symbol: {
          type: "simple-marker", // Automatically instantiates a SimpleMarkerSymbol
          style: "circle",
          color: "#25408F", // Orange color (RGB)
          size: "18px",
          outline: {            // Automatically instantiates a SimpleLineSymbol
            color: [255, 255, 255], // White outline
            width: 2
          }
        }
      }
export {
  CreateFeatureLayer,
  fieldList,
  popupTemplate,
  compRenderer,
  baseRenderer
}