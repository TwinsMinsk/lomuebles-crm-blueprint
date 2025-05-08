
import React, { useState } from "react";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

// Import settings sections
import UserProfileSettings from "@/components/settings/UserProfileSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import CompanySettings from "@/components/settings/CompanySettings";
import TemplatesSettings from "@/components/settings/TemplatesSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import SystemSettings from "@/components/settings/SystemSettings";

const Settings = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Extract tab from URL or default to "profile"
    const hash = location.hash.replace("#", "");
    return hash || "profile";
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`#${value}`);
  };

  const isAdmin = userRole === "Главный Администратор" || userRole === "Администратор";

  return (
    <Container>
      <div className="max-w-6xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Настройки</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-2">
            <div className="font-medium text-sm text-gray-500 uppercase mb-2">Настройки пользователя</div>
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  <Link 
                    to="#profile"
                    onClick={() => handleTabChange("profile")} 
                    className={`block px-3 py-2 rounded-md ${activeTab === "profile" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                  >
                    Профиль пользователя
                  </Link>
                  <Link 
                    to="#appearance"
                    onClick={() => handleTabChange("appearance")} 
                    className={`block px-3 py-2 rounded-md ${activeTab === "appearance" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                  >
                    Внешний вид
                  </Link>
                  <Link 
                    to="#notifications"
                    onClick={() => handleTabChange("notifications")} 
                    className={`block px-3 py-2 rounded-md ${activeTab === "notifications" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                  >
                    Уведомления
                  </Link>
                </nav>
              </CardContent>
            </Card>
            
            {isAdmin && (
              <>
                <div className="font-medium text-sm text-gray-500 uppercase mb-2 mt-6">Системные настройки</div>
                <Card>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      <Link 
                        to="#company"
                        onClick={() => handleTabChange("company")} 
                        className={`block px-3 py-2 rounded-md ${activeTab === "company" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                      >
                        Данные компании
                      </Link>
                      <Link 
                        to="#templates"
                        onClick={() => handleTabChange("templates")} 
                        className={`block px-3 py-2 rounded-md ${activeTab === "templates" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                      >
                        Шаблоны
                      </Link>
                      <Link 
                        to="#integrations"
                        onClick={() => handleTabChange("integrations")} 
                        className={`block px-3 py-2 rounded-md ${activeTab === "integrations" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                      >
                        Интеграции
                      </Link>
                      <Link 
                        to="#system"
                        onClick={() => handleTabChange("system")} 
                        className={`block px-3 py-2 rounded-md ${activeTab === "system" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
                      >
                        Метаданные системы
                      </Link>
                    </nav>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex-1">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                {activeTab === "profile" && <UserProfileSettings />}
                {activeTab === "appearance" && <AppearanceSettings />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "company" && isAdmin && <CompanySettings />}
                {activeTab === "templates" && isAdmin && <TemplatesSettings />}
                {activeTab === "integrations" && isAdmin && <IntegrationSettings />}
                {activeTab === "system" && isAdmin && <SystemSettings />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Settings;
