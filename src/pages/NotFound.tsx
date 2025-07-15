
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <h1 className="text-7xl font-bold text-primary pl-12 sm:pl-0">404</h1>
        <p className="text-xl text-foreground">Lo sentimos, no encontramos la página que buscas</p>
        <p className="text-muted-foreground">
          La página "{location.pathname}" no existe o ha sido movida a otra ubicación.
        </p>
        <Button asChild className="mt-4">
          <a href="/" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            <span>Volver al Dashboard</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
