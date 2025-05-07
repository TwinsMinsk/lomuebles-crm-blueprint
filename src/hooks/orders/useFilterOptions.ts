
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Manager {
  id: string;
  name: string;
}

export function useFilterOptions() {
  const [orderTypes, setOrderTypes] = useState<string[]>([
    "Готовая мебель (Tilda)",
    "Мебель на заказ"
  ]);
  const [readyMadeStatuses, setReadyMadeStatuses] = useState<string[]>([]);
  const [customMadeStatuses, setCustomMadeStatuses] = useState<string[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<string[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchFilterOptions() {
      setIsLoading(true);
      try {
        // Fetch distinct ready-made statuses
        const { data: readyMadeData, error: readyMadeError } = await supabase
          .from("deals_orders")
          .select("status_ready_made")
          .not("status_ready_made", "is", null)
          .order("status_ready_made");

        if (readyMadeError) throw readyMadeError;

        // Fetch distinct custom-made statuses
        const { data: customMadeData, error: customMadeError } = await supabase
          .from("deals_orders")
          .select("status_custom_made")
          .not("status_custom_made", "is", null)
          .order("status_custom_made");

        if (customMadeError) throw customMadeError;

        // Fetch distinct payment statuses
        const { data: paymentData, error: paymentError } = await supabase
          .from("deals_orders")
          .select("payment_status")
          .not("payment_status", "is", null)
          .order("payment_status");

        if (paymentError) throw paymentError;

        // Fetch managers/users
        const { data: managersData, error: managersError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .order("full_name");

        if (managersError) throw managersError;

        // Process and set the data
        const readyMadeSet = new Set(readyMadeData.map(item => item.status_ready_made));
        const customMadeSet = new Set(customMadeData.map(item => item.status_custom_made));
        const paymentSet = new Set(paymentData.map(item => item.payment_status));

        setReadyMadeStatuses(Array.from(readyMadeSet).filter(Boolean) as string[]);
        setCustomMadeStatuses(Array.from(customMadeSet).filter(Boolean) as string[]);
        setPaymentStatuses(Array.from(paymentSet).filter(Boolean) as string[]);
        
        setManagers(managersData.map(user => ({
          id: user.id,
          name: user.full_name || "Без имени"
        })));

      } catch (error) {
        console.error("Error fetching filter options:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilterOptions();
  }, []);

  return {
    orderTypes,
    readyMadeStatuses,
    customMadeStatuses,
    paymentStatuses,
    managers,
    isLoading
  };
}
