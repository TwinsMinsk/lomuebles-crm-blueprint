
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";

// Импортируем заглушки для страниц (будут созданы позже)
import Dashboard from "./pages/Dashboard";

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
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
            <Route path="settings" element={<PagePlaceholder title="Настройки" />} />
            <Route path="admin/users" element={<PagePlaceholder title="Управление Пользователями" />} />
            <Route path="logout" element={<PagePlaceholder title="Выход" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
