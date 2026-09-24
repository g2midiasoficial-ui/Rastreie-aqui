export type FinancialMode = 'personal' | 'business'; // 'Eu' vs 'Emp'

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'paid' | 'pending' | 'cancelled';

export interface Account {
  id: string;
  userId?: string;
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'credit_card' | 'wallet' | 'investment';
  balance: number;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number;
  color?: string;
  mode: FinancialMode;
  createdAt?: any;
}

export interface Transaction {
  id: string;
  userId?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  accountName?: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  mode: FinancialMode;
  notes?: string;
  attachmentUrl?: string;
  isRecurring?: boolean;
  createdAt?: any;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budgetLimit?: number;
  mode: FinancialMode;
}

export interface Debt {
  id: string;
  userId?: string;
  title: string;
  creditor: string;
  totalAmount: number;
  paidAmount: number;
  installmentsCount: number;
  paidInstallments: number;
  installmentValue: number;
  dueDate: string;
  interestRate?: number;
  status: 'active' | 'paid_off' | 'renegotiated';
  mode: FinancialMode;
}

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
  icon: string;
  mode: FinancialMode;
}

export interface MarketItem {
  id: string;
  userId?: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  checked: boolean;
  mode: FinancialMode;
}

export interface Vehicle {
  id: string;
  userId?: string;
  name: string;
  brand: string;
  model: string;
  plate: string;
  year: number;
  currentKm: number;
  fuelType: 'gasolina' | 'etanol' | 'diesel' | 'flex' | 'eletrico';
  mode: FinancialMode;
}

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  userId?: string;
  description: string;
  type: 'fuel' | 'maintenance' | 'tax' | 'insurance' | 'wash' | 'other';
  amount: number;
  date: string;
  km?: number;
  liters?: number;
  pricePerLiter?: number;
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  title: string;
  date: string;
  amount?: number;
  type: 'bill' | 'income' | 'reminder' | 'meeting';
  status: 'pending' | 'completed';
  mode: FinancialMode;
}
