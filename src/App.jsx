import { Routes, Route } from "react-router-dom";

// Layout
import Layout from "./components/layout/Layout";

// Customer Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import MenuPage from "./pages/MenuPage";
import GalleryPage from "./pages/GalleryPage";
import ReservationPage from "./pages/ReservationPage";
import ContactPage from "./pages/ContactPage";

// Admin
import AdminPage from "./admin/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ProtectedRoute from "./admin/auth/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      {/* Customer Website */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />

      <Route
        path="/about"
        element={
          <Layout>
            <AboutPage />
          </Layout>
        }
      />

      <Route
        path="/menu"
        element={
          <Layout>
            <MenuPage />
          </Layout>
        }
      />

      <Route
        path="/gallery"
        element={
          <Layout>
            <GalleryPage />
          </Layout>
        }
      />

      <Route
        path="/reservation"
        element={
          <Layout>
            <ReservationPage />
          </Layout>
        }
      />

      <Route
        path="/contact"
        element={
          <Layout>
            <ContactPage />
          </Layout>
        }
      />


      {/* Admin Dashboard */}
      <Route
        path="/admin/login"
        element={<AdminLoginPage />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}