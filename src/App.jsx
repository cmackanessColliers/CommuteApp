import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CalciteLoader } from "@esri/calcite-components-react";
import useAppStateStore from "./stores/AppStateStore";
import useAuthorizationStore from "./stores/UserAuthorizationStore";
const SiteSelectionApp = lazy(() => import("./pages/SiteSelectionApp"));
const Configure = lazy(() => import("./pages/site-selection/Configure"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));

function App() {
  return (
    <BrowserRouter basename="/portal/apps/CommuteApp/">
      <Suspense fallback={<CalciteLoader />}>
        <Routes>
          {/* <Route index element={<Homepage />} /> */}
          <Route
            // path="site-selection"
            element={
              <ProtectedRoute>
                <SiteSelectionApp />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate replace to="configure" />} />
            <Route
              path="configure"
              element={
                <Suspense fallback={<CalciteLoader />}>
                  <Configure />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
