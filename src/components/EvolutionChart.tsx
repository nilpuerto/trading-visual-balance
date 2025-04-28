
import React, { useMemo } from 'react';
import { useTrading } from '@/context/TradingContext';
import { format, parse, isValid, subMonths } from 'date-fns';
import { ca } from 'date-fns/locale';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface ChartData {
  date: string;
  balance: number;
}

const EvolutionChart: React.FC = () => {
  const { entries, totalBalance } = useTrading();

  const chartData = useMemo(() => {
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Initialize with starting balance
    let currentBalance = totalBalance - sortedEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    // Generate data points for the chart
    const data: ChartData[] = [];
    
    // Add an initial point
    const startDate = sortedEntries.length > 0 
      ? new Date(sortedEntries[0].date)
      : new Date();
    
    const threeMonthsAgo = subMonths(new Date(), 3);
    const firstDate = startDate < threeMonthsAgo ? startDate : threeMonthsAgo;
    
    data.push({
      date: format(firstDate, 'yyyy-MM-dd'),
      balance: currentBalance
    });
    
    // Add points for each trade
    sortedEntries.forEach(entry => {
      currentBalance += entry.amount;
      data.push({
        date: entry.date,
        balance: currentBalance
      });
    });
    
    // Add today's balance if it's not already in the data
    const today = format(new Date(), 'yyyy-MM-dd');
    if (data[data.length - 1]?.date !== today) {
      data.push({
        date: today,
        balance: totalBalance
      });
    }
    
    return data;
  }, [entries, totalBalance]);

  const formatDate = (dateString: string) => {
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    return isValid(date) ? format(date, 'd MMM', { locale: ca }) : dateString;
  };

  return (
    <div className="h-[300px] w-full p-4 rounded-lg border bg-card">
      <h3 className="font-medium mb-4">Evolució del Balanç</h3>
      <ChartContainer 
        config={{
          balance: {
            label: "Balanç",
            theme: {
              light: "#1e40af", // Blau fosc per a tema clar
              dark: "#60a5fa", // Blau més clar per a tema fosc
            },
          }
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              minTickGap={30}
            />
            <YAxis />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border-border shadow-md p-2 rounded">
                      <p className="text-sm">Data: {formatDate(data.date)}</p>
                      <p className="text-sm font-medium">
                        Balanç: {new Intl.NumberFormat('ca-ES', { 
                          style: 'currency', 
                          currency: 'EUR' 
                        }).format(data.balance)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="currentColor"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="balance"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default EvolutionChart;
