-- Add location column to stock_levels table and create composite primary key
ALTER TABLE public.stock_levels DROP CONSTRAINT IF EXISTS stock_levels_pkey;
ALTER TABLE public.stock_levels ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Основной склад';
ALTER TABLE public.stock_levels ADD CONSTRAINT stock_levels_pkey PRIMARY KEY (material_id, location);

-- Update stock_movements table to ensure location fields exist
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS from_location TEXT;
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS to_location TEXT;

-- Update existing stock_movements based on movement_type
UPDATE public.stock_movements 
SET to_location = 'Основной склад' 
WHERE movement_type IN ('Поступление', 'Возврат') AND to_location IS NULL;

UPDATE public.stock_movements 
SET from_location = 'Основной склад' 
WHERE movement_type IN ('Расход', 'Списание') AND from_location IS NULL;

-- Update material_reservations to include location
ALTER TABLE public.material_reservations ADD CONSTRAINT material_reservations_location_material_order_key UNIQUE (material_id, location, order_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_levels_location ON public.stock_levels(location);
CREATE INDEX IF NOT EXISTS idx_stock_movements_locations ON public.stock_movements(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_material_reservations_location ON public.material_reservations(location);

-- Update triggers to handle location-based stock calculations
DROP TRIGGER IF EXISTS trigger_recalculate_stock_on_stock_movements ON public.stock_movements;
CREATE TRIGGER trigger_recalculate_stock_on_stock_movements
  AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_stock();