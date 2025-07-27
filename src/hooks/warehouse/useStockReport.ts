import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StockReport, MaterialCategory } from "@/types/warehouse";

interface StockReportFilters {
  category?: MaterialCategory;
  low_stock_only?: boolean;
  include_inactive?: boolean;
}

interface StockReportData {
  data: StockReport[];
  summary: {
    total_materials: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
}

export const useStockReport = (filters?: StockReportFilters) => {
  return useQuery({
    queryKey: ["stock-report", filters],
    queryFn: async (): Promise<StockReportData> => {
      let query = supabase
        .from("materials")
        .select(`
          id,
          name,
          category,
          unit,
          min_stock_level,
          max_stock_level,
          current_cost,
          is_active,
          stock_levels(
            current_quantity,
            reserved_quantity,
            status,
            location,
            last_movement_date
          )
        `);

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (!filters?.include_inactive) {
        query = query.eq("is_active", true);
      }

      const { data: materials, error } = await query;

      if (error) {
        console.error("Error fetching stock report:", error);
        throw new Error(`Failed to fetch stock report: ${error.message}`);
      }

      const stockData: StockReport[] = materials
        ?.map((material) => {
          const stockLevel = material.stock_levels?.[0];
          const currentQuantity = stockLevel?.current_quantity || 0;
          const reservedQuantity = stockLevel?.reserved_quantity || 0;
          const availableQuantity = currentQuantity - reservedQuantity;
          const totalValue = currentQuantity * (material.current_cost || 0);

          return {
            material_id: material.id,
            material_name: material.name,
            category: material.category,
            unit: material.unit,
            current_quantity: currentQuantity,
            reserved_quantity: reservedQuantity,
            available_quantity: availableQuantity,
            min_stock_level: material.min_stock_level,
            max_stock_level: material.max_stock_level,
            current_cost: material.current_cost,
            total_value: totalValue,
            status: stockLevel?.status || 'Нет в наличии',
            location: stockLevel?.location,
            last_movement_date: stockLevel?.last_movement_date,
          };
        })
        .filter((item) => {
          if (filters?.low_stock_only) {
            return item.status === 'Заканчивается' || item.status === 'Нет в наличии';
          }
          return true;
        }) || [];

      const summary = {
        total_materials: stockData.length,
        in_stock: stockData.filter(item => item.status === 'В наличии').length,
        low_stock: stockData.filter(item => item.status === 'Заканчивается').length,
        out_of_stock: stockData.filter(item => item.status === 'Нет в наличии').length,
      };

      return { data: stockData, summary };
    },
  });
};