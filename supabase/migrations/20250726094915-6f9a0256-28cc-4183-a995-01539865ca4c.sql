-- Создание триггера для уведомлений о минимальном остатке материалов

CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  material_name_val TEXT;
  material_min_level NUMERIC;
  admin_user RECORD;
  old_available_qty NUMERIC;
  new_available_qty NUMERIC;
BEGIN
  -- Получаем доступное количество (current_quantity - reserved_quantity)
  old_available_qty := COALESCE(OLD.current_quantity, 0) - COALESCE(OLD.reserved_quantity, 0);
  new_available_qty := COALESCE(NEW.current_quantity, 0) - COALESCE(NEW.reserved_quantity, 0);
  
  -- Получаем информацию о материале
  SELECT m.name, COALESCE(m.min_stock_level, 0)
  INTO material_name_val, material_min_level
  FROM public.materials m
  WHERE m.id = NEW.material_id;
  
  -- Проверяем условие: новое доступное количество <= минимального уровня
  -- И раньше было > минимального уровня (чтобы избежать повторных уведомлений)
  IF new_available_qty <= material_min_level AND old_available_qty > material_min_level THEN
    
    -- Отправляем уведомления всем администраторам
    FOR admin_user IN 
      SELECT id, COALESCE(full_name, email, 'Администратор') as admin_name
      FROM public.profiles 
      WHERE role IN ('Главный Администратор', 'Администратор')
      AND is_active = true
    LOOP
      -- Создаем уведомление для каждого администратора
      PERFORM public.create_notification(
        admin_user.id,
        'Низкий остаток материала',
        'Внимание: Доступный остаток материала ''' || material_name_val || ''' достиг минимального уровня!',
        'warning',
        'material',
        NEW.material_id,
        '/warehouse/materials'
      );
      
      -- Логирование для отладки
      RAISE NOTICE 'Created low stock notification for admin % about material %', admin_user.admin_name, material_name_val;
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Создаем триггер на таблице stock_levels
DROP TRIGGER IF EXISTS trigger_notify_low_stock ON public.stock_levels;

CREATE TRIGGER trigger_notify_low_stock
  AFTER UPDATE ON public.stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_low_stock();