-- Script de rollback para eliminar las columnas de precios diferenciados
-- USAR SOLO EN CASO DE EMERGENCIA - Esto eliminará datos

-- Eliminar las columnas agregadas
ALTER TABLE productos 
DROP COLUMN IF EXISTS precio_unidad,
DROP COLUMN IF EXISTS precio_media_docena,
DROP COLUMN IF EXISTS precio_docena;
