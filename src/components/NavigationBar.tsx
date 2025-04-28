import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const NavigationBar: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <nav className="sticky top-0 w-full z-50 backdrop-blur-md bg-background/75 border-b transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center py-3 px-4">
        <div className="flex items-center">
          <span className="font-semibold text-lg">TradingNil</span>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;