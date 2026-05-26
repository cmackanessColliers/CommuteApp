import { create } from "zustand";
// import { devtools } from "zustand/middleware";
import useAppStateStore from "./AppStateStore";

const PERSISTENCE_KEY = "arcgis-auth-store";

const useAuthorizationStore = create((set, get) => ({
  credential: null,
  isAuthorized: false,
  _esriId: null,
  _info: null,
  _initPromise: null,

  // --- Internal Initialization ---
  _initialize: () => {
    if (get()._initPromise) {
      return get()._initPromise;
    }

    const initPromise = (async () => {
      const esriId = (await import("@arcgis/core/identity/IdentityManager"))
        .default;
      const OAuthInfo = (await import("@arcgis/core/identity/OAuthInfo"))
        .default;
      const esriConfig = (await import("@arcgis/core/config.js")).default;
      // Configure portal and app URLs based on environment
      const LOCAL_PORT = 5174;
      const LOCAL_BASE_PATH = "/portal/apps/CommuteApp";
      const isLocalDev = window.location.hostname === "localhost";
      const PERSISTENCE_KEY = "arcgis-auth-store";

      // Configure ESRI authentication settings
      esriConfig.portalUrl = "https://atlas.colliers.com/portal";
      esriConfig.request.trustedServers = ["https://atlas.colliers.com"];
      esriConfig.request.corsEnabledServers = ["https://atlas.colliers.com"];
      esriConfig.request.interceptors = [
        {
          urls: /^https?:\/\/atlas\.colliers\.com/,
          before: function (params) {
            params.requestOptions.withCredentials = true;
          },
        },
      ];

      // Use HTTPS for local development to match Portal security requirements
      esriConfig.applicationName = isLocalDev
        ? `https://localhost:${LOCAL_PORT}${LOCAL_BASE_PATH}`
        : window.location.origin;

      const info = new OAuthInfo({
        appId: import.meta.env.VITE_ARCGIS_OAUTH_APP_ID,
        portalUrl: "https://atlas.colliers.com/portal",
        preserveUrlHash: true,
        popup: false,
      });
      esriId.registerOAuthInfos([info]);

      try {
        const savedState = JSON.parse(localStorage.getItem(PERSISTENCE_KEY));
        if (savedState) {
          esriId.initialize(savedState);
          // console.log("Successfully rehydrated ArcGIS Identity Manager.");
        }
      } catch (e) {
        console.error("Could not rehydrate ArcGIS Identity Manager:", e);
      }

      set({ _esriId: esriId, _info: info });
    })();

    set({ _initPromise: initPromise });
    return initPromise;
  },

  // --- Actions ---
  authorizeUser: async () => {
    await get()._initialize();
    const { _esriId, _info } = get();

    const _handleSignInSuccess = (cred) => {
      set({ credential: cred, isAuthorized: true });
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(_esriId.toJSON()));
    };

    try {
      // console.log("Checking sign-in status...");
      const cred = await _esriId.checkSignInStatus(
        _info.portalUrl + "/sharing",
      );
      // console.log("User is already signed in.");
      _handleSignInSuccess(cred);
      useAppStateStore.getState().setPortal();
      useAppStateStore.getState().loadPersistedLayersIfNeeded();
    } catch {
      // console.log("User not signed in, prompting for login.");
      try {
        const cred = await _esriId.getCredential(_info.portalUrl + "/sharing");
        //console.log("User signed in successfully.");
        _handleSignInSuccess(cred);
      } catch (error) {
        console.error("Sign-in failed:", error);
      }
    }
  },

  signOutUser: async () => {
    await get()._initialize();
    const { _esriId } = get();

    // console.log("Signing out and destroying credentials.");
    _esriId.destroyCredentials();
    localStorage.removeItem(PERSISTENCE_KEY);
    set({ credential: null, isAuthorized: false });
    window.location.reload();
  },
}));

export default useAuthorizationStore;
