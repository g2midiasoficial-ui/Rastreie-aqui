import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Account, 
  Transaction, 
  Category, 
  Debt, 
  Goal, 
  MarketItem, 
  Vehicle, 
  VehicleExpense,
  FinancialMode 
} from '../types/finance';
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Salário & Renda', type: 'income', icon: 'DollarSign', color: '#10B981', mode: 'personal' },
  { id: 'cat-2', name: 'Vendas & Serviços', type: 'income', icon: 'TrendingUp', color: '#3B82F6', mode: 'personal' },
  { id: 'cat-3', name: 'Investimentos', type: 'income', icon: 'PiggyBank', color: '#8B5CF6', mode: 'personal' },
  { id: 'cat-4', name: 'Alimentação & Mercado', type: 'expense', icon: 'ShoppingCart', color: '#EF4444', budgetLimit: 1200, mode: 'personal' },
  { id: 'cat-5', name: 'Moradia & Contas', type: 'expense', icon: 'Home', color: '#F59E0B', budgetLimit: 1800, mode: 'personal' },
  { id: 'cat-6', name: 'Transporte & Veículo', type: 'expense', icon: 'Car', color: '#6366F1', budgetLimit: 600, mode: 'personal' },
  { id: 'cat-7', name: 'Lazer & Delivery', type: 'expense', icon: 'Coffee', color: '#EC4899', budgetLimit: 400, mode: 'personal' },
  { id: 'cat-8', name: 'Saúde & Farmácia', type: 'expense', icon: 'HeartPulse', color: '#14B8A6', budgetLimit: 300, mode: 'personal' },
  { id: 'cat-9', name: 'Educação & Cursos', type: 'expense', icon: 'BookOpen', color: '#8B5CF6', budgetLimit: 250, mode: 'personal' },
  { id: 'cat-10', name: 'Vendas E-commerce', type: 'income', icon: 'Globe', color: '#10B981', mode: 'business' },
  { id: 'cat-11', name: 'Fornecedores & CMV', type: 'expense', icon: 'Package', color: '#EF4444', mode: 'business' },
  { id: 'cat-12', name: 'Tráfego Pago (Ads)', type: 'expense', icon: 'Target', color: '#F97316', mode: 'business' },
  { id: 'cat-13', name: 'Ferramentas & SaaS', type: 'expense', icon: 'Cpu', color: '#06B6D4', mode: 'business' },
];

export function useFinancialData(currentUser: any, mode: FinancialMode = 'personal') {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(`gerenciie_accounts_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`gerenciie_txs_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`gerenciie_cats_${mode}`);
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES.filter(c => c.mode === mode || c.mode === 'personal');
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(`gerenciie_debts_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(`gerenciie_goals_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem(`gerenciie_market_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`gerenciie_vehicles_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>(() => {
    const saved = localStorage.getItem(`gerenciie_veh_exp_${mode}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(`gerenciie_accounts_${mode}`, JSON.stringify(accounts));
  }, [accounts, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_txs_${mode}`, JSON.stringify(transactions));
  }, [transactions, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_cats_${mode}`, JSON.stringify(categories));
  }, [categories, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_debts_${mode}`, JSON.stringify(debts));
  }, [debts, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_goals_${mode}`, JSON.stringify(goals));
  }, [goals, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_market_${mode}`, JSON.stringify(marketItems));
  }, [marketItems, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_vehicles_${mode}`, JSON.stringify(vehicles));
  }, [vehicles, mode]);

  useEffect(() => {
    localStorage.setItem(`gerenciie_veh_exp_${mode}`, JSON.stringify(vehicleExpenses));
  }, [vehicleExpenses, mode]);

  // Firestore sync when currentUser is logged in
  useEffect(() => {
    if (!currentUser?.uid) return;

    try {
      const qAccounts = query(
        collection(db, 'accounts'),
        where('userId', '==', currentUser.uid)
      );
      const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
        const loaded: Account[] = [];
        snapshot.forEach((doc) => loaded.push({ id: doc.id, ...(doc.data() as any) }));
        if (loaded.length > 0) {
          setAccounts(loaded.filter(a => a.mode === mode));
        }
      }, (err) => console.warn('Firestore accounts sync:', err));

      const qTxs = query(
        collection(db, 'transactions'),
        where('userId', '==', currentUser.uid)
      );
      const unsubTxs = onSnapshot(qTxs, (snapshot) => {
        const loaded: Transaction[] = [];
        snapshot.forEach((doc) => loaded.push({ id: doc.id, ...(doc.data() as any) }));
        if (loaded.length > 0) {
          setTransactions(loaded.filter(t => t.mode === mode));
        }
      }, (err) => console.warn('Firestore transactions sync:', err));

      return () => {
        unsubAccounts();
        unsubTxs();
      };
    } catch (e) {
      console.warn('Firestore subscription error:', e);
    }
  }, [currentUser?.uid, mode]);

  // Account operations
  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    const id = `acc_${Date.now()}`;
    const newAcc: Account = { ...account, id, mode, userId: currentUser?.uid };
    setAccounts(prev => [...prev, newAcc]);

    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'accounts', id), {
          ...newAcc,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore addAccount error:', err);
      }
    }
    return newAcc;
  }, [currentUser, mode]);

  const deleteAccount = useCallback(async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'accounts', id));
      } catch (e) {
        console.warn('Firestore deleteAccount error:', e);
      }
    }
  }, [currentUser]);

  // Transaction operations
  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newTx: Transaction = { ...tx, id, mode, userId: currentUser?.uid };
    
    setTransactions(prev => [newTx, ...prev]);

    // Update account balance if accountId is provided and status is 'paid'
    if (tx.accountId && tx.status === 'paid') {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === tx.accountId) {
          const delta = tx.type === 'income' ? tx.amount : -tx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }));
    }

    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'transactions', id), {
          ...newTx,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore addTransaction error:', err);
      }
    }
    return newTx;
  }, [currentUser, mode]);

  const deleteTransaction = useCallback(async (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (target && target.accountId && target.status === 'paid') {
      // Revert balance
      setAccounts(prev => prev.map(acc => {
        if (acc.id === target.accountId) {
          const delta = target.type === 'income' ? -target.amount : target.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));

    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (e) {
        console.warn('Firestore deleteTransaction error:', e);
      }
    }
  }, [transactions, currentUser]);

  const updateTransactionStatus = useCallback(async (id: string, newStatus: 'paid' | 'pending') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status === newStatus) return;

    // Apply balance impact
    if (tx.accountId) {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === tx.accountId) {
          if (newStatus === 'paid' && tx.status === 'pending') {
            const delta = tx.type === 'income' ? tx.amount : -tx.amount;
            return { ...acc, balance: acc.balance + delta };
          } else if (newStatus === 'pending' && tx.status === 'paid') {
            const delta = tx.type === 'income' ? -tx.amount : tx.amount;
            return { ...acc, balance: acc.balance + delta };
          }
          return acc;
        }
        return acc;
      }));
    }

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'transactions', id), { status: newStatus }, { merge: true });
      } catch (e) {
        console.warn('Firestore update status error:', e);
      }
    }
  }, [transactions, currentUser]);

  // Debt operations
  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    const id = `debt_${Date.now()}`;
    const newDebt: Debt = { ...debt, id, mode, userId: currentUser?.uid };
    setDebts(prev => [...prev, newDebt]);
    return newDebt;
  }, [currentUser, mode]);

  const recordDebtPayment = useCallback((debtId: string, amount: number) => {
    setDebts(prev => prev.map(d => {
      if (d.id === debtId) {
        const newPaid = Math.min(d.totalAmount, d.paidAmount + amount);
        const newPaidInstallments = Math.min(d.installmentsCount, d.paidInstallments + 1);
        const status = newPaid >= d.totalAmount ? 'paid_off' : 'active';
        return {
          ...d,
          paidAmount: newPaid,
          paidInstallments: newPaidInstallments,
          status
        };
      }
      return d;
    }));
  }, []);

  // Goal operations
  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    const id = `goal_${Date.now()}`;
    const newGoal: Goal = { ...goal, id, mode, userId: currentUser?.uid };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  }, [currentUser, mode]);

  const depositGoal = useCallback((goalId: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    }));
  }, []);

  // Market operations
  const addMarketItem = useCallback((item: Omit<MarketItem, 'id'>) => {
    const id = `mkt_${Date.now()}`;
    const newItem: MarketItem = { ...item, id, mode, userId: currentUser?.uid };
    setMarketItems(prev => [...prev, newItem]);
  }, [currentUser, mode]);

  const toggleMarketItem = useCallback((id: string) => {
    setMarketItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }, []);

  const deleteMarketItem = useCallback((id: string) => {
    setMarketItems(prev => prev.filter(i => i.id !== id));
  }, []);

  // Vehicle operations
  const addVehicle = useCallback((veh: Omit<Vehicle, 'id'>) => {
    const id = `veh_${Date.now()}`;
    const newVeh: Vehicle = { ...veh, id, mode, userId: currentUser?.uid };
    setVehicles(prev => [...prev, newVeh]);
  }, [currentUser, mode]);

  const addVehicleExpense = useCallback((exp: Omit<VehicleExpense, 'id'>) => {
    const id = `vehexp_${Date.now()}`;
    const newExp: VehicleExpense = { ...exp, id, userId: currentUser?.uid };
    setVehicleExpenses(prev => [...prev, newExp]);
    // Also create a financial transaction automatically
    addTransaction({
      description: `Veículo: ${exp.description}`,
      amount: exp.amount,
      type: 'expense',
      category: 'Transporte & Veículo',
      accountId: accounts[0]?.id || '',
      accountName: accounts[0]?.name || 'Conta Principal',
      date: exp.date,
      status: 'paid',
      mode,
      notes: `KM: ${exp.km || '-'}, Litros: ${exp.liters || '-'}`
    });
  }, [currentUser, mode, accounts, addTransaction]);

  // Categories
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const id = `cat_${Date.now()}`;
    const newCat: Category = { ...cat, id, mode, userId: currentUser?.uid };
    setCategories(prev => [...prev, newCat]);
  }, [currentUser, mode]);

  // Financial Metrics Computed
  const metrics = useMemo(() => {
    // Total accounts balance
    const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTxs = transactions.filter(t => t.date?.startsWith(currentMonthPrefix));

    // Incomes
    const incomeReceived = thisMonthTxs
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomePending = thisMonthTxs
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeTotalForecast = incomeReceived + incomePending;

    // Expenses
    const expensePaid = thisMonthTxs
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensePending = thisMonthTxs
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseTotalForecast = expensePaid + expensePending;

    // Reserved / Saved (Goal deposits or savings accounts)
    const reservedThisMonth = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    // Savings Rate (Taxa de Poupança)
    const netSavings = incomeReceived - expensePaid;
    const savingsRate = incomeReceived > 0 
      ? Math.max(0, Math.round((netSavings / incomeReceived) * 1000) / 10) 
      : 0.0;

    // Health Assessment
    let healthStatus: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica' = 'Excelente';
    if (totalBalance < 0 || expensePaid > incomeReceived && incomeReceived > 0) {
      healthStatus = 'Atenção';
    } else if (savingsRate >= 20 || (totalBalance > 0 && expensePaid <= incomeReceived * 0.7)) {
      healthStatus = 'Excelente';
    } else {
      healthStatus = 'Boa';
    }

    return {
      totalBalance,
      incomeReceived,
      incomePending,
      incomeTotalForecast,
      expensePaid,
      expensePending,
      expenseTotalForecast,
      reservedThisMonth,
      savingsRate,
      healthStatus
    };
  }, [accounts, transactions, goals]);

  return {
    accounts,
    transactions,
    categories,
    debts,
    goals,
    marketItems,
    vehicles,
    vehicleExpenses,
    metrics,
    addAccount,
    deleteAccount,
    addTransaction,
    deleteTransaction,
    updateTransactionStatus,
    addDebt,
    recordDebtPayment,
    addGoal,
    depositGoal,
    addMarketItem,
    toggleMarketItem,
    deleteMarketItem,
    addVehicle,
    addVehicleExpense,
    addCategory,
    setAccounts,
    setTransactions
  };
}
