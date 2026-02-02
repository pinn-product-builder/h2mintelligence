-- Insert the 6 strategic sectors for H2M
INSERT INTO sectors (name, description, color, is_active) VALUES 
('Comercial', 'Setor responsável por vendas e novos negócios', '#10B981', true),
('Marketing', 'Setor de marketing e comunicação', '#8B5CF6', true),
('Customer Success', 'Setor de sucesso do cliente', '#3B82F6', true),
('Produção', 'Setor de produção e operações', '#F59E0B', true),
('RH', 'Setor de Recursos Humanos', '#EC4899', true),
('Financeiro', 'Setor financeiro e controladoria', '#6366F1', true)
ON CONFLICT DO NOTHING;