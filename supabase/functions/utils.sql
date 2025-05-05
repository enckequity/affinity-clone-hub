
-- Create a function to increment the total_runs counter for a workflow
CREATE OR REPLACE FUNCTION public.increment_total_runs(row_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_total INTEGER;
BEGIN
  -- Get the current total_runs value
  SELECT total_runs INTO current_total
  FROM public.workflows
  WHERE id = row_id;
  
  -- Return the incremented value
  RETURN COALESCE(current_total, 0) + 1;
END;
$$;
