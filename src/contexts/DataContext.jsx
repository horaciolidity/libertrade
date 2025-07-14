import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: { price: 45000, change: 2.5, history: [] },
    ETH: { price: 3200, change: -1.2, history: [] },
    USDT: { price: 1.00, change: 0.1, history: [] },
    BNB: { price: 320, change: 3.8, history: [] },
    ADA: { price: 0.85, change: -2.1, history: [] }
  });

  const [investmentPlans] = useState([
    {
      id: 1,
      name: 'Plan Básico',
      minAmount: 100,
      maxAmount: 999,
      dailyReturn: 1.5,
      duration: 30,
      description: 'Perfecto para principiantes'
    },
    {
      id: 2,
      name: 'Plan Estándar',
      minAmount: 1000,
      maxAmount: 4999,
      dailyReturn: 2.0,
      duration: 30,
      description: 'Para inversores intermedios'
    },
    {
      id: 3,
      name: 'Plan Premium',
      minAmount: 5000,
      maxAmount: 19999,
      dailyReturn: 2.5,
      duration: 30,
      description: 'Para inversores avanzados'
    },
    {
      id: 4,
      name: 'Plan VIP',
      minAmount: 20000,
      maxAmount: 100000,
      dailyReturn: 3.0,
      duration: 30,
      description: 'Para grandes inversores'
    }
  ]);

  useEffect(() => {
    const initialHistoryLength = 60;
    const initialPrices = { ...cryptoPrices };
    Object.keys(initialPrices).forEach(crypto => {
      let currentPrice = initialPrices[crypto].price;
      const history = [];
      for (let i = 0; i < initialHistoryLength; i++) {
        const change = (Math.random() - 0.5) * 2;
        currentPrice = Math.max(0.01, currentPrice * (1 + change / 100));
        history.unshift({ time: Date.now() - (initialHistoryLength - i) * 2000, value: currentPrice });
      }
      initialPrices[crypto].history = history;
      initialPrices[crypto].price = currentPrice;
    });
    setCryptoPrices(initialPrices);

    const interval = setInterval(() => {
      setCryptoPrices(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(crypto => {
          const change = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(0.01, updated[crypto].price * (1 + change / 100));
          const newHistory = [...updated[crypto].history, { time: Date.now(), value: newPrice }].slice(-100);
          updated[crypto] = {
            price: newPrice,
            change: change,
            history: newHistory
          };
        });
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Obtener referidos reales desde Supabase
  const getReferrals = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('referred_by', userId);

    if (error) {
      console.error('Error al obtener referidos:', error.message);
      return [];
    }

    return data;
  };

  const value = {
    cryptoPrices,
    investmentPlans,
    getReferrals
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
