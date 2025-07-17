-- Remove duplicate trigger if it exists
DROP TRIGGER IF EXISTS trg_update_stock_level_on_movement ON public.stock_movements;

-- Create the trigger (will replace if exists)
CREATE TRIGGER trg_update_stock_level_on_movement
AFTER INSERT OR UPDATE OR DELETE ON public.stock_movements
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_level_on_movement();

-- Add trigger to automatically create stock level records when materials are created
CREATE OR REPLACE FUNCTION public.create_initial_stock_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Create initial stock level record for new material
  INSERT INTO public.stock_levels (
    material_id,
    current_quantity,
    reserved_quantity,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    0,
    0,
    'Нет в наличии'::public.stock_status,
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run when new materials are created
DROP TRIGGER IF EXISTS trg_create_initial_stock_level ON public.materials;
CREATE TRIGGER trg_create_initial_stock_level
AFTER INSERT ON public.materials
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_stock_level();