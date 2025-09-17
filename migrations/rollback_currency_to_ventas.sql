-- Rollback: Eliminar campo currency de la tabla ventas
ALTER TABLE public.ventas 
DROP COLUMN IF EXISTS currency;
