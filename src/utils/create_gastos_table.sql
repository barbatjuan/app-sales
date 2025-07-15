-- Crear tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concepto TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  categoria TEXT NOT NULL,
  notas TEXT,
  comprobante TEXT,
  recurrente BOOLEAN NOT NULL DEFAULT FALSE,
  frecuencia TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
CREATE INDEX IF NOT EXISTS idx_gastos_estado ON gastos(estado);
