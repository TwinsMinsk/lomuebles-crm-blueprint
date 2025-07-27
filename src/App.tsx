
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/dashboard/DashboardPage";  // Updated to use the correct file
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Orders from "./pages/Orders";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Partners from "./pages/Partners";
import Settings from "./pages/Settings";
import UserManagement from "./pages/admin/UserManagement";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Logout from "./pages/auth/Logout";
import AccessDenied from "./pages/AccessDenied";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfileSettings from "./pages/user/ProfileSettings";
import OrdersPage from "./pages/orders/OrdersPage";
import NewOrderPage from "./pages/orders/NewOrderPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
import SpecialistTaskDetailPage from "./pages/tasks/SpecialistTaskDetailPage";
import { NotificationToast } from "./components/notifications/NotificationToast";
import { useAuth } from "./context/AuthContext";

// Import Finance module pages
import CategoriesPage from "./pages/finance/CategoriesPage";
import TransactionsPage from "./pages/finance/TransactionsPage";
import FinanceReportsPage from "./pages/finance/FinanceReportsPage";

// Import Warehouse module pages
import MaterialsPage from "./pages/warehouse/MaterialsPage";
import StockMovementsPage from "./pages/warehouse/StockMovementsPage";
import StockLevelsPage from "./pages/warehouse/StockLevelsPage";
import LocationsPage from "./pages/warehouse/LocationsPage";

// Component for role-based task detail routing
const TaskDetailRouter = () => {
  const { userRole } = useAuth();
  
  if (userRole === 'Специалист') {
    return <SpecialistTaskDetailPage />;
  }
  
  return <TaskDetailPage />;
};

function App() {
  return (
    <>
      <NotificationToast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<Leads />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="companies" element={<Companies />} />
          
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/new" element={<NewOrderPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetailRouter />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="partners" element={<Partners />} />

          {/* Warehouse module routes */}
          <Route 
            path="warehouse/materials" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <MaterialsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="warehouse/stock-movements" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <StockMovementsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="warehouse/stock-levels" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <StockLevelsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="warehouse/locations" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <LocationsPage />
              </ProtectedRoute>
            } 
          />

          {/* Finance module routes */}
          <Route 
            path="finance/categories" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <CategoriesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="finance/transactions" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <TransactionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="finance/reports" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <FinanceReportsPage />
              </ProtectedRoute>
            } 
          />

          <Route path="settings" element={<Settings />} />
          <Route path="user/profile" element={<ProfileSettings />} />
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute allowedRoles={["Главный Администратор", "Администратор"]}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
