import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/common/Layout";
import ScrollToTop from "@/components/common/ScrollToTop";
import Home from "@/features/home/Home";
import About from "@/features/about/About";
import Gallery from "@/features/gallery/Gallery";
import Registration from "@/features/auth/Registration";
import Members from "@/features/members/Members";
import Success from "@/features/payment/Success";
import Cancel from "@/features/payment/Cancel";
import News from "@/features/news/news";
import Contact from "@/features/contact/contact";
import Payment from "@/features/payment/Payment";
import Login from "@/features/auth/Login";
import AdminDashboard from "@/features/admin/AdminDashboard";
import UserDashboard from "@/features/dashboard/UserDashboard";
import IdCard from "@/features/members/IdCard";
import Verify from "@/features/members/Verify";

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
      <ScrollToTop />
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
