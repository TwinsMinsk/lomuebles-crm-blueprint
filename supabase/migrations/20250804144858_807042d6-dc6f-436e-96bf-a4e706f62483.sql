-- Добавляем тестовые локации если их еще нет
INSERT INTO public.locations (name, description, address, creator_user_id, is_active)
SELECT * FROM (VALUES 
  ('Основной склад', 'Главное складское помещение', 'ул. Складская, 1', (SELECT id FROM public.profiles WHERE role = 'Главный Администратор' LIMIT 1), true),
  ('Цех производства', 'Производственный цех', 'ул. Заводская, 10', (SELECT id FROM public.profiles WHERE role = 'Главный Администратор' LIMIT 1), true),
  ('Выставочный зал', 'Зал с образцами мебели', 'ул. Центральная, 5', (SELECT id FROM public.profiles WHERE role = 'Главный Администратор' LIMIT 1), true),
  ('Склад готовой продукции', 'Склад для готовых изделий', 'ул. Складская, 2', (SELECT id FROM public.profiles WHERE role = 'Главный Администратор' LIMIT 1), true)
) AS new_locations(name, description, address, creator_user_id, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.locations WHERE name = new_locations.name
);