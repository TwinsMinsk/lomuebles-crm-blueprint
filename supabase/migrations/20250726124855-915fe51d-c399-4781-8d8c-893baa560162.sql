-- Создаем таблицу locations с правильным внешним ключом
CREATE TABLE public.locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  creator_user_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Создаем RLS политики
CREATE POLICY "Admins can view all locations" 
ON public.locations FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can insert locations" 
ON public.locations FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can update all locations" 
ON public.locations FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

CREATE POLICY "Admins can delete locations" 
ON public.locations FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['Главный Администратор'::text, 'Администратор'::text]));

-- Создаем ПРАВИЛЬНУЮ триггерную функцию для updated_at
CREATE OR REPLACE FUNCTION public.update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер, который использует эту правильную функцию
CREATE TRIGGER trigger_update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_locations_updated_at();