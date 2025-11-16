import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import History from "./pages/History";
import Profile from "./pages/Profile";
import { measureWebVitals } from "./utils/performance";

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
        </Routes>
      </div>
    </Router>
  );
}
