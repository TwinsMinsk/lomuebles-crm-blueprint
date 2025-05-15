
import { useState } from "react";

// Define order type and status constants
const ORDER_TYPES = ["Мебель на заказ", "Готовая мебель (Tilda)"];
const READY_MADE_STATUSES = ["Новый", "Ожидает подтверждения", "Ожидает оплаты", "Оплачен", "Передан на сборку", "Готов к отгрузке", "В доставке", "Выполнен", "Отменен"];
const CUSTOM_MADE_STATUSES = ["Новый запрос", "Предварительная оценка", "Согласование ТЗ/Дизайна", "Ожидает замера", "Замер выполнен", "Проектирование", "Согласование проекта", "Ожидает предоплаты", "В производстве", "Готов к монтажу", "Монтаж", "Завершен", "Отменен"];

// Combine status options for filtering
const ALL_STATUSES = [...new Set([...READY_MADE_STATUSES, ...CUSTOM_MADE_STATUSES])];

export const useFilterOptions = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Return predefined options
  return {
    orderTypes: ORDER_TYPES,
    statuses: ALL_STATUSES,
    readyMadeStatuses: READY_MADE_STATUSES,
    customMadeStatuses: CUSTOM_MADE_STATUSES,
    isLoading
  };
};
