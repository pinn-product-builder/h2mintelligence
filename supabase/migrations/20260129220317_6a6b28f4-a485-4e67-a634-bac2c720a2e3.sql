-- Create table for imported data metrics
CREATE TABLE public.imported_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_file TEXT NOT NULL,
  target_table TEXT NOT NULL,
  data JSONB NOT NULL,
  imported_by UUID REFERENCES auth.users(id),
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_rows INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for import logs (permanent storage)
CREATE TABLE public.import_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_file TEXT NOT NULL,
  import_type TEXT NOT NULL DEFAULT 'csv',
  target_table TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  imported_by UUID REFERENCES auth.users(id),
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  mappings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.imported_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for imported_metrics
CREATE POLICY "Admins and gestors can insert imported_metrics"
ON public.imported_metrics
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Anyone can view imported_metrics"
ON public.imported_metrics
FOR SELECT
USING (true);

CREATE POLICY "Admins can delete imported_metrics"
ON public.imported_metrics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for import_logs
CREATE POLICY "Admins and gestors can insert import_logs"
ON public.import_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins and gestors can view import_logs"
ON public.import_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Admins and gestors can update import_logs"
ON public.import_logs
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestor'::app_role));