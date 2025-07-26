-- Шаг 1: Добавляем поля локаций в таблицу движений
ALTER TABLE public.stock_movements 
ADD COLUMN IF NOT EXISTS from_location TEXT,
ADD COLUMN IF NOT EXISTS to_location TEXT;

-- Шаг 2: Модифицируем структуру stock_levels для учета по локациям
-- Сначала удаляем старые ограничения
ALTER TABLE public.stock_levels DROP CONSTRAINT IF EXISTS stock_levels_pkey;
ALTER TABLE public.stock_levels DROP CONSTRAINT IF EXISTS stock_levels_material_id_key;

-- Делаем поле location обязательным и устанавливаем значение по умолчанию
ALTER TABLE public.stock_levels 
ALTER COLUMN location SET DEFAULT 'Основной склад';
UPDATE public.stock_levels SET location = 'Основной склад' WHERE location IS NULL;
ALTER TABLE public.stock_levels 
ALTER COLUMN location SET NOT NULL;

-- Создаем новый составной первичный ключ
ALTER TABLE public.stock_levels 
ADD CONSTRAINT stock_levels_pkey PRIMARY KEY (material_id, location);

-- Шаг 3: ЗАМЕНЯЕМ сложную функцию на ПРОСТУЮ и ПРАВИЛЬНУЮ
CREATE OR REPLACE FUNCTION public.recalculate_stock_for_location(p_material_id INTEGER, p_location TEXT)
RETURNS void AS $$
DECLARE
    calculated_quantity NUMERIC;
    material_min_stock NUMERIC;
    new_status public.stock_status;
BEGIN
    -- Считаем итоговое количество для КОНКРЕТНОГО материала в КОНКРЕТНОЙ локации
    SELECT COALESCE(SUM(
      CASE 
        WHEN movement_type IN ('Поступление', 'Возврат') AND to_location = p_location THEN quantity
        WHEN movement_type IN ('Списание', 'Расход') AND from_location = p_location THEN -quantity
        WHEN movement_type = 'Перемещение' AND from_location = p_location THEN -quantity
        WHEN movement_type = 'Перемещение' AND to_location = p_location THEN quantity
        ELSE 0
      END
    ), 0) INTO calculated_quantity
    FROM public.stock_movements
    WHERE material_id = p_material_id AND (from_location = p_location OR to_location = p_location);

    -- Получаем минимальный уровень остатка для материала (он не зависит от локации)
    SELECT COALESCE(min_stock_level, 0) INTO material_min_stock FROM public.materials WHERE id = p_material_id;

    -- Определяем статус
    IF calculated_quantity <= 0 THEN
        new_status := 'Нет в наличии';
    ELSIF calculated_quantity <= material_min_stock THEN
        new_status := 'Заканчивается';
    ELSE
        new_status := 'В наличии';
    END IF;

    -- Обновляем или вставляем запись
    INSERT INTO public.stock_levels (material_id, location, current_quantity, reserved_quantity, status, last_movement_date, created_at, updated_at)
    VALUES (
      p_material_id,
      p_location,
      calculated_quantity,
      COALESCE((SELECT SUM(quantity_reserved) FROM public.material_reservations WHERE material_id = p_material_id AND location = p_location), 0),
      new_status::public.stock_status,
      (SELECT MAX(movement_date) FROM public.stock_movements WHERE material_id = p_material_id AND (from_location = p_location OR to_location = p_location)),
      now(),
      now()
    )
    ON CONFLICT (material_id, location) DO UPDATE SET
      current_quantity = EXCLUDED.current_quantity,
      status = EXCLUDED.status,
      last_movement_date = EXCLUDED.last_movement_date,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Шаг 4: Обновляем триггерную функцию, чтобы она вызывала нашу новую простую функцию
CREATE OR REPLACE FUNCTION public.trigger_recalculate_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Для INSERT, UPDATE, DELETE - просто вызываем пересчет для затронутых локаций
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.from_location IS NOT NULL THEN
            PERFORM public.recalculate_stock_for_location(NEW.material_id, NEW.from_location);
        END IF;
        IF NEW.to_location IS NOT NULL THEN
            PERFORM public.recalculate_stock_for_location(NEW.material_id, NEW.to_location);
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        IF OLD.from_location IS NOT NULL THEN
            PERFORM public.recalculate_stock_for_location(OLD.material_id, OLD.from_location);
        END IF;
        IF OLD.to_location IS NOT NULL THEN
            PERFORM public.recalculate_stock_for_location(OLD.material_id, OLD.to_location);
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- Шаг 5: Добавляем поле location в material_reservations
ALTER TABLE public.material_reservations ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Основной склад';

-- Обновляем существующие записи
UPDATE public.material_reservations SET location = 'Основной склад' WHERE location IS NULL;

-- Шаг 6: Обновляем триггер для резервов
CREATE OR REPLACE FUNCTION public.update_reserved_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  material_id_val INTEGER;
  location_val TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    material_id_val := OLD.material_id;
    location_val := OLD.location;
  ELSE
    material_id_val := NEW.material_id;
    location_val := NEW.location;
  END IF;

  -- Обновляем зарезервированное количество в stock_levels
  UPDATE public.stock_levels 
  SET 
    reserved_quantity = COALESCE((
      SELECT SUM(quantity_reserved) 
      FROM public.material_reservations 
      WHERE material_id = material_id_val AND location = location_val
    ), 0),
    updated_at = now()
  WHERE material_id = material_id_val AND location = location_val;

  -- Обновляем статус на основе нового доступного количества
  UPDATE public.stock_levels 
  SET status = CASE
    WHEN (current_quantity - reserved_quantity) <= 0 THEN 'Нет в наличии'::public.stock_status
    WHEN (current_quantity - reserved_quantity) <= (
      SELECT COALESCE(min_stock_level, 0) 
      FROM public.materials 
      WHERE id = material_id_val
    ) THEN 'Заканчивается'::public.stock_status
    ELSE 'В наличии'::public.stock_status
  END,
  updated_at = now()
  WHERE material_id = material_id_val AND location = location_val;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;