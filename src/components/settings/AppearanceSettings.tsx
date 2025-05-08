
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AppearanceSettings = () => {
  const [theme, setTheme] = React.useState("system");
  const [density, setDensity] = React.useState("comfortable");
  
  const handleSave = () => {
    // In a real app, save these settings to user preferences
    toast.success("Настройки внешнего вида сохранены");
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Внешний вид</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Тема оформления</h3>
          <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light">Светлая</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark">Темная</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system">Системная (по умолчанию)</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Плотность интерфейса</h3>
          <RadioGroup value={density} onValueChange={setDensity} className="grid gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact">Компактная</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable">Комфортная (по умолчанию)</Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button onClick={handleSave}>Сохранить настройки</Button>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md">
        <p className="text-sm">Данный функционал находится в разработке. Настройки будут применены в следующих версиях CRM.</p>
      </div>
    </div>
  );
};

export default AppearanceSettings;
