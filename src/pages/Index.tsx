
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { TradingProvider } from '@/context/TradingContext';
import TradingHeader from '@/components/TradingHeader';
import TradingCalendar from '@/components/TradingCalendar';
import TradingForm from '@/components/TradingForm';
import TradingMetrics from '@/components/TradingMetrics';
import NavigationBar from '@/components/NavigationBar';
import EvolutionChart from '@/components/EvolutionChart';
import TradingFilters from '@/components/TradingFilters';
import { useTrading } from '@/context/TradingContext';
import { Loader2, ArrowDown, ArrowUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRange } from 'react-day-picker';

// Component to show loading indicator
const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Sincronizando datos...</span>
  </div>
);

// Inner component that uses the context
const TradingApp = () => {
  const { isLoading, entries } = useTrading();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("calendar");
  const [filters, setFilters] = useState({
    dateRange: undefined as DateRange | undefined,
    resultType: 'all' as 'all' | 'profit' | 'loss'
  });
  
  const filteredEntries = entries.filter(entry => {
    // Apply date filter if set
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const entryDate = new Date(entry.date);
      if (filters.dateRange.from && entryDate < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to) {
        const endDate = new Date(filters.dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        if (entryDate > endDate) {
          return false;
        }
      }
    }
    
    // Apply result type filter if not 'all'
    if (filters.resultType === 'profit' && entry.amount <= 0) {
      return false;
    }
    if (filters.resultType === 'loss' && entry.amount >= 0) {
      return false;
    }
    
    return true;
  });

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <NavigationBar />
      <TradingHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <TradingFilters onFilterChange={setFilters} />
        
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Calendari</TabsTrigger>
              <TabsTrigger value="chart">Gràfics</TabsTrigger>
              <TabsTrigger value="metrics">Mètriques</TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="mt-4">
              <div className="flex flex-col space-y-6">
                <TradingCalendar 
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
                <TradingForm selectedDate={selectedDate} />
              </div>
            </TabsContent>
            <TabsContent value="chart" className="mt-4">
              <EvolutionChart />
            </TabsContent>
            <TabsContent value="metrics" className="mt-4">
              <TradingMetrics />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-6">
              <TradingCalendar 
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              <TradingForm selectedDate={selectedDate} />
            </div>
            <div className="flex flex-col space-y-6">
              <EvolutionChart />
              <TradingMetrics />
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Historial de Trades {filters.resultType !== 'all' && `(${filters.resultType === 'profit' ? 'Guanys' : 'Pèrdues'})`}</h3>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No hi ha trades que coincideixin amb els filtres seleccionats.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className={`p-4 rounded-lg border flex items-center justify-between ${
                    entry.amount > 0 ? 'bg-profit/10 border-profit/20' : 'bg-loss/10 border-loss/20'
                  }`}
                >
                  <div>
                    <div className="font-medium">{entry.date}</div>
                    {entry.notes && <div className="text-sm text-muted-foreground">{entry.notes}</div>}
                  </div>
                  <div className={`font-semibold ${entry.amount > 0 ? 'text-profit' : 'text-loss'} flex items-center`}>
                    {entry.amount > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    {new Intl.NumberFormat('ca-ES', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    }).format(entry.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Main component with providers
const Index = () => {
  return (
    <ThemeProvider>
      <TradingProvider>
        <TradingApp />
      </TradingProvider>
    </ThemeProvider>
  );
};

export default Index;
