/* eslint-disable no-unused-vars */
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic.js";
import CIMSymbol from "@arcgis/core/symbols/CIMSymbol";
import CSVLayer from "@arcgis/core/layers/CSVLayer.js";
import * as locator from "@arcgis/core/rest/locator.js";
import esriRequest from "@arcgis/core/request.js";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import {
  siteSymbol,
  employeeSymbol,
  inboundSymbol,
  outboundSymbol,
} from "../map-symbols/MapSymbols";

function toProperCase(str) {
  if (str) {
    return str
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }
}

function getRoleSymbol(role) {
  switch (role) {
    case "Site":
      return siteSymbol;
    case "Employee":
      return employeeSymbol;
    case "RouteSource":
      return inboundSymbol;
    case "RouteDestination":
      return outboundSymbol;
    default:
      break;
  }
}

function numFormatter(num, minDigits, maxDigits) {
  if (minDigits === undefined) minDigits = 0;
  if (maxDigits === undefined) maxDigits = 2;
  const formatter = new Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: minDigits, // Ensure at least two decimal places
    maximumFractionDigits: minDigits, // Limit to two decimal places
  });
  const formattednumber = formatter.format(num)
  if (formattednumber.includes('-')) {
    return(`(${formatter.format(num).replace('-','')})`)
  } else {
    return formatter.format(num);
  }
}
// Basic usage with specific locale and options
const formatter = new Intl.NumberFormat("en-US", {
  useGrouping: true,
  minimumFractionDigits: 0, // Ensure at least two decimal places
  maximumFractionDigits: 2, // Limit to two decimal places
});

const intFormatter = new Intl.NumberFormat("en-US", {
  useGrouping: true,
  minimumFractionDigits: 0, // Ensure at least two decimal places
  maximumFractionDigits: 0, // Limit to two decimal places
});

function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const item = lookup.findLast(item => absNum >= item.value);
  if (!item) return "0";

  // Truncate instead of round
  const factor = Math.pow(10, digits);
  const truncated = Math.floor((absNum / item.value) * factor) / factor;

  const formatted = truncated.toString().replace(regexp, "") + item.symbol;

  return isNegative ? `-${formatted}` : formatted;
}

function handleCalciteBlocksDisplay(e) {
  e.target.parentElement.childNodes.forEach((block) => {
    if (block === e.target) return;
    block.expanded = false;
  });
}

async function CsvParse(csvString) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true, // Treat first row as headers
      dynamicTyping: false, // Attempt to convert values to numbers, booleans, etc.
      skipEmptyLines: true,
      complete: function (results) {
        resolve(results.data);
      },
      error: function (err) {
        reject(err);
      },
    });
  });
}

async function geocodeLocations(
  addressCandidates,
  addressFields,
  latitudeFieldName,
  longitudeFieldName,
  coordinateFieldName,
  coordinateFieldType,
  locationType
) {
  if (locationType === "address") {
    const atlasNAGeocoder =
      "https://colliers-atlas-standalone.eastus.cloudapp.azure.com/arcgis/rest/services/Geocode_2025Q1/NorthAmerica/GeocodeServer";
    const inputAddresses = addressCandidates.map((candidate, i) => {
      candidate.attributes.OBJECTID = i + 1;
      const requestObject = { OBJECTID: i + 1 };
      Object.entries(addressFields).forEach(([key, value]) => {
        requestObject[`${key}`] = candidate.attributes[`${value}`];
      });
      return requestObject;
    });
    const addressLocations = await locator
      .addressesToLocations(atlasNAGeocoder, { addresses: inputAddresses })
      .then((response) => response);
    const locatedGraphics = addressCandidates.map((candidateAttributes) => {
      const candidateLocation = addressLocations.find(
        (location) =>
          location.attributes.ResultID ===
          candidateAttributes.attributes.OBJECTID
      );
      return new Graphic({
        attributes: candidateAttributes.attributes,
        geometry: candidateLocation.location,
      });
    });

    return locatedGraphics;
  }

  if (locationType === "coordinates") {
    const locatedGraphics = addressCandidates.map((site) => {
      return new Graphic({
        attributes: site.attributes,
        geometry: {
          type: "point", // autocasts as new Point()
          longitude:
            site.attributes[longitudeFieldName] ||
            site.attributes[coordinateFieldName].split(", ")?.[1],
          latitude:
            site.attributes[latitudeFieldName] ||
            site.attributes[coordinateFieldName].split(", ")?.[0],
        },
      });
    });

    return locatedGraphics;
  } else {
    throw new Error(`Unknown locationType: ${locationType}`);
  }
}

async function generateFeaturesFromFileData(file, role) {
  function getFileExtension(supportedFileType) {
    return supportedFileType === "shapefile" ? ".zip" : `.${supportedFileType}`;
  }

  function getFileType(name) {
    // const SupportedFileTypes = {
    //   CSV: "csv",
    //   GeoJson: "geojson",
    //   Shapefile: "shapefile",
    //   KML: "kml",
    //   GPX: "gpx",
    // };

    // return Object.values(SupportedFileTypes).find((t) =>
    //   name?.endsWith(getFileExtension(t))
    // );
    return "csv";
  }

  function getFileInfo(file) {
    const type = getFileType(file.name);
    const name = `${role}s from ${type}`; //file?.name?.replace(`.${type}`, "");
    const data = new FormData();
    data.set("file", file);
    data.set("filetype", type);
    data.set("f", "json");
    return {
      id: uuidv4(),
      type,
      name,
      data,
      size: file.size,
    };
  }

  function fileToObjectArray(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = function (error) {
        reject(error); // Reject the promise on error
      };
      reader.onload = (e) => {
        // console.log(e.target.result);
        resolve(e.target.result);
      };

      reader.readAsText(file);
    });
  }

  const fileInfo = getFileInfo(file);
  // console.log("file", file);

  const data = fileToObjectArray(file);
  // console.log(await data);
  const fileRecords = CsvParse(await data).then((records) =>
    records.map((record) => ({ attributes: record }))
  );
  // console.log(await fileRecords);

  const portalUrl = `https://atlas.colliers.com/portal`;
  let publishParameters = {};

  // GPX file does not need publishParameters
  if (fileInfo.type !== "gpx") {
    // 1. Use REST API analyze to get `publishParameters` which is needed in REST API generate.
    const analyzeUrl = `${portalUrl}/sharing/rest/content/features/analyze`;
    fileInfo.data.set(
      "analyzeParameters",
      JSON.stringify({
        enableGlobalGeocoding: true,
        geocodeServiceUrl:
          "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer", //"https://colliers-atlas-standalone.eastus.cloudapp.azure.com/arcgis/rest/services/Geocode_2025Q1/NorthAmerica/GeocodeServer",
        // sourceLocale: getAppStore().getState().appContext?.locale ?? "en", // TODO: use org geocode service
        resultRecordCount: 2,
      })
    );
    const analyzeResponse = await esriRequest(analyzeUrl, {
      body: fileInfo.data,
      method: "get",
    });
    console.log("analyze response", analyzeResponse);
    fileInfo.data.delete("analyzeParameters");
    const {
      publishParameters: {
        addressFields,
        coordinateFieldName,
        coordinateFieldType,
        latitudeFieldName,
        longitudeFieldName,
        locationType,
        layerInfo: { fields },
      },
      records,
    } = await analyzeResponse.data;

    const fieldsForFeatureLayer = fields;
    fieldsForFeatureLayer.forEach(
      (field) => (field.type = field.type.split("Type")[1].toLowerCase())
    );
    fieldsForFeatureLayer.push({
      name: "OBJECTID",
      type: "oid",
      alias: "OBJECTID",
    });

    const featureGraphics = await geocodeLocations(
      await fileRecords,
      await addressFields,
      await latitudeFieldName,
      await longitudeFieldName,
      await coordinateFieldName,
      await coordinateFieldType,
      await locationType
    );

    const roleSymbol = getRoleSymbol(role);

    const geocodedFeatureLayer = await new FeatureLayer({
      ...analyzeResponse.data.layerInfo,
      source: await featureGraphics,
      objectIdField: "OBJECTID",
      fields: fieldsForFeatureLayer,
      title: `${role}s from ${fileInfo.type}`,
      renderer: {
        type: "simple",
        symbol: new CIMSymbol({
          data: {
            type: "CIMSymbolReference",
            symbol: roleSymbol, // ENTER SYMBOL JSON HERE
          },
        }),
      },
    });
    return await geocodedFeatureLayer;
  }
}

async function getCsvHeaders(csvContent, type) {
  const lines = csvContent.split(/\r?\n/); // Split content by line breaks
  if (lines.length > 0) {
    const headers = lines[0].split(","); // Assuming comma as delimiter
    const fieldList = [];
    headers.forEach((field) => {
      const fieldObject = {
        name: field,
        alias: field,
        type: "string",
      };
      fieldList.push(fieldObject);
    });

    const data = await CsvParse(csvContent);
    const latFields = ["latitude", "lat", "y"];
    const longFields = ["longitude", "lon", "long", "x"];
    const AddressFields = ["address", "property_address"];
    const ZipFields = ["zip", "zipcode", "zip code"];
    const outLatField = headers.filter((item1) =>
      latFields.some((item2) => item1.toLowerCase() === item2.toLowerCase())
    );
    const outLongField = headers.filter((item1) =>
      longFields.some((item2) => item1.toLowerCase() === item2.toLowerCase())
    );
    if (outLatField.length > 0 && outLongField.length > 0) {
      const blob = new Blob([csvContent], {
        type: "plain/text",
      });
      let url = URL.createObjectURL(blob);
      const outLayer = new CSVLayer({
        url: url,
        latitudeField: outLatField,
        longitudeField: outLongField,
        title: `CSV ${type} layer`,
        id: uuidv4(),
      });
      return outLayer;
    } else {
      const outAddress = headers.filter((item1) =>
        AddressFields.some(
          (item2) => item1.toLowerCase() === item2.toLowerCase()
        )
      );

      const graphics = await Promise.all(
        data.map(async (row) => {
          const geocodeResult = await locator.addressToLocations(
            // "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            "https://colliers-atlas-standalone.eastus.cloudapp.azure.com/arcgis/rest/services/Geocode_2025Q1/NorthAmerica/GeocodeServer",
            {
              address: {
                SingleLine: row.address,
              },
            }
          );

          if (geocodeResult[0]) {
            console.log(
              "Graphic: ",
              row,
              geocodeResult[0].location.latitude,
              geocodeResult[0].location.longitude
            );
            const location = geocodeResult[0].location;
            return new Graphic({
              geometry: {
                type: "point",
                longitude: location.longitude,
                latitude: location.latitude,
              },
              attributes: row,
            });
          }

          return null; // Skip if no result
        })
      );

      // Filter out any null values
      const validGraphics = graphics.filter((g) => g !== null);

      const outLayer = new FeatureLayer({
        title: `${type} layer`,
        spatialReference: { wkid: 4326 },
        source: validGraphics,
        objectIdField: "ObjectID",
        geometryType: "point",
        popupEnabled: true,
        fields: fieldList,
      });

      // console.log(outLayer.source);

      return outLayer;
    }
  }
  return []; // Return an empty array if no content
}

async function negativeToParentheses(value) {
  const numValue = Number(value);
  // console.log('value',value)
  // console.log("numValue", numValue);
  // console.log('------------------------')
  if (numValue < 0) {
    // console.log("Value", numValue);
    return `(${formatter.format(Math.abs(numValue))})`;
  } else {
    return formatter.format(value);
  }
}

export {
  toProperCase,
  numFormatter,
  formatter,
  intFormatter,
  nFormatter,
  handleCalciteBlocksDisplay,
  generateFeaturesFromFileData,
  getCsvHeaders,
  negativeToParentheses,
};
