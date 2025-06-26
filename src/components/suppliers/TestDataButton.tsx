
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { addTestSuppliersWithFiles, removeTestSuppliers } from "@/utils/supplierTestData";
import { Database, Trash2 } from "lucide-react";

interface TestDataButtonProps {
  onDataChanged: () => void;
}

const TestDataButton: React.FC<TestDataButtonProps> = ({ onDataChanged }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddTestData = async () => {
    setLoading(true);
    try {
      await addTestSuppliersWithFiles();
      toast({
        title: "Тестовые данные добавлены",
        description: "Добавлены 3 поставщика с прикрепленными файлами",
        variant: "default",
      });
      onDataChanged();
    } catch (error) {
      console.error('Error adding test data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить тестовые данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTestData = async () => {
    setLoading(true);
    try {
      await removeTestSuppliers();
      toast({
        title: "Тестовые данные удалены",
        description: "Удалены все тестовые поставщики",
        variant: "default",
      });
      onDataChanged();
    } catch (error) {
      console.error('Error removing test data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить тестовые данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleAddTestData}
        disabled={loading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Database className="h-4 w-4" />
        Добавить тестовые данные
      </Button>
      <Button
        onClick={handleRemoveTestData}
        disabled={loading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Удалить тестовые данные
      </Button>
    </div>
  );
};

export default TestDataButton;
