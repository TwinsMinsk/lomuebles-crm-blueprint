
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const IntegrationSettings = () => {
  const [tildaEnabled, setTildaEnabled] = React.useState(true);
  const [googleCalendarEnabled, setGoogleCalendarEnabled] = React.useState(false);
  const [emailEnabled, setEmailEnabled] = React.useState(false);
  const [smsEnabled, setSmsEnabled] = React.useState(false);
  
  const handleSaveTildaSettings = () => {
    toast.success("Настройки интеграции Tilda сохранены");
  };
  
  const handleSaveEmailSettings = () => {
    toast.success("Настройки интеграции Email сохранены");
  };
  
  const handleSaveCalendarSettings = () => {
    toast.success("Настройки интеграции Google Calendar сохранены");
  };
  
  const handleConnectGoogle = () => {
    toast.success("Перенаправление на страницу авторизации Google...");
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Интеграции</h2>
      
      <div className="space-y-8">
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tilda</CardTitle>
                <CardDescription>Настройки интеграции с платформой Tilda</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="tilda-enabled">Активировать</Label>
                <Switch 
                  id="tilda-enabled" 
                  checked={tildaEnabled} 
                  onCheckedChange={setTildaEnabled} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="tilda-webhook-url">URL вебхука в N8N</Label>
                <Input 
                  id="tilda-webhook-url"
                  defaultValue="https://n8n.example.com/webhook/tilda-integration" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tilda-public-key">Публичный ключ Tilda</Label>
                <Input id="tilda-public-key" defaultValue="abc123xyz" type="password" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="tilda-secret-key">Секретный ключ Tilda</Label>
                <Input id="tilda-secret-key" defaultValue="" type="password" />
              </div>
              
              <Button onClick={handleSaveTildaSettings}>Сохранить настройки Tilda</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>Интеграция с календарем Google</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="google-calendar-enabled">Активировать</Label>
                <Switch 
                  id="google-calendar-enabled" 
                  checked={googleCalendarEnabled} 
                  onCheckedChange={setGoogleCalendarEnabled} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="google-calendar-id">ID календаря</Label>
                <Input id="google-calendar-id" placeholder="ID календаря Google" />
              </div>
              
              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={handleConnectGoogle} className="flex-1">
                  Подключить Google
                </Button>
                <Button onClick={handleSaveCalendarSettings} className="flex-1">
                  Сохранить настройки
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email</CardTitle>
                <CardDescription>Настройки отправки email-уведомлений</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="email-enabled">Активировать</Label>
                <Switch 
                  id="email-enabled" 
                  checked={emailEnabled} 
                  onCheckedChange={setEmailEnabled} 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp-server">SMTP сервер</Label>
                  <Input id="smtp-server" placeholder="mail.example.com" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-port">SMTP порт</Label>
                  <Input id="smtp-port" placeholder="587" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-username">Имя пользователя</Label>
                  <Input id="smtp-username" placeholder="username" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-password">Пароль</Label>
                  <Input id="smtp-password" type="password" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-from-email">Email отправителя</Label>
                  <Input id="smtp-from-email" placeholder="noreply@example.com" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="smtp-from-name">Имя отправителя</Label>
                  <Input id="smtp-from-name" placeholder="Lomuebles CRM" />
                </div>
              </div>
              
              <Button onClick={handleSaveEmailSettings}>Сохранить настройки Email</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md">
        <p className="text-sm">Данный функционал находится в разработке. Настройки будут применены в следующих версиях CRM.</p>
      </div>
    </div>
  );
};

export default IntegrationSettings;
