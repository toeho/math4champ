import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import History from "./pages/History";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}
