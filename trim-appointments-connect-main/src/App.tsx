
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RegisterSalon from "./pages/RegisterSalon";
import SalonSearch from "./pages/SalonSearch";
import SalonDetail from "./pages/SalonDetail";
import SalonBusinessPage from "./pages/salon/SalonBusinessPage";
import NotFound from "./pages/NotFound";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/UserProfile";
import UserAppointments from "./pages/user/UserAppointments";
import AppointmentDetail from "./pages/user/AppointmentDetail";

// Salon Owner Pages
import SalonDashboard from "./pages/salon/SalonDashboard";
import SalonAppointments from "./pages/salon/SalonAppointments";
import SalonServices from "./pages/salon/SalonServices";
import SalonProfile from "./pages/salon/SalonProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSalons from "./pages/admin/AdminSalons";

// Context
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/user" element={<RegisterUser />} />
            <Route path="/register/salon" element={<RegisterSalon />} />
            <Route path="/salons" element={<SalonSearch />} />
            <Route path="/salon/:id" element={<SalonDetail />} />
            <Route path="/business/:id" element={<SalonBusinessPage />} />

            {/* User protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/user/appointments" element={<UserAppointments />} />
              <Route path="/user/appointments/:id" element={<AppointmentDetail />} />
            </Route>

            {/* Salon owner protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['salon_owner']} />}>
              <Route path="/salon/dashboard" element={<SalonDashboard />} />
              <Route path="/salon/appointments" element={<SalonAppointments />} />
              <Route path="/salon/services" element={<SalonServices />} />
              <Route path="/salon/profile" element={<SalonProfile />} />
            </Route>

            {/* Admin protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/salons" element={<AdminSalons />} />
            </Route>

            {/* Catch all for 404s */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
