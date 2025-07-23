import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Quote, Sparkles, X } from 'lucide-react';
import { getRandomMotivationalQuote, MotivationalQuote } from '@/data/motivationalQuotes';

interface MotivationalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const MotivationalPopup: React.FC<MotivationalPopupProps> = ({ isOpen, onClose }) => {
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Obtener una frase aleatoria cuando se abre el popup
      const randomQuote = getRandomMotivationalQuote();
      setQuote(randomQuote);
    }
  }, [isOpen]);

  if (!quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-primary/10 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-primary mb-2">
            Inspiración del Día
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Frase motivacional */}
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/30 transform rotate-180" />
            <blockquote className="text-lg sm:text-xl font-medium text-foreground leading-relaxed text-center px-8 py-4">
              "{quote.quote}"
            </blockquote>
            <Quote className="absolute -bottom-2 -right-2 h-8 w-8 text-primary/30" />
          </div>
          
          {/* Autor */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">—</p>
            <p className="text-lg font-semibold text-primary mt-1">
              {quote.author}
            </p>
          </div>
          
          {/* Mensaje motivacional adicional */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              💪 ¡Que tengas un día productivo y lleno de éxito en tu negocio!
            </p>
          </div>
          
          {/* Botón de cierre */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={onClose}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-all duration-200 hover:scale-105"
            >
              ¡Empecemos! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MotivationalPopup;
