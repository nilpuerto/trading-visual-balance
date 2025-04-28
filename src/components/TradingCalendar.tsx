import React from 'react';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { useTrading } from '@/context/TradingContext';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TradingCalendarProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
  className?: string;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({ 
  onSelectDate, 
  selectedDate, 
  className 
}) => {
  const { entries } = useTrading();
  const today = new Date();
  
  const modifyDay = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter(entry => entry.date === formattedDate);
    
    if (dayEntries.length === 0) {
      return undefined;
    }
    
    const totalForDay = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
    if (totalForDay > 0) {
      return 'calendar-day-profit';
    } else if (totalForDay < 0) {
      return 'calendar-day-loss';
    }
    return undefined;
  };

  return (
    <div className={cn("rounded-lg border shadow-sm p-2 bg-card w-full h-full flex", className)}>
      <CalendarUI
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        locale={ca}
        className="w-full"
        modifiers={{
          today: today,
          selected: selectedDate,
        }}
        modifiersClassNames={{
          today: 'calendar-day-current',
          selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
        }}
        components={{
          DayContent: (props) => {
            const customClass = modifyDay(props.date);
            return (
              <div className={`w-full h-full flex items-center justify-center ${customClass}`}>
                {props.date.getDate()}
              </div>
            );
          }
        }}
      />
    </div>
  );
};

export default TradingCalendar;
