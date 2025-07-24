-- Сначала удалим старые функции, если они были созданы по ошибке
DROP FUNCTION IF EXISTS public.handle_cancelled_order();
DROP FUNCTION IF EXISTS public.handle_completed_order();

-- Создаем ОДНУ ОБЩУЮ триггерную функцию для обработки смены статусов заказа
CREATE OR REPLACE FUNCTION public.handle_order_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  reservation_record RECORD;
  created_by_user UUID;
BEGIN
  -- Сценарий 1: Заказ ОТМЕНЕН
  IF NEW.status = 'Отменен' AND OLD.status != 'Отменен' THEN
    -- Удаляем все резервы для отмененного заказа
    DELETE FROM public.material_reservations 
    WHERE order_id = NEW.id;
    RAISE NOTICE 'Резервы для отмененного заказа №% удалены.', NEW.order_number;
  
  -- Сценарий 2: Заказ ЗАВЕРШЕН
  ELSIF NEW.status = 'Завершен' AND OLD.status != 'Завершен' THEN
    -- Определяем пользователя для поля created_by
    created_by_user := COALESCE(NEW.assigned_user_id, NEW.creator_user_id);
    
    -- Обрабатываем все резервы для завершенного заказа
    FOR reservation_record IN 
      SELECT mr.material_id, mr.quantity_reserved
      FROM public.material_reservations mr
      WHERE mr.order_id = NEW.id
    LOOP
      -- Создаем движение материала (списание)
      INSERT INTO public.stock_movements (
        material_id, movement_type, quantity, order_id, movement_date, notes, created_by
      ) VALUES (
        reservation_record.material_id,
        'Списание'::public.stock_movement_type,
        reservation_record.quantity_reserved,
        NEW.id,
        now(),
        'Автоматическое списание по завершению заказа №' || NEW.order_number,
        created_by_user
      );
    END LOOP;
    
    -- Удаляем обработанные резервы
    DELETE FROM public.material_reservations 
    WHERE order_id = NEW.id;
    
    RAISE NOTICE 'Резервы для завершенного заказа №% списаны и удалены.', NEW.order_number;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Удаляем старые триггеры, если они были созданы
DROP TRIGGER IF EXISTS trigger_handle_order_status_changes ON public.orders;
DROP TRIGGER IF EXISTS trigger_handle_completed_orders ON public.orders;

-- Создаем ОДИН ОБЩИЙ триггер на таблице orders
CREATE TRIGGER trigger_handle_order_status_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status) -- Срабатывает только при смене статуса
  EXECUTE FUNCTION public.handle_order_status_changes();