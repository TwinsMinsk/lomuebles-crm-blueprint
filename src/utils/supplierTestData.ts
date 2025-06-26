
import { supabase } from "@/integrations/supabase/client";

// Test function to add suppliers with attached files
export const addTestSuppliersWithFiles = async () => {
  const testSuppliers = [
    {
      supplier_name: "Мебельная Фабрика АБВ",
      contact_person: "Иван Петров",
      phone: "+34 123 456 789",
      email: "ivan@fabrika-abv.com",
      website: "www.fabrika-abv.com",
      product_categories: "Кухонная мебель, Шкафы",
      terms: "Предоплата 50%, срок поставки 14 дней",
      attached_files: [
        {
          name: "katalog-kuhni.pdf",
          url: "https://example.com/files/katalog-kuhni.pdf",
          size: 2048576,
          type: "application/pdf"
        },
        {
          name: "ceniki-2024.xlsx",
          url: "https://example.com/files/ceniki-2024.xlsx",
          size: 512000,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
      ]
    },
    {
      supplier_name: "Европейские Материалы",
      contact_person: "Мария Гонсалес",
      phone: "+34 987 654 321",
      email: "maria@euro-materials.es",
      website: "euro-materials.es",
      product_categories: "Фурнитура, Материалы для отделки",
      terms: "Оплата по факту, минимальный заказ 500€",
      attached_files: [
        {
          name: "furnitura-katalog.pdf",
          url: "https://example.com/files/furnitura-katalog.pdf",
          size: 1536000,
          type: "application/pdf"
        }
      ]
    },
    {
      supplier_name: "Деревообработка Плюс",
      contact_person: "Андрей Сидоров",
      phone: "+34 555 123 456",
      email: "info@derevo-plus.com", 
      website: "derevo-plus.com",
      product_categories: "Массив дерева, Фанера, ДСП",
      terms: "Предоплата 30%, доставка включена",
      attached_files: [
        {
          name: "obrazcy-dereva.jpg",
          url: "https://example.com/files/obrazcy-dereva.jpg",
          size: 1024000,
          type: "image/jpeg"
        },
        {
          name: "tehnicheskie-harakteristiki.docx",
          url: "https://example.com/files/tehnicheskie-harakteristiki.docx",
          size: 256000,
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
        {
          name: "sertifikaty.pdf",
          url: "https://example.com/files/sertifikaty.pdf",
          size: 3072000,
          type: "application/pdf"
        }
      ]
    }
  ];

  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(testSuppliers)
      .select();

    if (error) {
      console.error('Error adding test suppliers:', error);
      throw error;
    }

    console.log('Test suppliers added successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to add test suppliers:', error);
    throw error;
  }
};

// Function to remove test data
export const removeTestSuppliers = async () => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .in('supplier_name', [
        'Мебельная Фабрика АБВ',
        'Европейские Материалы', 
        'Деревообработка Плюс'
      ]);

    if (error) {
      console.error('Error removing test suppliers:', error);
      throw error;
    }

    console.log('Test suppliers removed successfully');
  } catch (error) {
    console.error('Failed to remove test suppliers:', error);
    throw error;
  }
};
