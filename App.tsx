import React, { useState, useEffect, useMemo } from 'react';
import { Platform, PricingData, TaxRegime, CampaignInput } from './types.ts';
import { calculatePricing, getCurrencySymbol } from './utils/calculations.ts';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './src/lib/firebase.ts';

// Financial Suite Hooks & Types
import { FinancialMode, Transaction, Account } from './src/types/finance.ts';
import { useFinancialData } from './src/lib/financialStore.ts';

// Layout & Components
import { Sidebar, AppTab } from './src/components/Sidebar.tsx';
import { Header } from './src/components/Header.tsx';
import { PricingCalculator } from './src/components/PricingCalculator.tsx';
import { ScaleSimulation } from './src/components/ScaleSimulation.tsx';
import { ScalePlanning } from './src/components/ScalePlanning.tsx';
import { MetricsCompass } from './src/components/MetricsCompass.tsx';
import { DREFinancialStatement } from './src/components/DREFinancialStatement.tsx';
import { AffiliateGamification } from './src/components/AffiliateGamification.tsx';
import { AgentAdvisor } from './src/components/AgentAdvisor.tsx';
import { SettingsAccount } from './src/components/SettingsAccount.tsx';
import { SalesLandingPage } from './src/components/SalesLandingPage.tsx';
import { AdminDashboard } from './src/components/AdminDashboard.tsx';

// Financial Modules
import { FinanceOverview } from './src/components/FinanceOverview.tsx';
import { FinanceAgentChat } from './src/components/FinanceAgentChat.tsx';
import { FinanceAccounts } from './src/components/FinanceAccounts.tsx';
import { FinanceIncomes } from './src/components/FinanceIncomes.tsx';
import { FinanceExpenses } from './src/components/FinanceExpenses.tsx';
import { FinanceTransactions } from './src/components/FinanceTransactions.tsx';
import { FinanceReports } from './src/components/FinanceReports.tsx';
import { FinanceCalendar } from './src/components/FinanceCalendar.tsx';
import { FinanceDebts } from './src/components/FinanceDebts.tsx';
import { FinanceCategories } from './src/components/FinanceCategories.tsx';
import { FinanceGoals } from './src/components/FinanceGoals.tsx';
import { FinanceMarket } from './src/components/FinanceMarket.tsx';
import { FinanceVehicles } from './src/components/FinanceVehicles.tsx';
import { FinanceProfile } from './src/components/FinanceProfile.tsx';
import { AuthModal } from './src/components/AuthModal.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<'app' | 'landing' | 'admin'>('landing');
  const [activeTab, setActiveTab] = useState<AppTab>('overview');

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('gerenciie_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [mode, setMode] = useState<FinancialMode>(() => {
    const saved = localStorage.getItem('gerenciie_financial_mode');
    return (saved as FinancialMode) || 'personal';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Quick Global Add Modals
  const [isGlobalIncomeModalOpen, setIsGlobalIncomeModalOpen] = useState<boolean>(false);
  const [isGlobalExpenseModalOpen, setIsGlobalExpenseModalOpen] = useState<boolean>(false);
  const [quickDesc, setQuickDesc] = useState<string>('');
  const [quickAmount, setQuickAmount] = useState<string>('');
  const [quickCat, setQuickCat] = useState<string>('');
  const [quickAccId, setQuickAccId] = useState<string>('');
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // E-commerce state
  const [platform, setPlatform] = useState<Platform>(Platform.DROPSHIPPING);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(2);
  const [pricingData, setPricingData] = useState<PricingData>({
    productName: 'Produto Exemplo',
    currency: 'BRL',
    costPrice: 52.50,
    freightIn: 5.00,
    packagingCost: 2.00,
    shippingLabel: 0,
    fixedFee: 6,
    marketplaceCommissionPercent: 6,
    gatewayFee: 0,
    marketingPercent: 25,
    fixedOpCost: 1500,
    taxPercent: 6,
    desiredMarkup: 2.5,
    estimatedMonthlySales: 200,
    taxRegime: TaxRegime.SIMPLES_NACIONAL,
    cardTaxPercent: 5.99,
    paymentReservePercent: 5,
    yampiFeePercent: 2.5,
    icmsPercent: 0,
    pixTaxPercent: 1,
    newTaxPercent: 0,
    adsTaxPercent: 4.38,
    freightPercent: 6,
    affiliateCommissionPercent: 10,
    pricingMode: 'markup',
    customSellingPrice: 150,
    feeTier: 'above_50',
    sfpEnabled: true,
    originalPrice: 169.90,
    sellerDiscount: 9.00,
    sellerDiscountType: 'currency',
    sfpPercent: 6
  });

  const [savedProducts, setSavedProducts] = useState<PricingData[]>([]);
  const [planningCampaigns, setPlanningCampaigns] = useState<CampaignInput[]>([]);
  const [planningHistory, setPlanningHistory] = useState<any[]>([]);

  // Financial Data Store Hook
  const financeStore = useFinancialData(currentUser, mode);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Usuário',
          photoURL: user.photoURL,
        };
        setCurrentUser(userData);
        localStorage.setItem('gerenciie_user_session', JSON.stringify(userData));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('gerenciie_user_session');
    localStorage.removeItem('gerenciie_admin_unlocked');
    setCurrentUser(null);
    setCurrentView('landing');
    setActiveTab('overview');
  };

  const handleSetMode = (newMode: FinancialMode) => {
    setMode(newMode);
    localStorage.setItem('gerenciie_financial_mode', newMode);
  };

  // E-commerce Calculations
  const calculationResult = useMemo(() => {
    return calculatePricing(pricingData, pricingData.desiredMarkup, platform);
  }, [pricingData, platform]);

  const scaleResult = useMemo(() => {
    return calculatePricing({
      ...pricingData,
      estimatedMonthlySales: pricingData.estimatedMonthlySales * scaleMultiplier
    }, pricingData.desiredMarkup, platform);
  }, [pricingData, platform, scaleMultiplier]);

  // Planning Campaigns Helpers
  const addPlanningCampaign = (phase?: string) => {
    const newCamp: CampaignInput = {
      id: 'camp_' + Date.now(),
      name: `Campanha #${planningCampaigns.length + 1} (${phase || 'Validação'})`,
      spend: 100,
      impressions: 2500,
      clicks: 120,
      atc: 18,
      ic: 8,
      sales: 4,
      active: true,
      phase: phase || 'Escala'
    };
    setPlanningCampaigns([...planningCampaigns, newCamp]);
  };

  const updatePlanningCampaign = (id: string, updates: Partial<CampaignInput>) => {
    setPlanningCampaigns(planningCampaigns.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removePlanningCampaign = (id: string) => {
    setPlanningCampaigns(planningCampaigns.filter(c => c.id !== id));
  };

  const toggleSelectAllPlanning = (selected: boolean) => {
    setPlanningCampaigns(planningCampaigns.map(c => ({ ...c, active: selected })));
  };

  const savePlanningSimulation = () => {
    const record = {
      id: 'sim_' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      campaignsCount: planningCampaigns.length,
      productName: pricingData.productName,
      markup: pricingData.desiredMarkup
    };
    setPlanningHistory([record, ...planningHistory]);
  };

  const saveProduct = () => {
    const updated = savedProducts.filter(p => p.productName !== pricingData.productName);
    setSavedProducts([...updated, pricingData]);
  };

  const loadProduct = (p: PricingData) => {
    setPricingData(p);
  };

  const deleteProduct = (name: string) => {
    setSavedProducts(savedProducts.filter(p => p.productName !== name));
  };

  const handleSaveQuickIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDesc.trim() || !quickAmount) return;

    const acc = financeStore.accounts.find(a => a.id === quickAccId) || financeStore.accounts[0];

    await financeStore.addTransaction({
      description: quickDesc.trim(),
      amount: parseFloat(quickAmount.replace(',', '.')) || 0,
      type: 'income',
      category: quickCat || 'Salário & Renda',
      accountId: acc?.id || '',
      accountName: acc?.name || 'Conta Principal',
      date: quickDate || new Date().toISOString().split('T')[0],
      status: 'paid',
      mode
    });

    setIsGlobalIncomeModalOpen(false);
    setQuickDesc('');
    setQuickAmount('');
  };

  const handleSaveQuickExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDesc.trim() || !quickAmount) return;

    const acc = financeStore.accounts.find(a => a.id === quickAccId) || financeStore.accounts[0];

    await financeStore.addTransaction({
      description: quickDesc.trim(),
      amount: parseFloat(quickAmount.replace(',', '.')) || 0,
      type: 'expense',
      category: quickCat || 'Alimentação & Mercado',
      accountId: acc?.id || '',
      accountName: acc?.name || 'Conta Principal',
      date: quickDate || new Date().toISOString().split('T')[0],
      status: 'paid',
      mode
    });

    setIsGlobalExpenseModalOpen(false);
    setQuickDesc('');
    setQuickAmount('');
  };

  if (currentView === 'landing' || (!currentUser && currentView === 'app')) {
    return (
      <SalesLandingPage
        onEnterPlatform={() => {
          if (currentUser) {
            setCurrentView('app');
          } else {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }
        }}
        currentUser={currentUser}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setCurrentView('app');
        }}
        onOpenAdmin={() => setCurrentView('admin')}
      />
    );
  }

  if (currentView === 'admin' || activeTab === 'admin') {
    return (
      <div className="relative">
        <AdminDashboard
          currentUser={currentUser}
          onOpenLanding={() => setCurrentView('landing')}
          onSwitchToApp={() => {
            setCurrentView('app');
            if (activeTab === 'admin') setActiveTab('overview');
          }}
          onLoginSuccess={(u) => setCurrentUser(u)}
          onOpenAuthModal={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onLogout={() => {
            handleLogout();
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            if (u) setCurrentUser(u);
            setIsAuthModalOpen(false);
          }}
          initialMode="login"
          hideRegister={true}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar with CFO Suite at Top and Financial modules below */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with Margem Líquida, Platform, Currency and Avatar */}
        <Header
          currentUser={currentUser}
          marginPercent={calculationResult.marginPercent}
          netProfit={calculationResult.netProfit}
          currencySymbol={pricingData.currency === 'USD' ? '$' : pricingData.currency === 'EUR' ? '€' : 'R$'}
          platform={platform}
          setPlatform={setPlatform}
          currency={pricingData.currency}
          setCurrency={(c) => setPricingData({ ...pricingData, currency: c })}
          onOpenAuthModal={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onNavigateProfile={() => setActiveTab('perfil')}
          onOpenLanding={() => setCurrentView('landing')}
          onOpenAdmin={() => setCurrentView('admin')}
          onLogout={handleLogout}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {/* 1. Original E-commerce CFO Tools */}
          {activeTab === 'overview' && (
            <PricingCalculator
              pricingData={pricingData}
              setPricingData={setPricingData}
              platform={platform}
              currentResult={calculationResult}
            />
          )}

          {activeTab === 'planning' && (
            <ScalePlanning
              pricingData={pricingData}
              setPricingData={setPricingData}
              planningCampaigns={planningCampaigns}
              planningDiagnostic={{}}
              planningHistory={planningHistory}
              savedProducts={savedProducts}
              saveProduct={saveProduct}
              loadProduct={loadProduct}
              deleteProduct={deleteProduct}
              addPlanningCampaign={addPlanningCampaign}
              updatePlanningCampaign={updatePlanningCampaign}
              removePlanningCampaign={removePlanningCampaign}
              toggleSelectAllPlanning={toggleSelectAllPlanning}
              savePlanningSimulation={savePlanningSimulation}
              setPlanningHistory={setPlanningHistory}
            />
          )}

          {activeTab === 'compass' && (
            <MetricsCompass
              pricingData={pricingData}
              currentResult={calculationResult}
            />
          )}

          {activeTab === 'dre' && (
            <DREFinancialStatement
              pricingData={pricingData}
              currentResult={calculationResult}
            />
          )}

          {activeTab === 'simulation' && (
            <ScaleSimulation
              pricingData={pricingData}
              currentResult={calculationResult}
              scaleResult={scaleResult}
              scaleMultiplier={scaleMultiplier}
              setScaleMultiplier={setScaleMultiplier}
            />
          )}

          {activeTab === 'gamification' && (
            <AffiliateGamification
              pricingData={pricingData}
              currentResult={calculationResult}
            />
          )}

          {activeTab === 'agent' && (
            <AgentAdvisor
              platform={platform}
              pricingData={pricingData}
              currentResult={calculationResult}
              savedProducts={savedProducts}
              planningCampaigns={planningCampaigns}
              planningHistory={planningHistory}
              scaleMultiplier={scaleMultiplier}
              scaleResult={scaleResult}
              financeStore={financeStore}
              financialMode={mode}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              openAuthModal={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAccount
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              pricingData={pricingData}
              setPricingData={setPricingData}
              savedProductsCount={savedProducts.length}
              campaignsCount={planningCampaigns.length}
              onLogout={handleLogout}
            />
          )}

          {/* 2. Gestão Financeira Pessoal & Empresarial (Abaixo) */}
          {activeTab === 'painel' && (
            <FinanceOverview
              mode={mode}
              metrics={financeStore.metrics}
              transactions={financeStore.transactions}
              onOpenNewIncome={() => {
                setQuickCat('Salário & Renda');
                setIsGlobalIncomeModalOpen(true);
              }}
              onOpenNewExpense={() => {
                setQuickCat('Alimentação & Mercado');
                setIsGlobalExpenseModalOpen(true);
              }}
              onNavigateTab={(t) => {
                if (t === 'agente') setActiveTab('agente_chat');
                else setActiveTab(t as AppTab);
              }}
            />
          )}

          {activeTab === 'agente_chat' && (
            <FinanceAgentChat
              mode={mode}
              accounts={financeStore.accounts}
              onAddTransaction={financeStore.addTransaction}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'agenda' && (
            <FinanceCalendar
              mode={mode}
              transactions={financeStore.transactions}
              onToggleStatus={financeStore.updateTransactionStatus}
              onOpenNewTransaction={() => setIsGlobalExpenseModalOpen(true)}
            />
          )}

          {activeTab === 'contas' && (
            <FinanceAccounts
              mode={mode}
              accounts={financeStore.accounts}
              onAddAccount={financeStore.addAccount}
              onDeleteAccount={financeStore.deleteAccount}
            />
          )}

          {activeTab === 'receitas' && (
            <FinanceIncomes
              mode={mode}
              accounts={financeStore.accounts}
              categories={financeStore.categories}
              transactions={financeStore.transactions}
              onAddTransaction={financeStore.addTransaction}
              onDeleteTransaction={financeStore.deleteTransaction}
              onToggleStatus={financeStore.updateTransactionStatus}
            />
          )}

          {activeTab === 'despesas' && (
            <FinanceExpenses
              mode={mode}
              accounts={financeStore.accounts}
              categories={financeStore.categories}
              transactions={financeStore.transactions}
              onAddTransaction={financeStore.addTransaction}
              onDeleteTransaction={financeStore.deleteTransaction}
              onToggleStatus={financeStore.updateTransactionStatus}
            />
          )}

          {activeTab === 'transacoes' && (
            <FinanceTransactions
              mode={mode}
              accounts={financeStore.accounts}
              transactions={financeStore.transactions}
              onDeleteTransaction={financeStore.deleteTransaction}
              onToggleStatus={financeStore.updateTransactionStatus}
            />
          )}

          {activeTab === 'dividas' && (
            <FinanceDebts
              mode={mode}
              debts={financeStore.debts}
              onAddDebt={financeStore.addDebt}
              onPayInstallment={financeStore.recordDebtPayment}
            />
          )}

          {activeTab === 'categorias' && (
            <FinanceCategories
              mode={mode}
              categories={financeStore.categories}
              onAddCategory={financeStore.addCategory}
            />
          )}

          {activeTab === 'relatorios' && (
            <FinanceReports
              mode={mode}
              metrics={financeStore.metrics}
              transactions={financeStore.transactions}
            />
          )}

          {activeTab === 'metas' && (
            <FinanceGoals
              mode={mode}
              goals={financeStore.goals}
              onAddGoal={financeStore.addGoal}
              onDeposit={financeStore.depositGoal}
            />
          )}

          {activeTab === 'mercado' && (
            <FinanceMarket
              mode={mode}
              items={financeStore.marketItems}
              onAddItem={financeStore.addMarketItem}
              onToggleItem={financeStore.toggleMarketItem}
              onDeleteItem={financeStore.deleteMarketItem}
            />
          )}

          {activeTab === 'veiculos' && (
            <FinanceVehicles
              mode={mode}
              vehicles={financeStore.vehicles}
              expenses={financeStore.vehicleExpenses}
              onAddVehicle={financeStore.addVehicle}
              onAddExpense={financeStore.addVehicleExpense}
            />
          )}

          {activeTab === 'perfil' && (
            <FinanceProfile
              currentUser={currentUser}
              mode={mode}
              setMode={handleSetMode}
              onOpenAuthModal={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              onLogout={handleLogout}
              onNavigateCfoTools={(tool) => {
                if (tool === 'overview') setActiveTab('overview');
                if (tool === 'planning') setActiveTab('planning');
                if (tool === 'compass') setActiveTab('compass');
                if (tool === 'dre') setActiveTab('dre');
                if (tool === 'simulation') setActiveTab('simulation');
              }}
            />
          )}
        </main>
      </div>

      {/* Quick Global Nova Receita Modal */}
      {isGlobalIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Nova Receita</h3>
              <button
                onClick={() => setIsGlobalIncomeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickIncome} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Descrição</label>
                <input
                  required
                  placeholder="Ex: Salário, Venda, Pix Recebido"
                  value={quickDesc}
                  onChange={e => setQuickDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Valor (R$)</label>
                  <input
                    required
                    placeholder="0,00"
                    value={quickAmount}
                    onChange={e => setQuickAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Data</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={e => setQuickDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Categoria</label>
                  <select
                    value={quickCat}
                    onChange={e => setQuickCat(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  >
                    <option value="Salário & Renda">Salário & Renda</option>
                    <option value="Vendas & Serviços">Vendas & Serviços</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Outras Receitas">Outras Receitas</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Conta</label>
                  <select
                    value={quickAccId}
                    onChange={e => setQuickAccId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  >
                    {financeStore.accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                    {financeStore.accounts.length === 0 && <option value="">Conta Padrão</option>}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsGlobalIncomeModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20"
                >
                  Salvar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Global Nova Despesa Modal */}
      {isGlobalExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Nova Despesa</h3>
              <button
                onClick={() => setIsGlobalExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickExpense} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Descrição</label>
                <input
                  required
                  placeholder="Ex: Aluguel, Mercado, Uber, Almoço"
                  value={quickDesc}
                  onChange={e => setQuickDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Valor (R$)</label>
                  <input
                    required
                    placeholder="0,00"
                    value={quickAmount}
                    onChange={e => setQuickAmount(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Data</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={e => setQuickDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Categoria</label>
                  <select
                    value={quickCat}
                    onChange={e => setQuickCat(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  >
                    <option value="Alimentação & Mercado">Alimentação & Mercado</option>
                    <option value="Moradia & Contas">Moradia & Contas</option>
                    <option value="Transporte & Veículo">Transporte & Veículo</option>
                    <option value="Lazer & Delivery">Lazer & Delivery</option>
                    <option value="Saúde & Farmácia">Saúde & Farmácia</option>
                    <option value="Outras Despesas">Outras Despesas</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Conta</label>
                  <select
                    value={quickAccId}
                    onChange={e => setQuickAccId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  >
                    {financeStore.accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                    {financeStore.accounts.length === 0 && <option value="">Conta Padrão</option>}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsGlobalExpenseModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20"
                >
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => {
          if (u) setCurrentUser(u);
          setIsAuthModalOpen(false);
        }}
        initialMode={authModalMode}
      />
    </div>
  );
}
