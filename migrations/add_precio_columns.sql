-- Migración para agregar columnas de precios diferenciados a la tabla productos
-- Ejecutar en Supabase SQL Editor

-- Agregar las nuevas columnas de precios
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS precio_unidad DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS precio_media_docena DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS precio_docena DECIMAL(10,2);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN productos.precio_unidad IS 'Precio específico por unidad individual';
COMMENT ON COLUMN productos.precio_media_docena IS 'Precio específico por media docena (6 unidades)';
COMMENT ON COLUMN productos.precio_docena IS 'Precio específico por docena (12 unidades)';

-- Opcional: Inicializar las nuevas columnas con valores basados en el precio base
-- Esto es para productos existentes que no tengan estos precios definidos
UPDATE productos 
SET 
  precio_unidad = precio,
  precio_media_docena = precio * 6,
  precio_docena = precio * 12
WHERE precio_unidad IS NULL 
  AND precio_media_docena IS NULL 
  AND precio_docena IS NULL;
