
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TradeEntry, DayWithTrade } from '@/lib/types';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

// Inicializar el cliente de Supabase con comprobación de variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback implementation that doesn't crash
let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // For development or fallback when Supabase env variables are not set
  // Provide mock implementations of Supabase methods
  console.warn("Supabase credentials missing - using local storage fallback mode");
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          then: (callback) => Promise.resolve(callback({
            data: JSON.parse(localStorage.getItem('tradingEntries') || '[]'),
            error: null
          }))
        }),
        single: () => ({
          then: (callback) => Promise.resolve(callback({
            data: { amount: parseFloat(localStorage.getItem('totalBalance') || '373.94') },
            error: null
          }))
        })
      }),
      insert: (data) => ({
        then: (callback) => {
          const entries = JSON.parse(localStorage.getItem('tradingEntries') || '[]');
          entries.push(data);
          localStorage.setItem('tradingEntries', JSON.stringify(entries));
          return Promise.resolve(callback({ data, error: null }));
        }
      }),
      update: (data) => ({
        eq: () => ({
          then: (callback) => {
            const entries = JSON.parse(localStorage.getItem('tradingEntries') || '[]');
            const index = entries.findIndex(entry => entry.id === data.id);
            if (index !== -1) {
              entries[index] = { ...entries[index], ...data };
              localStorage.setItem('tradingEntries', JSON.stringify(entries));
            }
            return Promise.resolve(callback({ data, error: null }));
          }
        })
      }),
      delete: () => ({
        eq: (field, value) => ({
          then: (callback) => {
            const entries = JSON.parse(localStorage.getItem('tradingEntries') || '[]');
            const filteredEntries = entries.filter(entry => entry.id !== value);
            localStorage.setItem('tradingEntries', JSON.stringify(filteredEntries));
            return Promise.resolve(callback({ data: null, error: null }));
          }
        })
      }),
      upsert: (data) => ({
        then: (callback) => {
          localStorage.setItem('totalBalance', data.amount.toString());
          return Promise.resolve(callback({ data, error: null }));
        }
      })
    })
  };
}

interface TradingContextProps {
  entries: TradeEntry[];
  totalBalance: number;
  isLoading: boolean;
  addEntry: (date: string, amount: number, notes?: string) => Promise<void>;
  updateEntry: (id: string, amount: number, notes?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesForDate: (date: string) => TradeEntry[];
  getDaysWithTrades: (year: number, month: number) => DayWithTrade[];
}

const TradingContext = createContext<TradingContextProps | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Cargar los datos iniciales desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Obtener las entradas de la base de datos
        const { data: tradesData, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .order('date', { ascending: false });
        
        if (tradesError) throw tradesError;
        
        // Obtener el saldo total de la base de datos
        const { data: balanceData, error: balanceError } = await supabase
          .from('balance')
          .select('*')
          .single();
          
        if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;
        
        // Transformar los datos de la API a nuestro formato
        const formattedTrades: TradeEntry[] = tradesData.map((trade: any) => ({
          id: trade.id,
          date: trade.date,
          amount: trade.amount,
          notes: trade.notes
        }));
        
        setEntries(formattedTrades);
        setTotalBalance(balanceData?.amount || 373.94); // Valor inicial si no hay balance
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('No se pudieron cargar los datos');
        // Cargar datos locales como fallback
        const savedEntries = localStorage.getItem('tradingEntries');
        const savedBalance = localStorage.getItem('totalBalance');
        if (savedEntries) setEntries(JSON.parse(savedEntries));
        if (savedBalance) setTotalBalance(parseFloat(savedBalance));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Guardar datos localmente como respaldo
  useEffect(() => {
    localStorage.setItem('tradingEntries', JSON.stringify(entries));
    localStorage.setItem('totalBalance', totalBalance.toString());
  }, [entries, totalBalance]);
  
  // Añadir una nueva entrada
  const addEntry = async (date: string, amount: number, notes?: string) => {
    try {
      // Verificar si ya existe una entrada para esta fecha
      const existingEntryIndex = entries.findIndex(entry => entry.date === date);
      
      if (existingEntryIndex >= 0) {
        // Actualizar entrada existente
        const existingEntry = entries[existingEntryIndex];
        await updateEntry(existingEntry.id, amount, notes);
        return;
      }
      
      // Generar un nuevo ID único
      const newId = crypto.randomUUID();
      
      // Crear la nueva entrada en Supabase
      const { error } = await supabase
        .from('trades')
        .insert({
          id: newId,
          date,
          amount,
          notes
        });
      
      if (error) throw error;
      
      // Actualizar el balance en Supabase
      const newBalance = totalBalance + amount;
      const { error: balanceError } = await supabase
        .from('balance')
        .upsert({ id: 1, amount: newBalance });
      
      if (balanceError) throw balanceError;
      
      // Actualizar el estado local
      const newEntry: TradeEntry = {
        id: newId,
        date,
        amount,
        notes
      };
      
      setEntries(prev => [...prev, newEntry]);
      setTotalBalance(newBalance);
      toast.success("Trade añadido correctamente");
    } catch (error) {
      console.error('Error al añadir trade:', error);
      toast.error('No se pudo añadir el trade');
    }
  };
  
  // Actualizar una entrada existente
  const updateEntry = async (id: string, amount: number, notes?: string) => {
    try {
      const entryIndex = entries.findIndex(entry => entry.id === id);
      if (entryIndex < 0) return;
      
      const oldAmount = entries[entryIndex].amount;
      const newBalance = totalBalance - oldAmount + amount;
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('trades')
        .update({
          amount,
          notes
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar el balance en Supabase
      const { error: balanceError } = await supabase
        .from('balance')
        .upsert({ id: 1, amount: newBalance });
      
      if (balanceError) throw balanceError;
      
      // Actualizar estado local
      const updatedEntries = [...entries];
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        amount,
        notes: notes || updatedEntries[entryIndex].notes
      };
      
      setEntries(updatedEntries);
      setTotalBalance(newBalance);
      toast.success("Trade actualizado correctamente");
    } catch (error) {
      console.error('Error al actualizar trade:', error);
      toast.error('No se pudo actualizar el trade');
    }
  };
  
  // Eliminar una entrada
  const deleteEntry = async (id: string) => {
    try {
      const entry = entries.find(e => e.id === id);
      if (!entry) return;
      
      // Eliminar en Supabase
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar el balance en Supabase
      const newBalance = totalBalance - entry.amount;
      const { error: balanceError } = await supabase
        .from('balance')
        .upsert({ id: 1, amount: newBalance });
      
      if (balanceError) throw balanceError;
      
      // Actualizar estado local
      setEntries(entries.filter(e => e.id !== id));
      setTotalBalance(newBalance);
      toast.success("Trade eliminado correctamente");
    } catch (error) {
      console.error('Error al eliminar trade:', error);
      toast.error('No se pudo eliminar el trade');
    }
  };
  
  // Obtener entradas para una fecha específica
  const getEntriesForDate = (date: string) => {
    return entries.filter(entry => entry.date === date);
  };
  
  // Obtener días con trades para un mes específico
  const getDaysWithTrades = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: DayWithTrade[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = getEntriesForDate(date);
      const totalAmount = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      result.push({
        date,
        amount: totalAmount,
        hasEntry: dayEntries.length > 0
      });
    }
    
    return result;
  };
  
  return (
    <TradingContext.Provider value={{
      entries,
      totalBalance,
      isLoading,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntriesForDate,
      getDaysWithTrades
    }}>
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = (): TradingContextProps => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
