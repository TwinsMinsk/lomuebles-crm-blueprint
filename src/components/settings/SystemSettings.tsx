
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const SystemSettings = () => {
  const handleBackupDatabase = () => {
    toast.success("Резервное копирование базы данных запущено");
  };
  
  const handleClearCache = () => {
    toast.success("Кэш системы очищен успешно");
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Системные настройки</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Метаданные системы</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="system-name">Название системы</Label>
                <Input id="system-name" defaultValue="Lomuebles CRM" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="system-version">Версия</Label>
                <Input id="system-version" defaultValue="1.0.0" disabled />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="default-language">Язык по умолчанию</Label>
              <Select defaultValue="ru">
                <SelectTrigger id="default-language">
                  <SelectValue placeholder="Выберите язык" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <Label htmlFor="debug-mode" className="flex-grow">Режим отладки</Label>
              <Switch id="debug-mode" />
            </div>
            
            <Button>Сохранить метаданные</Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">База данных</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Статус базы данных</Label>
              <div className="p-2 bg-green-50 text-green-700 rounded-md">
                Подключена и работает нормально
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Размер базы данных</Label>
              <div className="p-2 bg-slate-50 rounded-md">
                128.5 MB
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleBackupDatabase}>
                Резервное копирование
              </Button>
              <Button variant="destructive" onClick={handleClearCache}>
                Очистить кэш системы
              </Button>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Журнал системы</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="log-level">Уровень журналирования</Label>
              <Select defaultValue="info">
                <SelectTrigger id="log-level">
                  <SelectValue placeholder="Выберите уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Только ошибки</SelectItem>
                  <SelectItem value="warning">Предупреждения и ошибки</SelectItem>
                  <SelectItem value="info">Информация, предупреждения и ошибки</SelectItem>
                  <SelectItem value="debug">Отладочная информация (все сообщения)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="log-retention">Хранение журналов</Label>
              <Select defaultValue="30">
                <SelectTrigger id="log-retention">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                  <SelectItem value="90">90 дней</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button>Сохранить настройки журнала</Button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md">
        <p className="text-sm">Данный функционал находится в разработке. Настройки будут применены в следующих версиях CRM.</p>
      </div>
    </div>
  );
};

export default SystemSettings;
