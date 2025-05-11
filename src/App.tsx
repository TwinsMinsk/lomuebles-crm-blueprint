
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TaskFormProvider } from "./context/TaskFormContext";

// Create a client
const queryClient = new QueryClient();

// Routes
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Leads = React.lazy(() => import('./pages/Leads'));
const Contacts = React.lazy(() => import('./pages/Contacts'));
const Companies = React.lazy(() => import('./pages/Companies'));
const Products = React.lazy(() => import('./pages/Products'));
const Suppliers = React.lazy(() => import('./pages/Suppliers')); 
const Partners = React.lazy(() => import('./pages/Partners')); 
const Settings = React.lazy(() => import('./pages/Settings'));

// Auth routes
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));
const Logout = React.lazy(() => import('./pages/auth/Logout'));

// User routes
const ProfileSettings = React.lazy(() => import('./pages/user/ProfileSettings'));

// Admin routes
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));

// Error pages
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AccessDenied = React.lazy(() => import('./pages/AccessDenied'));

// Loading component for suspense
const SuspenseFallback = () => <div className="flex items-center justify-center min-h-screen">Loading...</div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TaskFormProvider>
          <BrowserRouter>
            <Suspense fallback={<SuspenseFallback />}>
              <Routes>
                {/* Auth routes - No layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/logout" element={<Logout />} />

                {/* Routes with Layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="companies" element={<Companies />} />
                  {/* Orders routes removed */}
                  <Route path="products" element={<Products />} />
                  <Route path="suppliers" element={<Suppliers />} />
                  <Route path="partners" element={<Partners />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<ProfileSettings />} /> {/* Kept for backward compatibility */}
                  <Route path="admin/users" element={<UserManagement />} />

                  {/* Error pages */}
                  <Route path="access-denied" element={<AccessDenied />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
          <SonnerToaster position="top-right" />
        </TaskFormProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
