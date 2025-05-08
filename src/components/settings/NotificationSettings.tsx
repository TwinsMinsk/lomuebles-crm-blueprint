
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = React.useState({
    newLeads: true,
    taskAssigned: true,
    taskCompleted: false,
    orderStatusChanged: true,
    dailyDigest: false,
    weeklyReport: true
  });
  
  const [browserNotifications, setBrowserNotifications] = React.useState({
    newLeads: true,
    taskAssigned: true,
    taskCompleted: true,
    orderStatusChanged: false,
    mentions: true
  });
  
  const handleSaveNotifications = () => {
    // In a real app, save to user preferences in database
    toast.success("Настройки уведомлений сохранены");
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Уведомления</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Email уведомления</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-new-leads">Новые лиды</Label>
                <p className="text-sm text-muted-foreground">Получать уведомления о новых лидах</p>
              </div>
              <Switch 
                id="email-new-leads" 
                checked={emailNotifications.newLeads}
                onCheckedChange={(checked) => 
                  setEmailNotifications(prev => ({ ...prev, newLeads: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-task-assigned">Назначенные задачи</Label>
                <p className="text-sm text-muted-foreground">Получать уведомления когда вам назначают задачу</p>
              </div>
              <Switch 
                id="email-task-assigned" 
                checked={emailNotifications.taskAssigned}
                onCheckedChange={(checked) => 
                  setEmailNotifications(prev => ({ ...prev, taskAssigned: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-task-completed">Завершенные задачи</Label>
                <p className="text-sm text-muted-foreground">Получать уведомления о завершенных задачах</p>
              </div>
              <Switch 
                id="email-task-completed" 
                checked={emailNotifications.taskCompleted}
                onCheckedChange={(checked) => 
                  setEmailNotifications(prev => ({ ...prev, taskCompleted: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-order-status">Изменения статуса заказа</Label>
                <p className="text-sm text-muted-foreground">Получать уведомления об изменении статуса заказа</p>
              </div>
              <Switch 
                id="email-order-status" 
                checked={emailNotifications.orderStatusChanged}
                onCheckedChange={(checked) => 
                  setEmailNotifications(prev => ({ ...prev, orderStatusChanged: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-daily-digest">Ежедневная сводка</Label>
                <p className="text-sm text-muted-foreground">Получать ежедневную сводку активностей</p>
              </div>
              <Switch 
                id="email-daily-digest" 
                checked={emailNotifications.dailyDigest}
                onCheckedChange={(checked) => 
                  setEmailNotifications(prev => ({ ...prev, dailyDigest: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-weekly-report">Еженедельный отчет</Label>
                <p className="text-sm text-muted-foreground">Получать отчет по результатам недели</p>
              </div>
              <Switch 
                id="email-weekly-report" 
                checked={emailNotifications.weeklyReport}
                onCheckedChange={(checked) => 
                  setEmailNotifications(prev => ({ ...prev, weeklyReport: checked }))
                }
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Уведомления в браузере</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-new-leads">Новые лиды</Label>
                <p className="text-sm text-muted-foreground">Показывать уведомления о новых лидах</p>
              </div>
              <Switch 
                id="browser-new-leads" 
                checked={browserNotifications.newLeads}
                onCheckedChange={(checked) => 
                  setBrowserNotifications(prev => ({ ...prev, newLeads: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-task-assigned">Назначенные задачи</Label>
                <p className="text-sm text-muted-foreground">Показывать уведомления при назначении вам задачи</p>
              </div>
              <Switch 
                id="browser-task-assigned" 
                checked={browserNotifications.taskAssigned}
                onCheckedChange={(checked) => 
                  setBrowserNotifications(prev => ({ ...prev, taskAssigned: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-task-completed">Завершенные задачи</Label>
                <p className="text-sm text-muted-foreground">Показывать уведомления о завершении задач</p>
              </div>
              <Switch 
                id="browser-task-completed" 
                checked={browserNotifications.taskCompleted}
                onCheckedChange={(checked) => 
                  setBrowserNotifications(prev => ({ ...prev, taskCompleted: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-order-status">Изменения статуса заказа</Label>
                <p className="text-sm text-muted-foreground">Показывать уведомления при изменении статуса заказа</p>
              </div>
              <Switch 
                id="browser-order-status" 
                checked={browserNotifications.orderStatusChanged}
                onCheckedChange={(checked) => 
                  setBrowserNotifications(prev => ({ ...prev, orderStatusChanged: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-mentions">Упоминания</Label>
                <p className="text-sm text-muted-foreground">Показывать уведомления при упоминании вас в комментариях</p>
              </div>
              <Switch 
                id="browser-mentions" 
                checked={browserNotifications.mentions}
                onCheckedChange={(checked) => 
                  setBrowserNotifications(prev => ({ ...prev, mentions: checked }))
                }
              />
            </div>
          </div>
        </div>
        
        <Button onClick={handleSaveNotifications}>Сохранить настройки уведомлений</Button>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md">
        <p className="text-sm">Данный функционал находится в разработке. Настройки будут применены в следующих версиях CRM.</p>
      </div>
    </div>
  );
};

export default NotificationSettings;
