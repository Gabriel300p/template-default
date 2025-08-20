-- Check for functions and triggers in the database
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_result(p.oid) as result_type,
  pg_get_function_arguments(p.oid) as arguments
FROM 
  pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE 
  n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND p.proname LIKE '%user%'
ORDER BY 
  schema_name, function_name;
