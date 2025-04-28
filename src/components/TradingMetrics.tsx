import React, { useMemo, useState } from 'react';
import { useTrading } from '@/context/TradingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, subMonths, subYears, startOfDay, isAfter } from 'date-fns';

type Period = 'all' | 'day' | 'week' | 'month' | 'year';

const TradingMetrics: React.FC = () => {
  const { entries, totalBalance } = useTrading();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');

  const periodLabel = useMemo(() => {
    switch (selectedPeriod) {
      case 'day':
        return 'Últim dia';
      case 'week':
        return 'Aquesta setmana';
      case 'month':
        return 'Aquest mes';
      case 'year':
        return 'Aquest any';
      default:
        return 'Tot el temps';
    }
  }, [selectedPeriod]);

  const metrics = useMemo(() => {
    const now = new Date();
    const filterDate = (date: string) => {
      const entryDate = new Date(date);
      switch (selectedPeriod) {
        case 'day':
          return isAfter(entryDate, subDays(now, 1));
        case 'week':
          return isAfter(entryDate, subDays(now, 7));
        case 'month':
          return isAfter(entryDate, subMonths(now, 1));
        case 'year':
          return isAfter(entryDate, subYears(now, 1));
        default:
          return true;
      }
    };

    const filteredEntries = entries.filter(entry => filterDate(entry.date));

    const profitTrades = filteredEntries.filter(entry => entry.amount > 0);
    const lossTrades = filteredEntries.filter(entry => entry.amount < 0);

    const totalProfitAmount = profitTrades.reduce((sum, entry) => sum + entry.amount, 0);
    const totalLossAmount = Math.abs(lossTrades.reduce((sum, entry) => sum + entry.amount, 0));
    const totalAmount = totalProfitAmount + totalLossAmount;

    const profitPercentage = totalAmount > 0 ? (totalProfitAmount / totalAmount) * 100 : 0;

    const avgProfit = profitTrades.length > 0 ? totalProfitAmount / profitTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? totalLossAmount / lossTrades.length : 0;
    const riskRewardRatio = Math.abs(avgLoss) > 0 ? avgProfit / Math.abs(avgLoss) : 0;

    const initialBalance = totalBalance - entries.reduce((sum, entry) => sum + entry.amount, 0);
    const globalProfitPercentage = ((totalBalance - initialBalance) / Math.abs(initialBalance)) * 100;

    const totalProfit = entries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalTrades: filteredEntries.length,
      profitTrades: profitTrades.length,
      lossTrades: lossTrades.length,
      profitPercentage,
      avgProfit,
      avgLoss,
      riskRewardRatio,
      globalProfitPercentage,
      totalProfit,
      totalProfitAmount,
      totalLossAmount
    };
  }, [entries, totalBalance, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number) => {
    return value.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Mètriques de Rendiment - {periodLabel}</h3>
        <Select value={selectedPeriod} onValueChange={(value: Period) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecciona període" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tot el temps</SelectItem>
            <SelectItem value="day">Últim dia</SelectItem>
            <SelectItem value="week">Aquesta setmana</SelectItem>
            <SelectItem value="month">Aquest mes</SelectItem>
            <SelectItem value="year">Aquest any</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              % Guanys vs Pèrdues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(metrics.profitPercentage)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Basat en quantitat monetària
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              % Global de Guany
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.globalProfitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPercent(metrics.globalProfitPercentage)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Rendiment total de la cartera
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Guanys Totals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(metrics.totalProfit)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Des de l'inici
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ràtio Risc/Recompensa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRatio(metrics.riskRewardRatio)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Guany mitjà / Pèrdua mitjana
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Guanys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-profit">
              {formatCurrency(metrics.totalProfitAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Suma total de guanys
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pèrdues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-loss">
              {formatCurrency(metrics.totalLossAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Suma total de pèrdues
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingMetrics;
