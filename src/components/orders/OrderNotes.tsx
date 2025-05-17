
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface OrderNotesProps {
  orderId: number;
  initialNotes: string | null;
}

const OrderNotes: React.FC<OrderNotesProps> = ({ orderId, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Заметки успешно сохранены");
      setIsEditing(false);
    } catch (error) {
      toast.error("Ошибка при сохранении заметок");
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing && !notes) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Заметки не добавлены</p>
        <Button onClick={() => setIsEditing(true)}>Добавить заметку</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Введите заметки или комментарии к заказу..."
            className="min-h-[200px]"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Отмена
            </Button>
            <Button onClick={handleSaveNotes} disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить заметки"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap">{notes}</div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Редактировать заметки
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderNotes;
