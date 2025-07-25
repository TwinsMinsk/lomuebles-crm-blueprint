-- Создаем триггерную функцию для обработки изменений смет
CREATE OR REPLACE FUNCTION public.handle_estimate_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_order_id INTEGER;
BEGIN
  -- Определяем order_id в зависимости от операции
  IF TG_OP = 'DELETE' THEN
    v_order_id := OLD.order_id;
  ELSE
    v_order_id := NEW.order_id;
  END IF;
  
  -- Сценарий 1: Смета удаляется
  IF TG_OP = 'DELETE' THEN
    -- Удаляем все резервы для заказа, связанного с удаленной сметой
    DELETE FROM public.material_reservations 
    WHERE order_id = v_order_id;
    
    RAISE NOTICE 'Резервы для заказа №% удалены при удалении сметы', v_order_id;
    RETURN OLD;
  
  -- Сценарий 2: Статус сметы изменился с "утверждена" на что-то другое
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'утверждена' AND NEW.status != 'утверждена' THEN
    -- Удаляем все резервы для заказа, связанного со сметой
    DELETE FROM public.material_reservations 
    WHERE order_id = v_order_id;
    
    RAISE NOTICE 'Резервы для заказа №% удалены при смене статуса сметы с "утверждена" на "%"', v_order_id, NEW.status;
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Удаляем старый триггер, если существует
DROP TRIGGER IF EXISTS trigger_handle_estimate_changes ON public.estimates;

-- Создаем триггер для DELETE операций
CREATE TRIGGER trigger_handle_estimate_delete
  AFTER DELETE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_estimate_changes();

-- Создаем оптимизированный триггер для UPDATE операций только при изменении статуса
CREATE TRIGGER trigger_handle_estimate_status_update
  AFTER UPDATE ON public.estimates
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_estimate_changes();