-- Check the current create_stock_movement function
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'create_stock_movement' 
AND routine_schema = 'public';