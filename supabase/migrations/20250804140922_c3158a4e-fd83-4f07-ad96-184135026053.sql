-- Создание тестовых материалов для различных сценариев
INSERT INTO public.materials (
  name, category, unit, current_cost, min_stock_level, max_stock_level, 
  description, is_active, creator_user_id
) VALUES 
  ('Доска дубовая 40x200x2000', 'Древесина', 'шт', 1500.00, 10, 100, 
   'Тестовый материал для проверки резервирования', true, (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)),
  ('Саморезы 4x50', 'Крепеж', 'шт', 2.50, 1000, 10000, 
   'Тестовый крепеж с низким минимальным остатком', true, (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)),
  ('Лак акриловый прозрачный', 'Лакокрасочные материалы', 'л', 850.00, 5, 50, 
   'Тестовое покрытие для проверки списаний', true, (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)),
  ('Фанера березовая 18мм', 'Древесина', 'лист', 2200.00, 15, 200, 
   'Тестовый листовой материал', true, (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)),
  ('Петли мебельные накладные', 'Фурнитура', 'шт', 45.00, 50, 500, 
   'Тестовая фурнитура для проверки разных локаций', true, (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1));

-- Создание начальных поступлений материалов в разные локации
INSERT INTO public.stock_movements (
  material_id, movement_type, quantity, to_location, movement_date, notes, created_by
) 
SELECT 
  m.id,
  'Поступление'::public.stock_movement_type,
  CASE 
    WHEN m.name LIKE '%Доска%' THEN 50
    WHEN m.name LIKE '%Саморезы%' THEN 5000
    WHEN m.name LIKE '%Лак%' THEN 25
    WHEN m.name LIKE '%Фанера%' THEN 80
    WHEN m.name LIKE '%Петли%' THEN 200
  END,
  'Основной склад',
  now() - INTERVAL '10 days',
  'Тестовое поступление для ' || m.name,
  (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)
FROM public.materials m
WHERE m.name IN ('Доска дубовая 40x200x2000', 'Саморезы 4x50', 'Лак акриловый прозрачный', 'Фанера березовая 18мм', 'Петли мебельные накладные');

-- Дополнительные поступления в другие локации
INSERT INTO public.stock_movements (
  material_id, movement_type, quantity, to_location, movement_date, notes, created_by
) 
SELECT 
  m.id,
  'Поступление'::public.stock_movement_type,
  CASE 
    WHEN m.name LIKE '%Доска%' THEN 20
    WHEN m.name LIKE '%Петли%' THEN 100
  END,
  'Цех изготовления',
  now() - INTERVAL '5 days',
  'Поступление в цех для ' || m.name,
  (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)
FROM public.materials m
WHERE m.name IN ('Доска дубовая 40x200x2000', 'Петли мебельные накладные');

-- Создание тестовых смет для существующих заказов
INSERT INTO public.estimates (
  order_id, name, status, creator_user_id, created_at
) 
SELECT 
  o.id,
  'Смета №' || row_number() OVER (ORDER BY o.id) || ' для ' || COALESCE(o.order_name, 'Заказ №' || o.order_number),
  CASE 
    WHEN row_number() OVER (ORDER BY o.id) % 3 = 1 THEN 'утверждена'
    WHEN row_number() OVER (ORDER BY o.id) % 3 = 2 THEN 'черновик'
    ELSE 'отменена'
  END,
  COALESCE(o.assigned_user_id, o.creator_user_id),
  now() - INTERVAL '3 days'
FROM public.orders o
WHERE o.status NOT IN ('Отменен', 'Завершен')
AND o.order_type = 'Мебель на заказ'
LIMIT 5;

-- Создание позиций в сметах
INSERT INTO public.estimate_items (
  estimate_id, material_id, quantity_needed, price_at_estimation
)
SELECT 
  e.id,
  m.id,
  CASE 
    WHEN m.name LIKE '%Доска%' THEN 15 + (random() * 10)::numeric
    WHEN m.name LIKE '%Саморезы%' THEN 100 + (random() * 200)::numeric
    WHEN m.name LIKE '%Лак%' THEN 2 + (random() * 3)::numeric
    WHEN m.name LIKE '%Фанера%' THEN 8 + (random() * 12)::numeric
    WHEN m.name LIKE '%Петли%' THEN 20 + (random() * 30)::numeric
  END,
  m.current_cost + (m.current_cost * (random() - 0.5) * 0.1) -- цена ±5% от текущей
FROM public.estimates e
CROSS JOIN public.materials m
WHERE e.status = 'утверждена' -- добавляем позиции только к утвержденным сметам
AND m.name IN ('Доска дубовая 40x200x2000', 'Саморезы 4x50', 'Лак акриловый прозрачный', 'Фанера березовая 18мм', 'Петли мебельные накладные')
AND random() > 0.3; -- не все материалы во всех сметах

-- Создание дополнительных движений склада для тестирования
INSERT INTO public.stock_movements (
  material_id, movement_type, quantity, from_location, to_location, movement_date, notes, created_by
)
SELECT 
  m.id,
  'Перемещение'::public.stock_movement_type,
  5,
  'Основной склад',
  'Цех изготовления',
  now() - INTERVAL '2 days',
  'Тестовое перемещение ' || m.name,
  (SELECT id FROM profiles WHERE role = 'Главный Администратор' LIMIT 1)
FROM public.materials m
WHERE m.name IN ('Лак акриловый прозрачный', 'Фанера березовая 18мм');