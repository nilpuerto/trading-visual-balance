
import React from 'react';
import { useTrading } from '@/context/TradingContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Loader2, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TradingHeader: React.FC = () => {
  const { totalBalance, isLoading } = useTrading();
  const { theme, toggleTheme } = useTheme();
  const isDevMode = !import.meta.env.VITE_SUPABASE_URL;
  
  const formattedBalance = new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(totalBalance);

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between shadow-sm animate-fade-in">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Seguiment de Trading</h1>
          {isDevMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Mode local: No s'està connectant a Supabase</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Saldo Total:</span>
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Carregant...</span>
            </div>
          ) : (
            <span 
              className={`font-semibold text-xl ${
                totalBalance > 0 ? 'text-profit' : totalBalance < 0 ? 'text-loss' : ''
              }`}
            >
              {formattedBalance}
            </span>
          )}
        </div>
      </div>
      
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="ml-auto">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">
          {theme === 'dark' ? 'Mode dia' : 'Mode nit'}
        </span>
      </Button>
    </header>
  );
};

export default TradingHeader;
