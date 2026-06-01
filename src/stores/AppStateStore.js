import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import indexedDBStorage from "./indexedStorage.js";
// Intentionally avoid static import of the authorization store here to prevent
// a circular dependency during module initialization. We'll dynamically import
// it where needed (e.g., in setPortal or after auth) to access credentials.
import useUIStore from "./UIStore.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";

const nonPersistedKeys = [
  "map",
  "compMap",
  "mapInteraction",
  "mapAvailable",
  "portal",
  "portalItems",
  "searchString",
  "compareFeatures",
  "layer", 
  "baselineFeatures",
  "baselineLayer",
  "tradeAreaLayer",
  "routeLayer",
  "employeeCountField",
  "fieldMappingDialogVisible",
  "fieldMappingRole",
  "fieldMappingResolver",
  "fieldMappingData",
];

const featureLayerStateKeys = [
  "officeLayer",
  "imageLayer",
  "SubmarketLayer",
  "reportTable",
];

function handleLayerSwapping(role, key, state, layer) {
  try {
    const currentLayer = state[key];
    const map = state.map?.map;

    if (currentLayer?.title === layer?.title) {
      // Still return the layer to ensure state update triggers
      return { [key]: layer };
    }

    // Find and remove the old layer from the map
    if (currentLayer) {
      const layerToRemove = map?.layers?.items?.find(
        (mapLayer) => mapLayer.title === currentLayer.title,
      );
      if (layerToRemove) {
        map.remove(layerToRemove);
      }
    }
    // If a new layer is provided, it will be added by the calling context.
    // This function now only handles removal and state update preparation.
    return { [key]: layer };
  } catch (err) {
    throw new Error(`Failure during ${role}s layer handling: `, err);
  }
}

const initialState = {
  hasHydrated: false, // tracks if persist middleware has rehydrated
  map: null,
  mapInteraction: null,
  mapAvailable: false,
  baselineFeatures: null,
  baselineLayer: null,
  compareFeatures: null,
  layer: null,
  tradeAreaLayer: null,
  routeLayer: null,
  portal: null,
  portalItems: null,
  searchString: "",
  setupComplete: false,
  employeeCountField: null, // field for employee count
  fieldMappingDialogVisible: false, // To control visibility of field mapping dialog
  fieldMappingRole: null, // Which role (Site/Employee/etc) is currently doing field mapping
  fieldMappingResolver: null, // Function to resolve when field mapping is complete
  fieldMappingData: null, // Data passed to the field mapping dialog
};

const useAppStateStore = create(
  // devtools(
  persist(
    (set, get) => ({
      ...initialState,
      setMap: (map) => {
        set({ map: map });
      },
      setMapAvailable: (available) => set({ mapAvailable: available }),
      setMapInteraction: (interaction) => set({ mapInteraction: interaction }),
      setLayer: (layer) => {set({ layer: layer });},
      setRouteLayer: (routeLayer) => {set({ routeLayer: routeLayer });},
      setTradeAreaLayer: (TradeAreaLayer) => {set({ TradeAreaLayer: TradeAreaLayer });},
      setCompareFeatures: (coordsList) => set({compareFeatures: coordsList}),
      setBaselineFeatures: (baseline) => set({baselineFeatures: baseline}),
      setBaselineLayer: (baseLayer) => set({baselineLayer: baseLayer}),
      setEmployeeCountField: (field) => set({ employeeCountField: field }),
      setFieldMappingDialogVisible: (visible, role = null) => {
        console.log(
          "Setting field mapping dialog visibility to: ",
          visible,
          "for role:",
          role,
        );
        set({ fieldMappingDialogVisible: visible, fieldMappingRole: role });
      },
      setFieldMappingResolver: (resolver) => {
        set({ fieldMappingResolver: resolver });
      },
      getFieldMappingResolver: () => {
        return get().fieldMappingResolver;
      },
      setFieldMappingData: (data) => {
        set({ fieldMappingData: data });
      },
      getFieldMappingData: () => {
        return get().fieldMappingData;
      },
      cleanupFieldMapping: () => {
        set({
          fieldMappingDialogVisible: false,
          fieldMappingRole: null,
          fieldMappingResolver: null,
          fieldMappingData: null,
        });
      },
      setSearchString: (str) => set({ searchString: str }),
      setPortalItems: (items) => set({ portalItems: items }),
      setPortal: async () => {
        try {
          const { default: useAuthorizationStore } =
            await import("./UserAuthorizationStore.js");
          const { credential } = useAuthorizationStore.getState();
          if (!credential?.server) return;
          const Portal = (await import("@arcgis/core/portal/Portal.js"))
            .default;
          const portalConnection = new Portal(credential.server);
          portalConnection.authMode = "immediate";
          await portalConnection.load();
          set({ portal: portalConnection });
          // const SubmarketMap = new FeatureLayer({
          //   portalItem: {
          //     id: "0a17cf4b0ed14fa3a98daf04bada8b3d",
          //   },
          //   outFields:["*"]
          // })
          // set({ layer: SubmarketMap });
        } catch (e) {
          console.error("Failed to set portal after dynamic auth import", e);
        }
      },
      setSearchString: async (str, signal) => {
        //THIS MAY NOT WORK
        const { setPortalItems } = get();
        setPortalItems(str, signal);
        set({ searchString: str });
      },
      setPortalItems: async (searchString, signal) => {
        // THE CALLING FUNCTION NEEDS TO PASS IN AN ABORT CONTROLLER SIGNAL
        // THIS SHOULD BE CALLED BY SET SEARCH STRING ACTION
        //wHICH SHOULD RECEIVE THE SIGNAL FROM USE EFFECT CALLED IN THE COMPONENT
        const { portal } = get();
        if (portal === null) {
          const { setPortal } = get();
          await setPortal();
          return;
        }

        if (!portal) return;
        const query = `title:${
          searchString || ""
        }* AND type: ('Feature Layer' OR 'Map Service' OR 'Scene Layer' OR 'Tile Layer' OR 'WMS' OR 'WMTS')`;
        try {
          const response = await portal.queryItems(
            {
              query: query,
              num: 100,
            },
            { signal: signal },
          );
          const data = response?.results;
          console.log("data", data);
          if (data?.length < 1) {
            // console.warn("No content found for: ", searchString);
          }
          set({ portalItems: data });
        } catch (err) {
          if (err.name === "AbortError") {
            return;
          }
          throw new Error(
            `Something happend while querying Atlas items: ${err}`,
          );
        }
      },
      setSetupComplete: () => set({ setupComplete: true }),
      setError: (error) => {
        set({ error });
      },
      reset: () => {
        const state = get();
        const { map, scene } = state;

        const removeLayerFromMap = (mapInstance, layer) => {
          if (!mapInstance?.map || !layer) return;
          try {
            const layerToRemove = mapInstance.map.layers.find(
              (l) => l.id === layer.id || l.title === layer.title,
            );
            if (layerToRemove) {
              mapInstance.map.remove(layerToRemove);
            }
          } catch (err) {
            console.warn("Error removing layer:", err);
          }
        };

        const clearAllLayers = () => {
          try {
            // Remove layers based on string matching in titles from map
            if (map?.map?.layers) {
              const operationalLayersMap = map.map.layers.filter(
                (l) =>
                  l.title?.includes("Colliers Submarkets") ||
                  l.title?.includes("Current_Quarter_Industrial_Submarket_Data") ||
                  l.title?.includes("Current_Quarter_Submarket_Data") ||
                  l.title?.includes("Offices")
              );
              // Convert Collection to array before passing to removeMany
              const layersArray = operationalLayersMap.toArray
                ? operationalLayersMap.toArray()
                : Array.from(operationalLayersMap);
              if (layersArray.length > 0) {
                map.map.removeMany(layersArray);
              }
            }           // Remove layers stored in state variables
            featureLayerStateKeys.forEach((key) => {
              const layerOrLayers = state[key];
              if (Array.isArray(layerOrLayers)) {
                layerOrLayers.forEach((layer) => {
                  removeLayerFromMap(map, layer);
                  removeLayerFromMap(scene, layer);
                });
              } else if (layerOrLayers) {
                removeLayerFromMap(map, layerOrLayers);
                removeLayerFromMap(scene, layerOrLayers);
              }
            });
          } catch (err) {
            console.error("Error clearing layers:", err);
          }
        };

        clearAllLayers();

        // Reset UI store
        try {
          const resetUI = useUIStore.getState().reset;
          if (typeof resetUI === "function") {
            resetUI();
          }
        } catch (err) {
          console.warn("Error resetting UI store:", err);
        }

        // Reset state while preserving map/scene/portal references
        set({
          ...initialState,
          map: state.map,
          portal: state.portal,
          mapAvailable: state.mapAvailable,
          mapToUse: state.mapToUse,
          hasHydrated: true,
        });
      },
      loadPersistedLayersIfNeeded: async () => {
        const s = get();
        if (s.hasHydrated) return;
        const layerLoadPromises = [];
        featureLayerStateKeys.forEach((key) => {
          const layer = s[key];
          if (layer && typeof layer.load === "function") {
            layerLoadPromises.push(
              layer.load().catch((err) => {
                console.warn(`Failed to load layer '${key}'`, err);
                return layer;
              }),
            );
          }
        });
      },
    }),
    {
      name: "AppStateStore",
      partialize: (state) => {
        // Persist only keys not listed in nonPersistedKeys
        const filtered = Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !nonPersistedKeys.includes(key),
          ),
        );

        // Pre-process featureLayer keys to extract serializable data
        // This prevents JSON.stringify from calling the layer's toJSON() method
        featureLayerStateKeys.forEach((key) => {
          const layer = filtered[key];
          if (layer && typeof layer === "object") {
            if (layer.url) {
              // URL-based layer
              filtered[key] = { itemUrl: layer.url };
            } else if (layer.source?.items) {
              // Client-side layer with source items
              const featureGraphics = layer.source.items;
              filtered[key] = {
                items: featureGraphics.map((graphic) => graphic.toJSON()),
                sourceJSON: {
                  title: layer.title,
                  objectIdField: layer.objectIdField,
                  geometryType: layer.geometryType,
                  fields: layer.fields?.map((field) => ({
                    name: field.name,
                    alias: field.alias,
                    type: field.type,
                    visible: field.visible,
                  })),
                },
              };
            }
          }
        });

        return filtered;
      },
      onRehydrateStorage: () => {
        // Raw hydration completes; layers exist but may not be loaded yet.
        // Authorization logic will call loadPersistedLayersIfNeeded().
        return (state, error) => {
          if (error) {
            console.error("Report State Store hydration error", error);
            return;
          }
        };
      },
      // Ensure actions remain intact by merging persisted slice onto the current state
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState || {}),
        };
      },
      storage: createJSONStorage(() => indexedDBStorage, {
        replacer: (key, value) => {
          if (key.includes("set")) return;
          if (value === null) return null;
          return value;
        },
        reviver: (key, value) => {
          if (value === null) return null;

          if (featureLayerStateKeys.includes(key)) {
            if (value?.itemUrl) {
              const layer = new FeatureLayer({
                url: value.itemUrl,
              });
              return layer;
            }

            if (value?.items && value?.sourceJSON) {
              const graphics = value.items.map((graphicJson) => {
                return Graphic.fromJSON(graphicJson);
              });
              const layer = new FeatureLayer({
                ...value.sourceJSON,
                source: graphics,
              });
              return layer;
            }
          }

          return value;
        },
      }),
    },
  ),
);

export default useAppStateStore;
