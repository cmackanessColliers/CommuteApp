import { useEffect } from "react";
import PropTypes from "prop-types";

import useAuthorizationStore from "../stores/UserAuthorizationStore";

function ProtectedRoute({ children }) {
  const { isAuthorized, authorizeUser } = useAuthorizationStore();

  useEffect(() => {
    async function runLogin() {
      return await authorizeUser();
    }
    runLogin();
  }, [authorizeUser]);

  return isAuthorized ? children : null;
}

ProtectedRoute.propTypes = {
  children: PropTypes.element,
};

export default ProtectedRoute;
