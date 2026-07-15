import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Registration from "./pages/Registration";
import Members from "./pages/Members";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import News from "./pages/news";
import Contact from "./pages/contact";
import Payment from "./pages/Payment";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import IdCard from "./pages/IdCard";
import Verify from "./pages/Verify";

// Client-side Standard Protected Route for logged-in members
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("vpm_token");
  const user = localStorage.getItem("vpm_user");
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Client-side Admin Protected Route for administrators
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("vpm_token");
  const user = localStorage.getItem("vpm_user");
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  try {
    const parsed = JSON.parse(user);
    if (!parsed.isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/members" element={<Members />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:membershipId" element={<Verify />} />

        {/* Protected Member Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/id-card/:membershipId"
          element={
            <ProtectedRoute>
              <IdCard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
