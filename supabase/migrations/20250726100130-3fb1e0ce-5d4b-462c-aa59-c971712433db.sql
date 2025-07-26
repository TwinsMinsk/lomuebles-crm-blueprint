-- Удаляем старое ограничение CHECK для related_entity_type
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_related_entity_type_check;

-- Создаем новое ограничение с расширенным списком типов сущностей
ALTER TABLE public.notifications ADD CONSTRAINT notifications_related_entity_type_check
CHECK (related_entity_type IN (
    'lead', 'contact', 'order', 'task', 'company', 'supplier', 'partner',
    -- Добавляем новые типы для складской функциональности
    'material', 'estimate', 'stock_movement'
));