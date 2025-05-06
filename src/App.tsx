
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Аутентификация
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Logout from "./pages/auth/Logout";
import AccessDenied from "./pages/AccessDenied";

// Страницы приложения
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ProfileSettings from "./pages/user/ProfileSettings";

const queryClient = new QueryClient();

// Компонент-заглушка для страниц, которые ещё не разработаны
const PagePlaceholder = ({ title }: { title: string }) => (
  <div className="bg-white p-8 rounded-lg shadow">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>Эта страница находится в разработке.</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            {/* Маршруты, требующие аутентификации */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="leads" element={<PagePlaceholder title="Лиды" />} />
                <Route path="contacts" element={<PagePlaceholder title="Контакты" />} />
                <Route path="companies" element={<PagePlaceholder title="Компании" />} />
                <Route path="orders" element={<PagePlaceholder title="Заказы" />} />
                <Route path="tasks" element={<PagePlaceholder title="Задачи" />} />
                <Route path="calendar" element={<PagePlaceholder title="Календарь" />} />
                <Route path="products" element={<PagePlaceholder title="Товары CRM" />} />
                <Route path="suppliers" element={<PagePlaceholder title="Поставщики" />} />
                <Route path="partners" element={<PagePlaceholder title="Партнеры-Изготовители" />} />
                <Route path="settings" element={<ProfileSettings />} />
                
                {/* Маршрут, требующий роли Главного Администратора */}
                <Route 
                  element={
                    <ProtectedRoute 
                      requiredRole="Главный Администратор" 
                      redirectTo="/access-denied" 
                    />
                  }
                >
                  <Route path="admin/users" element={<UserManagement />} />
                </Route>
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
