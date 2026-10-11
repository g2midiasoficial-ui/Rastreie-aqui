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
import { supabase } from './supabase';

// Campos que existem só na interface e não viram colunas no banco
const CLIENT_ONLY_FIELDS = new Set(['userId', 'createdAt']);

const toSnake = (key: string) => key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

/** Objeto do app (camelCase) -> linha do Supabase (snake_case). */
function toRow(obj: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (CLIENT_ONLY_FIELDS.has(key) || value === undefined) continue;
    // IDs vazios (ex.: transação sem conta) viram NULL para não quebrar a chave estrangeira
    row[toSnake(key)] = key.endsWith('Id') && value === '' ? null : value;
  }
  return row;
}

/** Linha do Supabase (snake_case) -> objeto do app (camelCase). */
function fromRow(row: Record<string, any>): Record<string, any> {
  const obj: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    obj[toCamel(key)] = value === null ? undefined : value;
  }
  if (obj.accountId === undefined && 'account_id' in row) obj.accountId = '';
  return obj;
}

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

  // Usuário com conta real (visitantes ficam só no localStorage)
  const userId: string | null = currentUser?.uid && !currentUser?.isGuest ? currentUser.uid : null;

  // Supabase sync when currentUser is logged in: o banco é a fonte da verdade
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const load = async <T,>(table: string, setter: (rows: T[]) => void, filterByMode = true) => {
      let q = supabase.from(table).select('*').order('created_at', { ascending: true });
      if (filterByMode) q = q.eq('mode', mode);
      const { data, error } = await q;
      if (error) {
        console.warn(`Supabase ${table} sync:`, error.message);
        return;
      }
      if (!cancelled) setter((data || []).map(fromRow) as T[]);
    };

    load<Account>('accounts', setAccounts);
    load<Transaction>('transactions', rows => setTransactions([...rows].reverse()));
    load<Category>('categories', rows => setCategories([
      ...DEFAULT_CATEGORIES.filter(c => c.mode === mode || c.mode === 'personal'),
      ...rows
    ]));
    load<Debt>('debts', setDebts);
    load<Goal>('goals', setGoals);
    load<MarketItem>('market_items', setMarketItems);
    load<Vehicle>('vehicles', setVehicles);
    load<VehicleExpense>('vehicle_expenses', setVehicleExpenses, false);

    return () => {
      cancelled = true;
    };
  }, [userId, mode]);

  // Grava no Supabase (somente para usuários logados); falhas não travam a interface
  const persist = useCallback(async (table: string, op: 'insert' | 'update' | 'delete', id: string, values?: Record<string, any>) => {
    if (!userId) return;
    let result;
    if (op === 'insert') {
      result = await supabase.from(table).insert(toRow({ ...values, id }));
    } else if (op === 'update') {
      result = await supabase.from(table).update(toRow(values || {})).eq('id', id);
    } else {
      result = await supabase.from(table).delete().eq('id', id);
    }
    if (result.error) console.warn(`Supabase ${op} ${table}:`, result.error.message);
  }, [userId]);

  const adjustAccountBalance = useCallback((accountId: string, delta: number) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc || delta === 0) return;
    const balance = acc.balance + delta;
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance } : a));
    persist('accounts', 'update', accountId, { balance });
  }, [accounts, persist]);

  // Account operations
  const addAccount = useCallback(async (account: Omit<Account, 'id'>) => {
    const id = crypto.randomUUID();
    const newAcc: Account = { ...account, id, mode };
    setAccounts(prev => [...prev, newAcc]);
    await persist('accounts', 'insert', id, newAcc);
    return newAcc;
  }, [mode, persist]);

  const deleteAccount = useCallback(async (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    await persist('accounts', 'delete', id);
  }, [persist]);

  // Transaction operations
  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    const id = crypto.randomUUID();
    const newTx: Transaction = { ...tx, id, mode };
    
    setTransactions(prev => [newTx, ...prev]);

    // Update account balance if accountId is provided and status is 'paid'
    if (tx.accountId && tx.status === 'paid') {
      adjustAccountBalance(tx.accountId, tx.type === 'income' ? tx.amount : -tx.amount);
    }

    await persist('transactions', 'insert', id, newTx);
    return newTx;
  }, [mode, persist, adjustAccountBalance]);

  const deleteTransaction = useCallback(async (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (target && target.accountId && target.status === 'paid') {
      // Revert balance
      adjustAccountBalance(target.accountId, target.type === 'income' ? -target.amount : target.amount);
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    await persist('transactions', 'delete', id);
  }, [transactions, persist, adjustAccountBalance]);

  const updateTransactionStatus = useCallback(async (id: string, newStatus: 'paid' | 'pending') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx || tx.status === newStatus) return;

    // Apply balance impact
    if (tx.accountId) {
      if (newStatus === 'paid' && tx.status === 'pending') {
        adjustAccountBalance(tx.accountId, tx.type === 'income' ? tx.amount : -tx.amount);
      } else if (newStatus === 'pending' && tx.status === 'paid') {
        adjustAccountBalance(tx.accountId, tx.type === 'income' ? -tx.amount : tx.amount);
      }
    }

    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await persist('transactions', 'update', id, { status: newStatus });
  }, [transactions, persist, adjustAccountBalance]);

  // Debt operations
  const addDebt = useCallback(async (debt: Omit<Debt, 'id'>) => {
    const id = crypto.randomUUID();
    const newDebt: Debt = { ...debt, id, mode };
    setDebts(prev => [...prev, newDebt]);
    await persist('debts', 'insert', id, newDebt);
    return newDebt;
  }, [mode, persist]);

  const recordDebtPayment = useCallback((debtId: string, amount: number) => {
    const d = debts.find(item => item.id === debtId);
    if (!d) return;
    const newPaid = Math.min(d.totalAmount, d.paidAmount + amount);
    const changes = {
      paidAmount: newPaid,
      paidInstallments: Math.min(d.installmentsCount, d.paidInstallments + 1),
      status: (newPaid >= d.totalAmount ? 'paid_off' : 'active') as Debt['status']
    };
    setDebts(prev => prev.map(item => item.id === debtId ? { ...item, ...changes } : item));
    persist('debts', 'update', debtId, changes);
  }, [debts, persist]);

  // Goal operations
  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    const id = crypto.randomUUID();
    const newGoal: Goal = { ...goal, id, mode };
    setGoals(prev => [...prev, newGoal]);
    await persist('goals', 'insert', id, newGoal);
    return newGoal;
  }, [mode, persist]);

  const depositGoal = useCallback((goalId: string, amount: number) => {
    const g = goals.find(item => item.id === goalId);
    if (!g) return;
    const currentAmount = g.currentAmount + amount;
    setGoals(prev => prev.map(item => item.id === goalId ? { ...item, currentAmount } : item));
    persist('goals', 'update', goalId, { currentAmount });
  }, [goals, persist]);

  // Market operations
  const addMarketItem = useCallback((item: Omit<MarketItem, 'id'>) => {
    const id = crypto.randomUUID();
    const newItem: MarketItem = { ...item, id, mode };
    setMarketItems(prev => [...prev, newItem]);
    persist('market_items', 'insert', id, newItem);
  }, [mode, persist]);

  const toggleMarketItem = useCallback((id: string) => {
    const item = marketItems.find(i => i.id === id);
    if (!item) return;
    setMarketItems(prev => prev.map(i => i.id === id ? { ...i, checked: !item.checked } : i));
    persist('market_items', 'update', id, { checked: !item.checked });
  }, [marketItems, persist]);

  const deleteMarketItem = useCallback((id: string) => {
    setMarketItems(prev => prev.filter(i => i.id !== id));
    persist('market_items', 'delete', id);
  }, [persist]);

  // Vehicle operations
  const addVehicle = useCallback((veh: Omit<Vehicle, 'id'>) => {
    const id = crypto.randomUUID();
    const newVeh: Vehicle = { ...veh, id, mode };
    setVehicles(prev => [...prev, newVeh]);
    persist('vehicles', 'insert', id, newVeh);
  }, [mode, persist]);

  const addVehicleExpense = useCallback((exp: Omit<VehicleExpense, 'id'>) => {
    const id = crypto.randomUUID();
    const newExp: VehicleExpense = { ...exp, id };
    setVehicleExpenses(prev => [...prev, newExp]);
    persist('vehicle_expenses', 'insert', id, newExp);
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
  }, [mode, accounts, addTransaction, persist]);

  // Categories
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const id = crypto.randomUUID();
    const newCat: Category = { ...cat, id, mode };
    setCategories(prev => [...prev, newCat]);
    persist('categories', 'insert', id, newCat);
  }, [mode, persist]);

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
