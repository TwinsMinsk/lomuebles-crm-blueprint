
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskFormProvider } from './context/TaskFormContext';
import { Toaster } from '@/components/ui/sonner';

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
      retry: 1
    },
  },
});

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TaskFormProvider>
            <App />
            <Toaster />
          </TaskFormProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
