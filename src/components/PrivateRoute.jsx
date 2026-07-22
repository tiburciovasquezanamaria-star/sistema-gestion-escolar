import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authApi";

/**
 * PrivateRoute — guards any route that requires authentication.
 * If the user has no valid JWT session, redirects to /login.
 */
function PrivateRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default PrivateRoute;
