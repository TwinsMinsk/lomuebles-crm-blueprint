-- Удаляем все уведомления, связанные с виртуальным складом
DELETE FROM public.notifications 
WHERE 
  -- Уведомления о материалах
  related_entity_type = 'material'
  OR 
  -- Уведомления со словами о складе, остатках, материалах
  (
    message ILIKE '%материал%' 
    OR message ILIKE '%остаток%' 
    OR message ILIKE '%склад%'
    OR message ILIKE '%запас%'
    OR message ILIKE '%поступление%'
    OR message ILIKE '%расход%'
    OR message ILIKE '%движение%'
    OR title ILIKE '%материал%'
    OR title ILIKE '%остаток%'
    OR title ILIKE '%склад%'
    OR title ILIKE '%запас%'
    OR title ILIKE '%низкий остаток%'
  );