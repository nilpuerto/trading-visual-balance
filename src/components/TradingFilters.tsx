
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { Filter, ArrowDown, ArrowUp, CalendarIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';

interface TradingFiltersProps {
  onFilterChange: (filters: {
    dateRange: DateRange | undefined;
    resultType: 'all' | 'profit' | 'loss';
  }) => void;
}

const TradingFilters: React.FC<TradingFiltersProps> = ({ onFilterChange }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [resultType, setResultType] = useState<'all' | 'profit' | 'loss'>('all');
  const [isOpen, setIsOpen] = useState(false);
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    onFilterChange({
      dateRange: range,
      resultType
    });
  };
  
  const handleResultTypeChange = (type: 'all' | 'profit' | 'loss') => {
    setResultType(type);
    onFilterChange({
      dateRange,
      resultType: type
    });
  };
  
  const clearFilters = () => {
    setDateRange(undefined);
    setResultType('all');
    onFilterChange({
      dateRange: undefined,
      resultType: 'all'
    });
  };
  
  const hasActiveFilters = Boolean(dateRange?.from || dateRange?.to || resultType !== 'all');
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={hasActiveFilters ? "bg-accent text-accent-foreground" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {(dateRange?.from || dateRange?.to ? 1 : 0) + (resultType !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Rang de dates</h4>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                locale={ca}
                className="border rounded-md p-2"
              />
              {(dateRange?.from || dateRange?.to) && (
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span>
                    {dateRange?.from ? format(dateRange.from, 'PP', { locale: ca }) : '∞'} - 
                    {dateRange?.to ? format(dateRange.to, 'PP', { locale: ca }) : '∞'}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDateRangeChange(undefined)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Tipus de resultat</h4>
              <div className="flex space-x-2">
                <Button 
                  variant={resultType === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleResultTypeChange('all')}
                >
                  Tots
                </Button>
                <Button 
                  variant={resultType === 'profit' ? "default" : "outline"}
                  size="sm"
                  className={resultType === 'profit' ? "bg-profit hover:bg-profit/90" : ""}
                  onClick={() => handleResultTypeChange('profit')}
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Guanys
                </Button>
                <Button 
                  variant={resultType === 'loss' ? "default" : "outline"}
                  size="sm"
                  className={resultType === 'loss' ? "bg-loss hover:bg-loss/90" : ""}
                  onClick={() => handleResultTypeChange('loss')}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Pèrdues
                </Button>
              </div>
            </div>
            
            {hasActiveFilters && (
              <>
                <Separator />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Esborrar tots els filtres
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TradingFilters;
