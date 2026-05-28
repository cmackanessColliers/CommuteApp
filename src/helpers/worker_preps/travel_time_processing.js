import * as h3 from "h3-js";

// Pure helpers that transform TravelTime API responses into serializable
// geometry + attribute objects. These functions avoid ArcGIS API classes
// so they can be moved into a Web Worker later.

export function processIsochroneResults(
  data,
  features,
  oidField,
  travelDuration
) {
  // data.features is GeoJSON features
  return data.features.map((feature) => {
    const searchId = Number(feature.properties.search_id);
    const sourceFeature = features.find(
      (f) => f.attributes[oidField] === searchId
    );
    const rings = feature.geometry.coordinates.reverse().flat();
    const attributes = {
      ...sourceFeature.attributes,
      traveltime: travelDuration / 60,
    };
    return { rings, attributes };
  });
}

export function processH3Results(results, features, oidField) {
  // results.results is array where each item has search_id and cells
  // We return an array of cell arrays; each cell is { rings, attributes }
  return results.results.map((feature) => {
    const searchId = Number(feature.search_id);
    const sourceFeature = features.find(
      (f) => f.attributes[oidField] === searchId
    );
    const cells = feature.cells.map((cell, i) => {
      const cellGeometry = h3.cellToBoundary(cell.id, true);
      const attributes = {
        ...sourceFeature.attributes,
        timetocell: cell.properties.mean,
        uid: Number(`${sourceFeature.uid}${i}`),
        [oidField]: Number(`${sourceFeature.uid}${i}`),
      };
      return { rings: cellGeometry, attributes };
    });
    return cells;
  });
}

export function processRouteResults(
  routeData,
  features,
  candidateOidField,
  routeCosts
) {
  // routeData is an array of route results
  // We return an array of route descriptors: { candidateId, locationId, routeCoords, candidateAttributes }
  const out = [];
  routeData.forEach((route) => {
    // Determine candidate id
    const candidateMatch = route.search_id.match(/(?<=Candidate\s)\d+/);
    const candidateId = candidateMatch ? Number(candidateMatch[0]) : null;
    const candidateFeature = features.find(
      (f) => f.attributes[candidateOidField] === candidateId
    );
    route.locations.forEach((location) => {
      const locationId = Number((location.id || "").split(" ")[1]);
      // route.parts contains coords per part
      const routeCoords = location.properties[0].route.parts
        .map((part) => part.coords.map((point) => [point.lng, point.lat]))
        .flat();
      const durationMin = (location.properties[0].travel_time || 0) / 60;
      const distanceMiles =
        (location.properties[0].distance || 0) * 0.000621371;
      const laborCost = routeCosts
        ? (durationMin / 60) * (routeCosts.wagePerHour || 0)
        : null;
      const fuelCost = routeCosts
        ? (distanceMiles / (routeCosts.mpg || 6.5)) *
          (routeCosts.fuelPerGal || 0)
        : null;
      out.push({
        candidateId,
        locationId,
        routeCoords,
        candidateAttributes: candidateFeature?.attributes,
        durationMin,
        distanceMiles,
        laborCost,
        fuelCost,
      });
    });
  });
  return out;
}
