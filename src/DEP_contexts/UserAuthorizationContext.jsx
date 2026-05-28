import esriId from "@arcgis/core/identity/IdentityManager";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import { createContext, useCallback, useContext, useReducer } from "react";
import esriConfig from "@arcgis/core/config.js";
import PropTypes from "prop-types";

// Configure portal and app URLs based on environment
const LOCAL_PORT = 5174;
const LOCAL_BASE_PATH = "/portal/apps/AppStateStore";
const isLocalDev = window.location.hostname === "localhost";

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

const initialState = {
  credential: null,
  isAuthorized: false,
};
function reducer(state, action) {
  switch (action.type) {
    case "authorize-user":
      return { ...state, credential: action.payload, isAuthorized: true };
    default:
      throw new Error("Action type not recognized");
  }
}
const UserAuthorizationContext = createContext();

function UserAuthorizationProvider({ children }) {
  const [{ credential, isAuthorized }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const atlasLogin = useCallback(
    async function atlasLogin() {
      if (credential !== null) return;
      // Construct the redirect URI based on environment
      // const redirectUri = isLocalDev
      //   ? `https://localhost:${LOCAL_PORT}${LOCAL_BASE_PATH}/oauth-callback.html`
      //   : `${window.location.origin}${LOCAL_BASE_PATH}/oauth-callback.html`;

      const info = new OAuthInfo({
        appId: import.meta.env.VITE_ARCGIS_OAUTH_APP_ID,
        // POPUP REDIRECT WILL NOT WORK UNTIL URL REDIRECT HAPPENS PROPERLY
        // Use popup: true for better OAuth flow
        // popup: true,
        // popupCallbackUrl: redirectUri,
        portalUrl: "https://atlas.colliers.com/portal",
        preserveUrlHash: true,
      });
      esriId.registerOAuthInfos([info]);
      esriId.checkSignInStatus(info.portalUrl + "/sharing").then(
        function (credential) {
          // User is signed in, proceed to load content
          dispatch({ type: "authorize-user", payload: credential });
        },
        function () {
          // User is not signed in, prompt for sign-in
          esriId
            .getCredential(info.portalUrl + "/sharing")
            .then((credential) => {
              console.log(credential);
              dispatch({ type: "authorize-user", payload: credential });
            });
        }
      );
    },
    [credential]
  );

  return (
    <UserAuthorizationContext.Provider
      value={{ credential, isAuthorized, atlasLogin }}
    >
      {children}
    </UserAuthorizationContext.Provider>
  );
}

function useUserAuthorization() {
  const context = useContext(UserAuthorizationContext);
  if (context === undefined)
    throw new Error(
      "UserAuthorizationContext used outside of UserAuthorizationProvider"
    );
  return context;
}

UserAuthorizationProvider.propTypes = {
  children: PropTypes.element,
};

export { UserAuthorizationProvider, useUserAuthorization };
