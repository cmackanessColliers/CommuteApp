import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import PropTypes from "prop-types";
import Portal from "@arcgis/core/portal/Portal.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Query from "@arcgis/core/rest/support/Query.js";
import { useUserAuthorization } from "./UserAuthorizationContext";
async function getFeaturesFromLayers(layers) {
  const features = [];
  for (const layer of layers) {
    if (layer.type === "feature" || layer.type === "csv") {
      const results = await layer.queryFeatures();
      features.push(...(await results.features));
    }
  }
  return await features;
}

const SiteSelectionContext = createContext();

function SiteSelectionProvider({ children }) {
  const { credential } = useUserAuthorization();

  const initialState = {
    map: null,
    mapAvailable: false,
    marketType: null,
    metroArea: null,
    market: null,
    marketId: null,
    submarkets: null,
    submarketHighlight: null,
    submarketIds: null,
    SubmarketLayer: null,
    portal: null,
  };

  function reducer(state, action) {

    switch (action.type) {
      case "SET_MAP":
        return { ...state, map: action.payload, appMap: action.payload };
      case "SET_MAP_AVAILABLE":
        return { ...state, mapAvailable: true };
      case "SET_MARKET_TYPE":
        return { ...state, marketType: action.payload };
      case "SET_METRO_AREA":
        return { ...state, metroArea: action.payload };
      case "SET_MARKET":
        return { ...state, market: action.payload };
      case "SET_MARKET_ID":
        return { ...state, marketId: action.payload };
      case "SET_SUBMARKETS":
        return { ...state, submarkets: action.payload};
      case "SET_SUBMARKET_HIGHLIGHT":
        return { ...state, submarketHighlight: action.payload};
      case "SET_SUBMARKET_IDS":
        return { ...state, submarketIds: action.payload};
      case "SET_SUBMARKET_LAYER":
        return { ...state, SubmarketLayer: action.payload };
      case "SET_PORTAL": // single feature
        return { ...state, portal: action.payload }; //Portal connection
      case "RESET": {
        return {
          ...state,
          marketType: null,
          metroArea: null,
          market: null,
          marketId: null,
          submarkets: null,
          submarketHighlight: null,
          submarketIds: null,
        };
      }
      default:
        throw new Error(`Unhandled action type: ${action.type}`);
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    map,
    mapAvailable,
    marketType,
    metroArea,
    market,
    marketId,
    submarkets,
    submarketHighlight,
    submarketIds,
    SubmarketLayer,
    portal,
  } = state;

  const dispatcherSiteSelection = useCallback(
    function dispatcherSiteSelection(action) {
      dispatch(action);
    },
    [dispatch]
  );

  function setMap(mapReference) {
    dispatch({ type: "SET_MAP", payload: mapReference });
  }

  useEffect(() => {
    if (credential?.server == undefined) return;
    const portalConnection = new Portal(credential.server);
    dispatch({ type: "SET_PORTAL", payload: portalConnection });
    const SubmarketMap = new FeatureLayer({
      portalItem: {
        id: "af533dc1aaa244e5a4362204a7581abc",
      },
    })
    dispatch({ type: "SET_SUBMARKET_LAYER", payload: SubmarketMap });
  }, [credential]);

  //HANDLES ACTIVELY SETTING PORTAL CONTENT TO COMBOBOXES WHILE TYPING
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchPortalItems() {
        if (!portal?.authMode) return;
        portal.authMode = "immediate";

        const query = `title:${
          searchString || ""
        }* AND type: ('Feature Layer' OR 'Map Service' OR 'Scene Layer' OR 'Tile Layer' OR 'WMS' OR 'WMTS')`;

        try {
          const response = await portal?.queryItems(
            {
              query,
              num: 100,
            },
            { signal: controller.signal }
          );

          const data = await response?.results;
          if (data?.length < 1)
            throw new Error("No content found matching query.");
        } catch (err) {
          throw new Error(
            `Something happend while querying Atlas items: ${err}`
          );
        }
      }

      fetchPortalItems();
      return function () {
        controller.abort();
      };
    },
    [dispatcherSiteSelection, portal]
  );

  return (
    <SiteSelectionContext.Provider
      value={{
        map,
        mapAvailable,
        marketType,
        metroArea,
        market,
        marketId,
        submarkets,
        submarketHighlight,
        submarketIds,
        SubmarketLayer,
        portal,
        setMap,
        dispatcherSiteSelection,
      }}
    >
      {children}
    </SiteSelectionContext.Provider>
  );
}

SiteSelectionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

function useSiteSelection() {
  const context = useContext(SiteSelectionContext);
  if (context === undefined)
    throw new Error(
      "SiteSelectionContext was used outside of SiteSelectionProvider"
    );
  return context;
}

export { SiteSelectionProvider, useSiteSelection };
