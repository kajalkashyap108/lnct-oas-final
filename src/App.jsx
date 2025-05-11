import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import TestsPage from "./components/TestsPage";
import AdminDashboard from "./components/AdminDashboard";
import TestPage from "./components/TestPage";
import ResultsPage from "./components/ResultsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css"; // Ensure CSS is imported

function AppContent() {
  const location = useLocation();
  const isExcludedRoute = location.pathname === "/" || location.pathname === "/login";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%", // Constrain width
        maxWidth: "100%", // Prevent overflow
        overflowX: "hidden", // Prevent horizontal scroll
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: "64px",
          ml: isExcludedRoute ? 0 : { xs: 0, sm: "250px" },
          width: isExcludedRoute ? "100%" : { xs: "100%", sm: "calc(100% - 250px)" }, // Adjust width for sidebar
          maxWidth: "100%", // Prevent overflow
          overflowX: "hidden", // Prevent horizontal scroll
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests"
            element={
              <ProtectedRoute role="user">
                <TestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:testId"
            element={
              <ProtectedRoute role="user">
                <TestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute role="user">
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Login />} />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;