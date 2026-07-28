import {
  processIsochroneResults,
  processH3Results,
  processRouteResults,
} from "./worker_preps/travel_time_processing";
import * as bufferOperator from "@arcgis/core/geometry/operators/bufferOperator.js";
import * as unionOperator from "@arcgis/core/geometry/operators/unionOperator.js"
import * as projection from "@arcgis/core/geometry/projection";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import { rankingFields } from "./routing_fields";
import { formatter, intFormatter, numFormatter } from "./utils";
import { routesSymbols, tradeAreaSymbol } from "../map-symbols/MapSymbols";

let Graphic, Circle, FeatureLayer, TravelTimeClient;

function generateTradeAreaSymbol(travelTimes) {
  const colorArray = [["#1c56f41e", "#1c56f423"], ["#25408f1c", "#25408f81"], ["#00075917", "#00075952"]]
  const styleArray = []
  travelTimes.map((time, index) => {
    const style = {
      value: time / 60,
      symbol: {
      type: "simple-fill",
      color: colorArray[index][0],
      outline: {
        color: colorArray[index][1],
        width: "1px",
      },
    }}
    styleArray.push(style)
  })
  const outputTradeAreaSymbol = new UniqueValueRenderer({
    type: "unique-value", // autocasts as new SimpleRenderer()
    field: "travelTime",
    defaultSymbol: {
      type: "simple-fill",
      color: [0, 7, 89, .15],
      outline: {
        color: [255, 255, 255, 1],
        width: "1px",
      },
    },
    uniqueValueInfos: styleArray,
  });
  console.log("outputTradeAreaSymbol", outputTradeAreaSymbol)
  return outputTradeAreaSymbol
}

async function initializeModules() {
  if (Graphic) return; // Already initialized

  const graphicModule = await import("@arcgis/core/Graphic");
  Graphic = graphicModule.default;

  const circleModule = await import("@arcgis/core/geometry/Circle.js");
  Circle = circleModule.default;

  const featureLayerModule = await import("@arcgis/core/layers/FeatureLayer");
  FeatureLayer = featureLayerModule.default;

  const travelTimeClientModule = await import("traveltime-api");
  TravelTimeClient = travelTimeClientModule.TravelTimeClient;
}

function convert24HtoISO(string24hr) {
  const today = new Date();
  const [hours, minutes] = string24hr.split(":");
  today.setHours(hours, minutes, 0, 0);
  return today.toISOString();
}

async function generateGraphics(
  areaType,
  features = undefined,
  oidField = undefined,
  travelMode = undefined,
  travelDuration = undefined,
  radius = undefined,
  h3Resolution = undefined,
  sourceSites = undefined,
  destinationSites = undefined,
  routeTimeOfDays = undefined,
  routeCosts = undefined,
  nameField = undefined,
) {
  await initializeModules();
  console.log(
    // "features:",
    // features.map((f) => f.geometry?.latitude + ", " + f.geometry?.longitude),
    "travel Mode:",
    travelMode,
    "travel Duration:",
    travelDuration,
  );
  features.forEach((f) => {
    if (!f.geometry?.latitude || !f.geometry?.longitude) {
      console.error("Feature missing geometry:", f);
    }
  });
  console.table(
    features.map((f) => ({
      coords: f.geometry?.latitude + ", " + f.geometry?.longitude,
      attributes: f.attributes[nameField] || f.attributes.name || f.attributes.objectid,
    })),
  );
  const travelTimeClient = new TravelTimeClient(
    {
      applicationId: import.meta.env.VITE_TRAVELTIME_APP_ID,
      apiKey: import.meta.env.VITE_TRAVELTIME_APP_KEY,
    },
    {
      rateLimitSettings: {
        enabled: true,
        retryCount: 1,
        hitsPerMinute: 120, //half of contract limit: 240
        timeBetweenRetries: 2000,
      },
    },
  );
  switch (areaType) {
    case "isochrone": {
      const arrival_searches = features.flatMap((feature) => {
        const searchBatch = travelDuration.map((time) => {
          const search = {
            id: `${feature.attributes[oidField]}_${time}`,
            travel_time: time,
            coords: {
              lat: feature.geometry.latitude,
              lng: feature.geometry.longitude,
            },
            transportation: { type: travelMode },
            arrival_time: "2025-11-17T10:00:00Z",
            // no_holes: true,
          }
          return search;
        })
        return searchBatch;
      });

      // // Batch the arrival searches to avoid exceeding API limits
      // // Each batch will contain a maximum of 10 searches
      // // If fail on one search of batch the whole batch fails
      // const batchedArrivalSearches = () => {
      //   const batchSize = 10; // Define the size of each batch
      //   const batches = [];
      //   for (let i = 0; i < arrival_searches.length; i += batchSize) {
      //     const batch = {
      //       arrival_searches: arrival_searches.slice(i, i + batchSize),
      //     };
      //     batches.push(batch);
      //   }
      //   return batches;
      // };

      // Alternative batching: Each search in its own batch to isolate failures

      console.time("Isochrone Batch Request Time");
      console.log("arrival_searches", arrival_searches)

      const data = { type: "FeatureCollection", features: [] };

      if (arrival_searches.length > 10) {
        const batchedArrivalSearches = () => {
        const batches = [];

        for (let i = 0; i < arrival_searches.length; i += 10) {
          batches.push({
            arrival_searches: arrival_searches.slice(i, i + 10),
          });
        }

        return batches;
      };
        console.log("batchedArrivalSearches", batchedArrivalSearches())
        const batchResponses = await travelTimeClient.timeMapBatch(
          batchedArrivalSearches(),
          "application/geo+json",
        );
        console.log("batchResponses", batchResponses);
        // TODO: Handle failed batches more gracefully
        const successfulBatches = batchResponses.filter(
          (batch) => batch.type === "success",
        );

        data.features.push(
          ...successfulBatches.flatMap((batch) => batch.body.features),
        );
      } else {
        const singleBatchResponse = await travelTimeClient.timeMap(
          {
            arrival_searches: arrival_searches,
          },
          "application/geo+json",
        );
        data.features.push(...singleBatchResponse.features);
      }

      console.timeEnd("Isochrone Batch Request Time");

      console.log("Isochrone raw data", data);
      // Use pure processor to prepare serializable geometry + attrs
      const processed = processIsochroneResults(
        data,
        features,
        oidField,
        travelDuration,
      );
      const graphicFeatures = processed.map(
        (item) =>
          new Graphic({
            geometry: {
              type: "polygon",
              rings: item.rings,
              spatialReference: { wkid: 4326 },
            },
            attributes: item.attributes,
          }),
      );
      return graphicFeatures;
    }
    case "radial": {
      let oidCounter = 1;

      const graphicFeatures = features.flatMap((feature) => {
        return radius.map((rad) => {
          return new Graphic({
            geometry: new Circle({
              center: [feature.geometry.longitude, feature.geometry.latitude],
              geodesic: true,
              numberOfPoints: 100,
              radius: rad,
              radiusUnit: "miles",
            }),
            attributes: {
              OBJECTID: oidCounter++,
              radius: rad,
              sourceFeature: feature.attributes[oidField],
            },
          });
        });
      });
      return graphicFeatures
    }
    case "h3": {
      const arrival_searches = features.map((feature) => {
        return {
          id: `${feature.attributes[oidField]}`,
          travel_time: travelDuration,
          coords: {
            lat: feature.geometry.latitude,
            lng: feature.geometry.longitude,
          },
          transportation: { type: travelMode },
          arrival_time: "2025-11-17T10:00:00Z",
          no_holes: true,
        };
      });

      const data = await travelTimeClient.h3Fast(
        {
          resolution: h3Resolution,
          properties: ["mean"],
          arrival_searches: {
            many_to_one: arrival_searches,
          },
        },
        "application/geo+json",
      );

      const processed = processH3Results(data, features, oidField);
      const graphicFeatures = processed.map((cells) =>
        cells.map(
          (cell) =>
            new Graphic({
              geometry: {
                type: "polygon",
                rings: cell.rings,
                spatialReference: { wkid: 4326 },
              },
              attributes: cell.attributes,
            }),
        ),
      );
      return graphicFeatures;
    }
    case "route": {
      const data = [];
      const sourceLocations = [];
      const destinationLocations = [];
      let oidCounter = 0;

      const candidateOidField = features?.[0]?.layer?.objectIdField;
      const sourceOidField = sourceSites?.objectIdField;
      const desintationOidField = destinationSites?.objectIdField;

      const sourceFeatures = await sourceSites
        ?.queryFeatures()
        .then((results) => results.features);
      if (sourceOidField !== undefined) {
        sourceLocations.push(
          ...(await sourceFeatures.map((feature) => ({
            id: `Source ${feature.attributes[sourceOidField]}`,
            coords: {
              lat: feature?.geometry?.latitude || 39.8283,
              lng: feature?.geometry?.longitude || -98.5795,
            },
          }))),
        );
      }
      console.log("sourceFeatures",sourceFeatures)

      const destinationFeatures = await destinationSites
        ?.queryFeatures()
        .then((results) => results.features);
      if (desintationOidField !== undefined) {
        destinationLocations.push(
          ...(await destinationFeatures.map((feature) => ({
            id: `Destination ${feature.attributes[desintationOidField]}`,
            coords: {
              lat: feature?.geometry?.latitude || 39.8283,
              lng: feature?.geometry?.longitude || -98.5795,
            },
          }))),
        );
      }

      if (sourceSites && !destinationSites) {
        // SourceSites to CandidateSites only
        // Arrival search type
        // TRAVELTIME ROUTE API LIMITATION: MAXIMUM OF TWO DEPARTURE LOCATIONS PER SEARCH
        features.map((feature) => {
          const arrival_searches = [];
          const candidateLocation = {
            id: `Candidate ${feature.attributes[candidateOidField]}`,
            coords: {
              lat: feature?.geometry?.latitude || 39.8283,
              lng: feature?.geometry?.longitude || -98.5795,
            },
          };
          console.log(candidateLocation);
          const locations = sourceLocations.concat([candidateLocation]);
          let sourceSitesIndexer = 0;
          while (sourceSitesIndexer < sourceLocations.length) {
            const sourceLocationsSubset = sourceLocations
              .slice(sourceSitesIndexer, sourceSitesIndexer + 2)
              .map((location) => location.id);
            arrival_searches.push({
              id: `Source sites [${sourceLocationsSubset}] to ${candidateLocation.id}`,
              departure_location_ids: sourceLocationsSubset,
              arrival_location_id: candidateLocation.id,
              transportation: { type: "driving" },
              arrival_time: convert24HtoISO(routeTimeOfDays["Arrival Time"]),
              properties: ["travel_time", "distance", "route"],
            });
            // INCREMENT TO NEXT SET OF FEATURES
            sourceSitesIndexer += 2;
          }
          // RUN SEARCH AFTER ALL SOURCE LOCATIONS HAVE BEEN ITERATED WITH CANDIDATE SITES
          console.log("locations", {
              locations,
              arrival_searches: arrival_searches,
            });
          const batchSize = 10;

          for (let i = 0; i < arrival_searches.length; i += batchSize) {
            const batch = arrival_searches.slice(i, i + batchSize);

            data.push(
              travelTimeClient.routes({
                locations,
                arrival_searches: batch,
              })
            );
          }

        });
      }

      const routeData = await Promise.allSettled(data).then((results) => {
        return results.map((result) => result.value.results).flat();
      });
      console.log("routeData", routeData);
      // Use pure processor to extract route geometry + attributes
      const processedRoutes = processRouteResults(
        routeData,
        features,
        candidateOidField,
        routeCosts,
      );
      console.log("processedRoutes", processedRoutes);
      const routeGraphics = processedRoutes.map((r) => {
        oidCounter += 1;
        return new Graphic({
          geometry: {
            type: "polyline",
            paths: r.routeCoords,
            spatialReference: { wkid: 4326 },
          },
          attributes: {
            candidateSite: r.candidateAttributes?.name,
            routedSite: r.locationId,
            routedSiteName: sourceFeatures.find(feature => String(feature.attributes.objectid) === String(r.locationId))?.attributes[nameField],
            travel_direction: r.candidateId ? "From Candidate" : "To Candidate",
            duration: Number(numFormatter(r.durationMin, 2, 2)),
            laborCost: Number(numFormatter(r.laborCost, 2, 2)),
            distance: Number(numFormatter(r.distanceMiles, 2, 2)),
            fuelCost: Number(numFormatter(r.fuelCost, 2, 2)),
            objectid: oidCounter,
          },
        });
      });
      return routeGraphics;
    }
  }
}

async function getTravelTimeAreas(
  areaType,
  features,
  travelMode,
  travelDuration,
  radius,
  h3Resolution,
  resultLayer,
) {
  await initializeModules();
  console.log(
    "areaType", areaType,
    "features", features,
    "travelMode", travelMode,
    "travelDuration", travelDuration,
    "radius", radius,
    "h3Resolution", h3Resolution,
    "resultLayer", resultLayer
)

const sourceLayer = features?.[0]?.layer;
const sourceOidField = sourceLayer?.objectIdField;

  const sourceFields = sourceLayer?.fields ?? [];

  const inFields = [
    {
      name: "OBJECTID",
      alias: "OBJECTID",
      type: "oid",
    },
    {
      name: "sourceFeature",
      alias: "Source Feature",
      type: "double",
    },
    {
      name: "radius",
      alias: "Radius",
      type: "double",
    },
    {
      name: "travelTime",
      alias: "Travel Time",
      type: "double",
    },
  ];
  // const oidField = inFields.find((field) => field.type === "oid").name;
  const oidField = features?.[0]?.layer?.objectIdField;
  const graphicFeatures = await generateGraphics(
    areaType, //1
    features, //2
    oidField, //3
    travelMode, //4
    travelDuration, //5
    radius, //6
    h3Resolution, //7
    resultLayer, //8
  );
  // Create a feature layer to hold the trade
  console.log("graphicFeatures", graphicFeatures);
  let symbol
  if (travelDuration.length > 1) {
    symbol = generateTradeAreaSymbol(travelDuration)
  } else {
    symbol = tradeAreaSymbol
  }
  const tradeAreasLayer = await new FeatureLayer({
    title: `Trade Areas (${areaType})`,
    source: await graphicFeatures.flat(),
    objectIdField: "OBJECTID",
    popupEnabled: true,
    popupTemplate: {
      title: "{name}",
      content: `Trade area for ${oidField}`,
    },
    fields: inFields,
    renderer: symbol,
    spatialReference: { wkid: 4326 },
  });
  if (resultLayer && resultLayer.title.includes(areaType)) {
    resultLayer.applyEdits({ updateFeatures: graphicFeatures });
  }

  return await tradeAreasLayer;
}

async function getRoutes(
  sourceSites = undefined,
  candidateSites = undefined,
  destinationSites = undefined,
  routeTimeOfDays = undefined,
  routeCosts = undefined,
  nameField = undefined,
) {
  await initializeModules();
  const routeGraphics = await generateGraphics(
    "route", //1
    candidateSites, //2
    undefined, //3
    undefined, //4
    undefined, //5
    undefined, //6
    undefined, //7
    sourceSites, //8
    destinationSites, //9
    routeTimeOfDays, //10
    routeCosts, //11
    nameField //12
  );

  console.log("RouteGraphics", routeGraphics)
  const crossingGraphics = await findCrossings(routeGraphics)
  console.log("crossingGraphics",crossingGraphics)
  const routeFields = Object.keys(crossingGraphics?.[0]?.attributes).map(
    (attributeName) => {
      if (attributeName === "routedSiteName") {
        return {
          name: attributeName,
          alias: attributeName.replaceAll("_", " "),
          type: "string",
        };
      }
      const jsType = typeof crossingGraphics?.[0]?.attributes[attributeName];
      const esriType = jsType === "number" ? "double" : jsType;
      return {
        name: attributeName,
        alias: attributeName.replaceAll("_", " "),
        type: esriType,
      };
    },
  );


  const travelRoutes = await new FeatureLayer({
    title: "Travel Routes",
    source: crossingGraphics,
    objectIdField: "objectid",
    spatialReference: { wkid: 4326 },
    fields: routeFields,
    popupEnabled: true,
    popupTemplate: {
      title: "{travel_direction}",
      content: `Trade area for {objectid}`,
    },
    renderer: routesSymbols,
  });
  const rankedSiteRouting = await rankRoutes(routeGraphics, candidateSites);
  console.log(
    "rankedSiteRouting",
    await rankedSiteRouting.map((site) => site.attributes),
  );
  console.log("ranking fields", rankingFields);
  // const rankedRoutes = await new FeatureLayer({
  //   title: "Site Routes Ranked",
  //   source: rankedSiteRouting,
  //   fields: rankingFields,
  //   objectIdField: "objectid",
  //   spatialReference: { wkid: 4326 },
  // });

  return await [travelRoutes, rankedSiteRouting];
  //  rankedRoutes];
}

async function rankRoutes(routeGraphics, candidateSites) {
  const oidField = candidateSites[0]?.layer?.objectIdField;
  const fieldsToRank = {
    averageTravelDistance: "travelDistanceRank",
    averageTravelDuration: "travelDurationRank",
    averageLaborCost: "laborCostRank",
    averageFuelCost: "fuelCostRank",
  };

  // CALCULATE AGGREGATES BY SITE
  const rankedSites = candidateSites.map((candidateSite) => {
    console.log(`${candidateSite.attributes?.name}`, candidateSite);
    const candidateSiteOid = candidateSite.attributes[oidField];
    const candidateSiteName = candidateSite.attributes?.name
    // SUBSET OF SITE ROUTES
    const siteRoutes = routeGraphics.filter(
      (route) =>
        route.attributes.candidateSite === candidateSite.attributes[oidField],
    );

    const totalSiteRoutes = siteRoutes.length;

    const averageTravelDistance =
      siteRoutes.reduce(
        (totalDistance, route) => totalDistance + route.attributes.distance,
        0,
      ) / totalSiteRoutes;

    const averageTravelDuration =
      siteRoutes.reduce(
        (totalDuration, route) => totalDuration + route.attributes.duration,
        0,
      ) / totalSiteRoutes;

    const averageLaborCost =
      siteRoutes.reduce(
        (totalCost, route) => totalCost + route.attributes.laborCost,
        0,
      ) / totalSiteRoutes;

    const averageFuelCost =
      siteRoutes.reduce(
        (totalCost, route) => totalCost + route.attributes.fuelCost,
        0,
      ) / totalSiteRoutes;

    const routeGraphic = new Graphic({
      // geometry: {
      //   type: "polyline",
      //   paths: siteRoutes.map((route) => route.geometry.paths).flat(1),
      //   spatialReference: { wkid: 4326 },
      // },
      attributes: {
        objectid: candidateSiteOid,
        candidateSiteName: candidateSiteName,
        averageTravelDistance: Number(numFormatter(averageTravelDistance, 0, 2)),
        averageTravelDuration: Number(numFormatter(averageTravelDuration, 0, 2)),
        averageLaborCost: Number(numFormatter(averageLaborCost, 0, 2)),
        averageFuelCost: Number(numFormatter(averageFuelCost, 0,2)),
        travelDistanceRank: null,
        travelDurationRank: null,
        laborCostRank: null,
        fuelCostRank: null,
        averageRank: null,
      },
    });
    console.log(
      "routeGraphic " + `${candidateSite?.attributes?.[oidField]}`,
      routeGraphic,
    );
    return routeGraphic;
  });

  // CALCULATE EACH AGGRAGATED METRIC'S RANK BETWEEN SITES
  Object.entries(fieldsToRank).forEach(([avgFieldName, rankFieldName]) => {
    rankedSites
      .sort((a, b) => a.attributes[avgFieldName] - b.attributes[avgFieldName])
      .forEach((route, i) => (route.attributes[rankFieldName] = i + 1));
  });

  // CALCULATE THE AVERAGE RANK OF EACH SITE
  rankedSites.forEach((site) => {
    const arrayOfRanks = Object.values(fieldsToRank).map(
      (rankFieldName) => site.attributes[rankFieldName],
    );
    const avgRankItem =
      arrayOfRanks.reduce(
        (totalRank, currentRank) => totalRank + currentRank,
        0,
      ) / arrayOfRanks.length;
    site.attributes.averageRank = Number(intFormatter.format(avgRankItem));
  });
  // CALCULATE THE AVERAGE RANK OF EACH SITE
  rankedSites.forEach((site) => {
    const arrayOfRanks = Object.values(fieldsToRank).map(
      (rankFieldName) => site.attributes[rankFieldName]
    );
    const avgRankItem =
      arrayOfRanks.reduce(
        (totalRank, currentRank) => totalRank + currentRank,
        0
      ) / arrayOfRanks.length;
    site.attributes.averageRank = Number(intFormatter.format(avgRankItem))
  });

  return rankedSites;
}

async function findCrossings(graphics) {
  const ALBERS_EQ_AREA = new SpatialReference({ wkid: 102003 });
  async function projectToEqualArea(geometry) {
    await projection.load();
    return projection.project(geometry, ALBERS_EQ_AREA);
  }
  const crossingLayer = new FeatureLayer ({
    portalItem: {
      id: "eb522a2029b44dcc977793546cebf1a2"
    }, 
    spatialReference: { wkid:4326 }
  })
  let unionGeom
  for (const graphic of graphics) {
    // console.log(`Calculating Geometry for ${graphic.attributes.objectid}`)
    const projGeom = await projectToEqualArea(graphic.geometry)
    // console.log(projGeom)
    const bufferGeom = bufferOperator.execute(projGeom, 100, {unit:"feet"})
    const featureQuery = crossingLayer.createQuery();
    featureQuery.geometry = bufferGeom
    featureQuery.where = "POSXING='At Grade'"
    featureQuery.outFields = ["*"]
    featureQuery.returnGeometry = false
    const crossingSites = await crossingLayer.queryFeatures(featureQuery).then((results) => {
      if (results) {
        // console.log(results.features)
        const crossingFeatures = results.features
        graphic.attributes.railCrossings = crossingFeatures?.length || 0
      }
    })
    unionGeom = unionGeom
        ? unionOperator.execute(unionGeom, bufferGeom)
        : bufferGeom;
    
  }
  graphics.forEach((graphic) => {
    // console.log("CrossingGraphic", graphic.attributes)
  })
  console.log("union Geom", unionGeom)
  return graphics
}

export { getTravelTimeAreas, getRoutes };
