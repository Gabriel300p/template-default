SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM 
  information_schema.triggers
WHERE 
  trigger_schema = 'public'
  AND event_object_table IN ('users');
