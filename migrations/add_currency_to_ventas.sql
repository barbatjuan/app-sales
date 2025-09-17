-- Agregar campo currency a la tabla ventas
ALTER TABLE public.ventas 
ADD COLUMN currency VARCHAR(10) DEFAULT 'EUR';

-- Actualizar ventas existentes con la moneda predeterminada del sistema
UPDATE public.ventas 
SET currency = 'UYU' 
WHERE currency = 'EUR';

-- Hacer que el campo currency sea NOT NULL después de actualizar los datos existentes
ALTER TABLE public.ventas 
ALTER COLUMN currency SET NOT NULL;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.ventas.currency IS 'Moneda utilizada en la venta (USD, EUR, UYU, etc.)';
