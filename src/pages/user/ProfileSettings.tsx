
import React from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ProfileSettings = () => {
  const { user, userRole } = useAuth();
  
  if (!user) {
    return (
      <Container>
        <div className="flex justify-center items-center p-8">
          <p>Загрузка профиля...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Мой профиль</h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="integrations">Интеграции</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50">
                <CardTitle>Информация профиля</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm">{user.email}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Имя</h3>
                    <p className="mt-1 text-sm">{user.user_metadata?.full_name || "Не указано"}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Роль</h3>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                        {userRole || "Загрузка..."}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50">
                <CardTitle>Настройки уведомлений</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-4 bg-slate-50 rounded-md">
                  <p className="text-gray-500 italic">
                    Функционал настройки уведомлений будет доступен в ближайшем обновлении.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card className="shadow-sm">
              <CardHeader className="bg-slate-50">
                <CardTitle>Интеграции</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-4 bg-slate-50 rounded-md">
                  <p className="text-gray-500 italic">
                    Настройки интеграций будут доступны в ближайшем обновлении.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default ProfileSettings;
