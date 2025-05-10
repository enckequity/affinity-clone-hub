
-- Create table for import errors
CREATE TABLE IF NOT EXISTS public.import_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  sync_id UUID NOT NULL REFERENCES public.communication_sync_logs(id),
  errors JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own import errors
CREATE POLICY "Users can view their own import errors" 
  ON public.import_errors 
  FOR SELECT 
  USING (auth.uid() = user_id);
  
-- Create policy that allows users to insert their own import errors
CREATE POLICY "Users can create their own import errors" 
  ON public.import_errors 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
