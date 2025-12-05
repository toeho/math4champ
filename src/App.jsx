import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import History from "./pages/History";
import Profile from "./pages/Profile";
import { measureWebVitals } from "./utils/performance";
import { ParentProvider, useParent } from "./contexts/ParentContext";

// Lazy load parent components for code splitting
const ParentLogin = lazy(() => import("./pages/parent/ParentLogin"));
const ParentRegister = lazy(() => import("./pages/parent/ParentRegister"));
const ParentDashboard = lazy(() => import("./pages/parent/ParentDashboard"));
const ParentVoiceAssistant = lazy(() => import("./pages/parent/ParentVoiceAssistant"));
const ParentProfile = lazy(() => import("./pages/parent/ParentProfile"));
const ParentLayout = lazy(() => import("./layouts/ParentLayout"));

// Loading component for lazy-loaded routes
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-b from-purple-600 to-indigo-700">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );
}

// Protected route component for parent pages
function ProtectedParentRoute({ children }) {
  const { parent, loading } = useParent();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!parent) {
    return <Navigate to="/parent/login" replace />;
  }
  
  return children;
}

export default function App() {
  useEffect(() => {
    // Measure Core Web Vitals in development
    if (import.meta.env.DEV) {
      measureWebVitals();
    }
  }, []);

  return (
    <Router>
      <div className="animate-page-fade-in">
        <Routes>
          {/* Student Routes (Existing) */}
          <Route
            path="/"
            element={
                 <Home />
            }
          />
          <Route
            path="/history"
            element={
              <MainLayout>
                {(props) => <History {...props} />}
              </MainLayout>
            }
          />
          <Route
            path="/math"
            element={
              <MainLayout>
                {(props) => <Explore {...props} />}
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout>
                {(props) => <Profile {...props} />}
              </MainLayout>
            }
          />

          {/* Parent Routes (New) - Wrapped with ParentProvider and Suspense */}
          <Route
            path="/parent/login"
            element={
              <ParentProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <ParentLogin />
                </Suspense>
              </ParentProvider>
            }
          />
          <Route
            path="/parent/register"
            element={
              <ParentProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <ParentRegister />
                </Suspense>
              </ParentProvider>
            }
          />
          <Route
            path="/parent/dashboard"
            element={
              <ParentProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedParentRoute>
                    <ParentLayout>
                      <ParentDashboard />
                    </ParentLayout>
                  </ProtectedParentRoute>
                </Suspense>
              </ParentProvider>
            }
          />
          <Route
            path="/parent/voice"
            element={
              <ParentProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedParentRoute>
                    <ParentLayout>
                      <ParentVoiceAssistant />
                    </ParentLayout>
                  </ProtectedParentRoute>
                </Suspense>
              </ParentProvider>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ParentProvider>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedParentRoute>
                    <ParentLayout>
                      <ParentProfile />
                    </ParentLayout>
                  </ProtectedParentRoute>
                </Suspense>
              </ParentProvider>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
