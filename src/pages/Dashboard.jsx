import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabaseClient';
import TradesHistory from '@/components/trading/TradesHistory';

const Dashboard = () => {
  const { user } = useAuth();
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState({ balance: 0, demo_balance: 0 });
  const [referrals, setReferrals] = useState([]);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Cargar perfil del usuario
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      const { data: balanceData } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceData) setBalance(balanceData);

      const { data: referralsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', user.id);

      setReferrals(referralsData || []);

      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      setTrades(tradesData || []);
    };

    fetchData();
  }, [user]);

  // Simulación de precios
  useEffect(() => {
    const fakePrices = {
      BTC: { price: 29100.55, change: 2.34 },
      ETH: { price: 1822.14, change: -1.12 },
      USDT: { price: 1.0001, change: 0.01 }
    };
    setCryptoPrices(fakePrices);
  }, []);

  const stats = [
    {
      title: 'Saldo Total',
      value: `$${balance.balance.toFixed(2)}`,
      icon: Wallet,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Saldo Demo',
      value: `$${balance.demo_balance.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Operaciones',
      value: `${trades.length}`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Referidos',
      value: `${referrals.length}`,
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Bienvenido de vuelta, {profile?.name || 'Usuario'}!
          </h1>
          <p className="text-slate-300">
            ID: <span className="text-white">{user?.id}</span><br />
            Te refirió: {profile?.referred_by || 'Nadie'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="crypto-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-400" />
                Precios en Tiempo Real
              </CardTitle>
              <CardDescription className="text-slate-300">
                Precios actuales de criptomonedas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(cryptoPrices).map(([crypto, data]) => (
                  <div key={crypto} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">{crypto}</span>
                      </div>
                      <span className="text-white font-medium">{crypto}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${data.price.toFixed(crypto === 'USDT' ? 4 : 2)}
                      </div>
                      <div className={`text-sm flex items-center ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(data.change).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}>
          <TradesHistory
            trades={trades}
            cryptoPrices={cryptoPrices}
            closeTrade={() => {}}
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
