
-- Fix Security Definer Views - set to SECURITY INVOKER
ALTER VIEW public.vw_financeiro_resumo SET (security_invoker = on);
ALTER VIEW public.vw_operacional_resumo SET (security_invoker = on);
ALTER VIEW public.vw_marketing_resumo SET (security_invoker = on);
