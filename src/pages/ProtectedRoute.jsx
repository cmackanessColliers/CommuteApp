import { useEffect } from "react";
import PropTypes from "prop-types";

import { useUserAuthorization } from "../contexts/UserAuthorizationContext";

function ProtectedRoute({ children }) {
  const { isAuthorized, atlasLogin } = useUserAuthorization();

  useEffect(() => {
    async function runLogin() {
      return await atlasLogin();
    }
    runLogin();
  }, [atlasLogin]);

  return isAuthorized ? children : null;
}

ProtectedRoute.propTypes = {
  children: PropTypes.element,
};

export default ProtectedRoute;
