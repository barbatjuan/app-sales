
import React, { useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Cliente } from "@/types";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ClienteSearchProps {
  clientes: Cliente[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

export function ClienteSearch({ clientes, value, onChange, error }: ClienteSearchProps) {
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteResults, setShowClienteResults] = useState(false);
  const [filteredClientesList, setFilteredClientesList] = useState<Cliente[]>([]);
  const clienteSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clienteSearch) {
      const filtered = clientes.filter(
        (cliente) => cliente.nombre.toLowerCase().includes(clienteSearch.toLowerCase())
      );
      setFilteredClientesList(filtered);
      setShowClienteResults(true);
    } else {
      setFilteredClientesList([]);
      setShowClienteResults(false);
    }
  }, [clienteSearch, clientes]);

  useEffect(() => {
    // Set the display name based on selected client
    if (value) {
      const selectedCliente = clientes.find(c => c.id === value);
      if (selectedCliente) {
        setClienteSearch(selectedCliente.nombre);
      }
    }
  }, [value, clientes]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clienteSearchRef.current && !clienteSearchRef.current.contains(event.target as Node)) {
        setShowClienteResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCliente = (cliente: Cliente) => {
    onChange(cliente.id);
    setClienteSearch(cliente.nombre);
    setShowClienteResults(false);
  };

  return (
    <FormItem>
      <FormLabel>Cliente</FormLabel>
      <div className="relative" ref={clienteSearchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#55F9E3]" />
          <input
            className="pl-9 h-12 w-full rounded-lg border border-[#55F9E3] bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55F9E3] focus-visible:ring-offset-2 transition-all shadow-sm placeholder:text-muted-foreground"
            placeholder="Buscar cliente..."
            value={clienteSearch}
            onChange={(e) => setClienteSearch(e.target.value)}
            onFocus={() => {
              setFilteredClientesList(clientes);
              setShowClienteResults(true);
            }}
            onClick={() => {
              setFilteredClientesList(clientes);
              setShowClienteResults(true);
            }}
            autoComplete="off"
          />
          {clienteSearch && (
            <button
              type="button"
              className="absolute right-3 top-3 text-muted-foreground hover:text-[#55F9E3] transition-colors"
              onClick={() => {
                setClienteSearch("");
                onChange("");
              }}
              tabIndex={-1}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {showClienteResults && (
          <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-[#55F9E3] bg-background p-1 shadow-2xl animate-fade-in">
            {filteredClientesList.length > 0 ? (
              filteredClientesList.map((cliente) => (
                <div
                  key={cliente.id}
                  className="cursor-pointer rounded-md px-3 py-2 text-base hover:bg-[#55F9E3]/10 hover:text-[#55F9E3] transition-colors"
                  onClick={() => handleSelectCliente(cliente)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelectCliente(cliente); }}
                >
                  {cliente.nombre}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center select-none">
                No se encontraron clientes
              </div>
            )}
          </div>
        )}
        <input type="hidden" value={value} />
      </div>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}
