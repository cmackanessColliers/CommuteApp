import { CommuteFields } from "./CommuteFields";


let esriConfig,
  TravelTimeClient,
  Query,
  FeatureLayer,
  Graphic,
  travelTimeClient,
  myQuery,
  ZipLayer,
  LaborDemoLayer,
  USACompareLayer;

async function initializeArcGisModules() {
  if (esriConfig) return; // Already initialized
  const TravelTimeApi = await import("traveltime-api");
  TravelTimeClient = TravelTimeApi.TravelTimeClient;
  [esriConfig, Query, FeatureLayer, Graphic] = await Promise.all([
    import("@arcgis/core/config.js").then((m) => m.default),
    import("@arcgis/core/rest/support/Query.js").then((m) => m.default),
    import("@arcgis/core/layers/FeatureLayer.js").then((m) => m.default),
    import("@arcgis/core/Graphic.js").then((m) => m.default),
  ]);
  esriConfig.portalUrl = "https://atlas.colliers.com/portal";

  const appId = import.meta.env.VITE_TRAVELTIME_APP_ID;
  const appKey = import.meta.env.VITE_TRAVELTIME_APP_KEY;
  travelTimeClient = new TravelTimeClient(
    {
      applicationId: appId,
      apiKey: appKey,
    },
    { rateLimitSettings: { enabled: true, retryCount: 0 } }
  );

  myQuery = new Query();
  myQuery.where = "1=1";
  myQuery.returnGeometry = true;
  myQuery.returnQueryGeometry = true;
  myQuery.outFields = ["*"];

  ZipLayer = new FeatureLayer({
    portalItem: {
      id: "e5e0288563f44731a8c9fd8a2c6ff45f",
    },
    spatialReference: { wkid: 4326 },
    title: "VeloZipLayer",
  });

  USACompareLayer = new FeatureLayer({
    portalItem: {
      id: "3fd713c54e1140d8ae2b4b96b988eb32",
    },
    spatialReference: { wkid: 4326 },
  });

  LaborDemoLayer = new FeatureLayer({
    portalItem: {
      id: "6e16777eb18d409fb9085531a4eb9d36",
    },
    spatialReference: { wkid: 4326 },
  });

}


export async function generateCommuteAnalysis(
  BldSites,
  EMPSitesLayer,
  travelMode,
  baselineFeature,
  employeeCountField,
  nameField,
) {
  await initializeArcGisModules();
  const CommuteAnalysisAPI = new URL(
    "https://api.traveltimeapp.com/v4/time-filter"
  );
  let EMPSiteCoordList = [];
  let BLDSiteCoordList = [];
  let EMPLocList = [];
  let BLDLocList = [];
  const BLDsiteLookup = {};
  const appId = import.meta.env.VITE_TRAVELTIME_APP_ID;
  const appKey = import.meta.env.VITE_TRAVELTIME_APP_KEY;
  const allIsoGraphics = {};

  const baselineSiteStats = {};
  BldSites.forEach((feature) => {
    BLDSiteCoordList.push({
      id: `BLD_${feature.attributes.objectid}`,
      coords: {
        lng: feature.geometry.longitude,
        lat: feature.geometry.latitude,
      },
    });
    const oid = feature.attributes.objectid;
    BLDLocList.push(`BLD_${feature.attributes.objectid}`);
    BLDsiteLookup[`BLD_${oid}`] = {
      attributes: {},
      geometry: feature.geometry,
    };
  });``

  const EMPfeatureSet = await EMPSitesLayer.queryFeatures(myQuery);
  EMPfeatureSet.features.forEach((feature) => {
    // console.log("employee feature", feature);
    EMPSiteCoordList.push({
      id: `EMP_${feature.attributes.objectid}`,
      coords: {
        lng: feature.geometry?.longitude || null,
        lat: feature.geometry?.latitude || null,
      },
    });
    EMPLocList.push(`EMP_${feature.attributes.objectid}`);
  });

  function calculateAverage(arr) {
    if (arr.length === 0) {
      return 0;
    }
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum / arr.length;
  }

  const featureBuilder = (iso) => {
    // console.log(iso);
    const [sourceFeature] = iso.search_id.split(" ");
    const TravelTimeList = [];
    const TravelDistList = [];
    const CommuteDict = {};
    for (const prop in iso.locations) {
      const empSite = iso.locations[prop].id.split("_")[1];
      CommuteDict[empSite] = {
        travelTime: iso.locations[prop].properties[0].travel_time / 60,
        travelDist: iso.locations[prop].properties[0].distance / 1609.34,
      };
      TravelTimeList.push(iso.locations[prop].properties[0].travel_time / 60);
      TravelDistList.push(iso.locations[prop].properties[0].distance / 1609.34);
    }
    if (employeeCountField) {
      EMPfeatureSet.features.forEach((feature) => {
        const oid = feature.attributes.objectid;
        CommuteDict[oid]["EmployeeCount"] =
          feature.attributes[employeeCountField];
      });
    }

    let numEmployees = 0;
    let Time0_10 = 0;
    let Time10_20 = 0;
    let Time20_30 = 0;
    let Time30_40 = 0;
    let Time40_50 = 0;
    let Time50_60 = 0;
    let Time60Plus = 0;
    let AvgTime = calculateAverage(TravelTimeList);
    let AvgDist = calculateAverage(TravelDistList);

    if (!employeeCountField) {
      for (const time in TravelTimeList) {
        if (TravelTimeList[time] <= 10) {
          Time0_10 = Time0_10 + 1;
          numEmployees = numEmployees + 1;
        } else if (TravelTimeList[time] > 10 && TravelTimeList[time] <= 20) {
          Time10_20 = Time10_20 + 1;
          numEmployees = numEmployees + 1;
        } else if (TravelTimeList[time] > 20 && TravelTimeList[time] <= 30) {
          Time20_30 = Time20_30 + 1;
          numEmployees = numEmployees + 1;
        } else if (TravelTimeList[time] > 30 && TravelTimeList[time] <= 40) {
          Time30_40 = Time30_40 + 1;
          numEmployees = numEmployees + 1;
        } else if (TravelTimeList[time] > 40 && TravelTimeList[time] <= 50) {
          Time40_50 = Time40_50 + 1;
          numEmployees = numEmployees + 1;
        } else if (TravelTimeList[time] > 50 && TravelTimeList[time] <= 60) {
          Time50_60 = Time50_60 + 1;
          numEmployees = numEmployees + 1;
        } else {
          Time60Plus = Time60Plus + 1;
          numEmployees = numEmployees + 1;
        }
      }
    } else {
      for (const site in CommuteDict) {
        if (CommuteDict[site].travelTime <= 10) {
          Time0_10 = Time0_10 + CommuteDict[site].EmployeeCount;
        } else if (
          CommuteDict[site].travelTime > 10 &&
          CommuteDict[site].travelTime <= 20
        ) {
          Time10_20 = Time10_20 + CommuteDict[site].EmployeeCount;
        } else if (
          CommuteDict[site].travelTime > 20 &&
          CommuteDict[site].travelTime <= 30
        ) {
          Time20_30 = Time20_30 + CommuteDict[site].EmployeeCount;
        } else if (
          CommuteDict[site].travelTime > 30 &&
          CommuteDict[site].travelTime <= 40
        ) {
          Time30_40 = Time30_40 + CommuteDict[site].EmployeeCount;
        } else if (
          CommuteDict[site].travelTime > 40 &&
          CommuteDict[site].travelTime <= 50
        ) {
          Time40_50 = Time40_50 + CommuteDict[site].EmployeeCount;
        } else if (
          CommuteDict[site].travelTime > 50 &&
          CommuteDict[site].travelTime <= 60
        ) {
          Time50_60 = Time50_60 + CommuteDict[site].EmployeeCount;
        } else {
          Time60Plus = Time60Plus + CommuteDict[site].EmployeeCount;
        }
      }
    }

    if (baselineFeature?.length > 0) {
      if (
        sourceFeature === `BLD_${baselineFeature?.[0]?.attributes.objectid}`
      ) {
        baselineSiteStats["AverageCommuteTime"] =
          Math.round(AvgTime * 100) / 100;
        baselineSiteStats["AverageCommuteDist"] =
          Math.round(AvgDist * 100) / 100;
      }
    }
    
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_Under10"] = Time0_10;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_Under10"] = ((Time0_10/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_10_20"] = Time10_20;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_10_20"] = ((Time10_20/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_20_30"] = Time20_30;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_20_30"] = ((Time20_30/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_30_40"] = Time30_40;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_30_40"] = ((Time30_40/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_40_50"] = Time40_50;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_40_50"] = ((Time40_50/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_50_60"] = Time50_60;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_50_60"] = ((Time50_60/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_60Plus"] = Time60Plus;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_60Plus"] = ((Time60Plus/numEmployees)*100).toFixed(2);
    BLDsiteLookup[sourceFeature].attributes["AverageCommuteTime"] = Math.round(AvgTime * 100) / 100;
    BLDsiteLookup[sourceFeature].attributes["AverageCommuteDist"] = Math.round(AvgDist * 100) / 100;
    BLDsiteLookup[sourceFeature].attributes["CommuteTime_Under30"] = Time0_10 + Time10_20 + Time20_30;
    BLDsiteLookup[sourceFeature].attributes["CommutePct_Under30"] = (((Time0_10 + Time10_20 + Time20_30)/numEmployees)*100).toFixed(2);

    const OID = sourceFeature.split("_")[1];
    const outAttributes = {};
    allIsoGraphics[OID] = BLDsiteLookup[sourceFeature].attributes;
    return outAttributes;
  };


  for (let i = 0; i < BLDSiteCoordList.length; i += 10) {
    const batch = BLDSiteCoordList.slice(i, i + 10);
    const ApiCallArray = [];
    const ReqLocList = [];
    ReqLocList.push(...EMPSiteCoordList);
    for (const bld of batch) {
      // push just this batch’s buildings (not the global list)
      ReqLocList.push(bld);
      const APICall = {
        id: `${bld.id} ${travelMode}`,
        departure_location_id: bld.id,
        arrival_location_ids: EMPLocList,
        departure_time: "2025-08-09T9:00:00-05:00",
        travel_time: 14400,
        properties: ["travel_time", "distance"],
        transportation: { type: `${travelMode}` },
      };
      ApiCallArray.push(APICall);
    }
    const APICallBatch = {
      locations: ReqLocList,
      departure_searches: ApiCallArray,
    };
    const response = await fetch(CommuteAnalysisAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Application-Id": appId,
        "X-Api-Key": appKey,
      },
      body: JSON.stringify(APICallBatch),
    });

    const jsonOut = await response.json();
    const batchGraphics = jsonOut?.results?.map((feature) =>
      featureBuilder(feature)
    );
    // allIsoGraphics.push(...batchGraphics);
  }
  for (const graphic in allIsoGraphics) {
    allIsoGraphics[graphic]["CommuteTimeDifference"] =
      Math.round(
        (allIsoGraphics[graphic].AverageCommuteTime -
          baselineSiteStats.AverageCommuteTime) *
          100
      ) / 100;
    allIsoGraphics[graphic]["CommuteDistDifference"] =
      Math.round(
        (allIsoGraphics[graphic].AverageCommuteDist -
          baselineSiteStats.AverageCommuteDist) *
          100
      ) / 100;
  }
  console.log("Commute Graphics", allIsoGraphics)
  return allIsoGraphics;
}