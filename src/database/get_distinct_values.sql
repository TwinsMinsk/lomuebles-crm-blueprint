
CREATE OR REPLACE FUNCTION public.get_distinct_values(table_name text, column_name text)
RETURNS TABLE(value text) 
LANGUAGE plpgsql
AS $$
DECLARE
  query text;
BEGIN
  query := format('SELECT DISTINCT %I as value FROM public.%I WHERE %I IS NOT NULL ORDER BY %I', 
                 column_name, table_name, column_name, column_name);
  RETURN QUERY EXECUTE query;
END;
$$;

COMMENT ON FUNCTION public.get_distinct_values IS 
  'Returns all distinct values from a specified column in a table. Used for populating dropdown filters.';
