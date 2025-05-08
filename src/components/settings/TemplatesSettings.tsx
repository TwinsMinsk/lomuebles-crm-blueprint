
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const templateTypes = [
  { id: "email_welcome", name: "Email приветствие" },
  { id: "email_order_confirmation", name: "Подтверждение заказа" },
  { id: "email_order_shipped", name: "Заказ отправлен" },
  { id: "email_order_delivered", name: "Заказ доставлен" },
  { id: "email_invoice", name: "Счет" },
  { id: "sms_order_confirmation", name: "SMS подтверждение заказа" }
];

const TemplatesSettings = () => {
  const [selectedType, setSelectedType] = React.useState<string>("");
  const [templateContent, setTemplateContent] = React.useState<string>("");
  const [templateSubject, setTemplateSubject] = React.useState<string>("");
  
  const handleSelectType = (type: string) => {
    setSelectedType(type);
    
    // In a real app, fetch template content from database
    const demoContent = {
      email_welcome: {
        subject: "Добро пожаловать в lomuebles.es!",
        content: "Уважаемый {client_name},\n\nДобро пожаловать в lomuebles.es!\n\nМы рады, что вы выбрали нас. Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами.\n\nС уважением,\nКоманда lomuebles.es"
      },
      email_order_confirmation: {
        subject: "Подтверждение заказа #{order_number}",
        content: "Уважаемый {client_name},\n\nВаш заказ #{order_number} успешно оформлен и принят в обработку.\n\nСумма заказа: {order_amount}\nДата доставки: {delivery_date}\n\nС уважением,\nКоманда lomuebles.es"
      }
    };
    
    const template = demoContent[type as keyof typeof demoContent];
    if (template) {
      setTemplateSubject(template.subject);
      setTemplateContent(template.content);
    } else {
      setTemplateSubject("");
      setTemplateContent("");
    }
  };
  
  const handleSaveTemplate = () => {
    // In a real app, save to database
    toast.success("Шаблон успешно сохранен");
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Шаблоны</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Список шаблонов</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Email приветствие</TableCell>
                <TableCell>Email</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectType("email_welcome")}
                  >
                    Редактировать
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Подтверждение заказа</TableCell>
                <TableCell>Email</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectType("email_order_confirmation")}
                  >
                    Редактировать
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Заказ отправлен</TableCell>
                <TableCell>Email</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" disabled>
                    Редактировать
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SMS подтверждение</TableCell>
                <TableCell>SMS</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" disabled>
                    Редактировать
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Редактор шаблонов</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-type">Выберите тип шаблона</Label>
              <Select 
                value={selectedType} 
                onValueChange={handleSelectType}
              >
                <SelectTrigger id="template-type" className="w-full">
                  <SelectValue placeholder="Выберите тип шаблона" />
                </SelectTrigger>
                <SelectContent>
                  {templateTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedType && (
              <>
                <div>
                  <Label htmlFor="template-subject">Тема письма</Label>
                  <Input
                    id="template-subject"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    placeholder="Тема письма"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Доступные переменные: {"{client_name}"}, {"{order_number}"}, {"{order_amount}"}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="template-content">Содержание</Label>
                  <Textarea
                    id="template-content"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    placeholder="Содержание шаблона"
                    rows={10}
                    className="font-mono"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Доступные переменные: {"{client_name}"}, {"{order_number}"}, {"{order_amount}"}, {"{delivery_date}"}
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Предпросмотр</Button>
                  <Button onClick={handleSaveTemplate}>Сохранить шаблон</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md">
        <p className="text-sm">Данный функционал находится в разработке. Настройки будут применены в следующих версиях CRM.</p>
      </div>
    </div>
  );
};

export default TemplatesSettings;
