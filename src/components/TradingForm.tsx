
import React, { useState, useEffect } from 'react';
import { useTrading } from '@/context/TradingContext';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle, Trash, Loader2 } from 'lucide-react';

interface TradingFormProps {
  selectedDate: Date;
}

const TradingForm: React.FC<TradingFormProps> = ({ selectedDate }) => {
  const { getEntriesForDate, addEntry, deleteEntry } = useTrading();
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [amountType, setAmountType] = useState<'profit' | 'loss'>('profit');
  const [existingEntry, setExistingEntry] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const displayDate = format(selectedDate, 'EEEE d MMMM yyyy', { locale: ca });

  useEffect(() => {
    const entries = getEntriesForDate(formattedDate);
    if (entries.length > 0) {
      const entry = entries[0]; // Get the first entry for this date
      setExistingEntry(entry);
      setAmountType(entry.amount >= 0 ? 'profit' : 'loss');
      setAmount(String(Math.abs(entry.amount)));
      setNotes(entry.notes || '');
    } else {
      setExistingEntry(null);
      setAmount('');
      setNotes('');
      setAmountType('profit');
    }
  }, [selectedDate, formattedDate, getEntriesForDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) return;
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;
    
    const finalAmount = amountType === 'profit' ? numericAmount : -numericAmount;
    
    try {
      setIsSubmitting(true);
      await addEntry(formattedDate, finalAmount, notes || undefined);
      
      // Clear form if it was a new entry
      if (!existingEntry) {
        setAmount('');
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntry) return;
    
    try {
      setIsSubmitting(true);
      await deleteEntry(existingEntry.id);
      setExistingEntry(null);
      setAmount('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-medium capitalize">
          {displayDate}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount-type">Tipus de Registre</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={amountType === 'profit' ? 'default' : 'outline'}
                className={`flex-1 ${amountType === 'profit' ? 'bg-profit hover:bg-profit/90' : ''}`}
                onClick={() => setAmountType('profit')}
                disabled={isSubmitting}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Guany
              </Button>
              <Button
                type="button"
                variant={amountType === 'loss' ? 'default' : 'outline'}
                className={`flex-1 ${amountType === 'loss' ? 'bg-loss hover:bg-loss/90' : ''}`}
                onClick={() => setAmountType('loss')}
                disabled={isSubmitting}
              >
                <MinusCircle className="mr-2 h-4 w-4" />
                Pèrdua
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Quantitat (€)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-6"
                required
                disabled={isSubmitting}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Anota detalls sobre aquest trade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {existingEntry && (
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
              Eliminar
            </Button>
          )}
          <Button 
            type="submit" 
            className="ml-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {existingEntry ? 'Actualitzar' : 'Registrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TradingForm;
