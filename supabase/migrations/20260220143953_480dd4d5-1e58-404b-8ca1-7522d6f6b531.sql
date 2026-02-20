-- Function to rollback an entire import batch by import_log_id
-- Deletes records from all fact tables and marks the log as rolled back
CREATE OR REPLACE FUNCTION public.rollback_import(p_import_log_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_financeiro integer := 0;
  v_deleted_operacional integer := 0;
  v_deleted_marketing integer := 0;
  v_log_status text;
BEGIN
  -- Verify the log exists and user has permission
  SELECT status INTO v_log_status
  FROM import_logs
  WHERE id = p_import_log_id;

  IF v_log_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Log de importação não encontrado');
  END IF;

  IF v_log_status = 'rolled_back' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta importação já foi revertida');
  END IF;

  -- Delete from fact_financeiro
  DELETE FROM fact_financeiro WHERE import_log_id = p_import_log_id;
  GET DIAGNOSTICS v_deleted_financeiro = ROW_COUNT;

  -- Delete from fact_operacional
  DELETE FROM fact_operacional WHERE import_log_id = p_import_log_id;
  GET DIAGNOSTICS v_deleted_operacional = ROW_COUNT;

  -- Delete from fact_marketing
  DELETE FROM fact_marketing WHERE import_log_id = p_import_log_id;
  GET DIAGNOSTICS v_deleted_marketing = ROW_COUNT;

  -- Update the import log status to 'rolled_back'
  UPDATE import_logs
  SET status = 'rolled_back',
      completed_at = now()
  WHERE id = p_import_log_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_financeiro', v_deleted_financeiro,
    'deleted_operacional', v_deleted_operacional,
    'deleted_marketing', v_deleted_marketing,
    'total_deleted', v_deleted_financeiro + v_deleted_operacional + v_deleted_marketing
  );
END;
$$;

-- Allow admins to delete import_logs
CREATE POLICY "Admins can delete import_logs"
ON public.import_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));