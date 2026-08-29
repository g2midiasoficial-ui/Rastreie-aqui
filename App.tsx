import React, { useState, useEffect, useMemo } from 'react';
import { Platform, PricingData, TaxRegime } from './types.ts';
import { calculatePricing, getCurrencySymbol } from './utils/calculations.ts';
import { onAuthStateChanged } from 'firebase/auth';
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

// Modular Components
import { Sidebar } from './src/components/Sidebar.tsx';
import { Header } from './src/components/Header.tsx';
import { PricingCalculator } from './src/components/PricingCalculator.tsx';
import { ScaleSimulation } from './src/components/ScaleSimulation.tsx';
import { ScalePlanning } from './src/components/ScalePlanning.tsx';
import { MetricsCompass } from './src/components/MetricsCompass.tsx';
import { DREFinancialStatement } from './src/components/DREFinancialStatement.tsx';
import { AffiliateGamification } from './src/components/AffiliateGamification.tsx';
import { SettingsAccount } from './src/components/SettingsAccount.tsx';
import { SalesLandingPage } from './src/components/SalesLandingPage.tsx';
import { AuthModal } from './src/components/AuthModal.tsx';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [currentView, setCurrentView] = useState<'app' | 'landing'>('landing');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('gerenciie_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [planningCampaigns, setPlanningCampaigns] = useState<any[]>([]);
  const [planningHistory, setPlanningHistory] = useState<any[]>([]);
  const [platform, setPlatform] = useState<Platform>(Platform.DROPSHIPPING);
  const [activeTab, setActiveTab] = useState<'overview' | 'dre' | 'compass' | 'simulation' | 'planning' | 'gamification' | 'settings'>('overview');
  
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
    feeTier: 'above_50'
  });

  const [savedProducts, setSavedProducts] = useState<PricingData[]>([]);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(2);

  // Public User ID for persistence without mandatory login
  const PUBLIC_USER_ID = currentUser?.uid || 'public_user';

  // Auth State Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userObj = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Lojista',
          email: user.email,
          photoURL: user.photoURL,
          provider: user.providerData?.[0]?.providerId || 'firebase'
        };
        setCurrentUser(userObj);
        try {
          localStorage.setItem('gerenciie_user_session', JSON.stringify(userObj));
        } catch (e) {
          console.warn(e);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    // Listen for products
    const productsQuery = query(collection(db, 'products'), where('userId', '==', PUBLIC_USER_ID));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const prods = snapshot.docs.map(d => d.data() as PricingData);
      setSavedProducts(prods);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    // Listen for campaigns
    const campaignsQuery = query(collection(db, 'campaigns'), where('userId', '==', PUBLIC_USER_ID));
    const unsubscribeCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
      const camps = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlanningCampaigns(camps);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'campaigns'));

    // Listen for planning history
    const historyQuery = query(collection(db, 'planning_history'), where('userId', '==', PUBLIC_USER_ID));
    const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
      const hist = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in-memory
      hist.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        if (timeA && timeB) {
          return timeB - timeA;
        }
        return (b.date || '').localeCompare(a.date || '');
      });
      setPlanningHistory(hist);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'planning_history'));

    return () => {
      unsubscribeProducts();
      unsubscribeCampaigns();
      unsubscribeHistory();
    };
  }, [PUBLIC_USER_ID]);

  const addPlanningCampaign = async (phase: 'Teste' | 'Validação' | 'Escala' = 'Teste') => {
    const newCamp = {
      userId: PUBLIC_USER_ID,
      name: `${phase} - ${new Date().toLocaleDateString('pt-BR')}`,
      spend: 0,
      impressions: 0,
      clicks: 0,
      atc: 0,
      ic: 0,
      sales: 0,
      active: true,
      selected: true,
      phase: phase,
      notes: '',
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'campaigns'), newCamp);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'campaigns');
    }
  };

  const updatePlanningCampaign = async (id: string, updates: any) => {
    try {
      await setDoc(doc(db, 'campaigns', id), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `campaigns/${id}`);
    }
  };

  const removePlanningCampaign = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'campaigns', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `campaigns/${id}`);
    }
  };

  const toggleSelectAllPlanning = async (val: boolean) => {
    planningCampaigns.forEach(c => {
      updatePlanningCampaign(c.id, { selected: val });
    });
  };

  const savePlanningSimulation = async () => {
    if (planningDiagnostic.budget === 0 && planningDiagnostic.sales === 0) return;
    
    const newEntry = {
      userId: PUBLIC_USER_ID,
      date: new Date().toLocaleDateString('pt-BR'),
      spend: planningDiagnostic.budget,
      revenue: planningDiagnostic.revenue,
      roas: planningDiagnostic.roas,
      cpa: planningDiagnostic.cpa,
      profit: planningDiagnostic.profit,
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, 'planning_history'), newEntry);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'planning_history');
    }
  };

  const saveProduct = async () => {
    if (!pricingData.productName) return;
    
    const productId = pricingData.productName.replace(/[^a-zA-Z0-9]/g, '_');
    try {
      await setDoc(doc(db, 'products', `${PUBLIC_USER_ID}_${productId}`), {
        ...pricingData,
        userId: PUBLIC_USER_ID,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${PUBLIC_USER_ID}_${productId}`);
    }
  };

  const deleteProduct = async (name: string) => {
    const productId = name.replace(/[^a-zA-Z0-9]/g, '_');
    try {
      await deleteDoc(doc(db, 'products', `${PUBLIC_USER_ID}_${productId}`));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${PUBLIC_USER_ID}_${productId}`);
    }
  };

  const loadProduct = (product: PricingData) => {
    setPricingData({ ...product });
  };

  useEffect(() => {
    if (platform === Platform.SHOPEE) {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 14,
        fixedFee: 4,
        yampiFeePercent: 0,
        cardTaxPercent: 0,
        gatewayFee: 0,
        freightPercent: 0,
        affiliateCommissionPercent: 0
      }));
    } else if (platform === Platform.MERCADO_LIVRE) {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 11.5,
        fixedFee: 6,
        yampiFeePercent: 0,
        cardTaxPercent: 0,
        gatewayFee: 0,
        freightPercent: 0,
        affiliateCommissionPercent: 0
      }));
    } else if (platform === Platform.TIKTOK_SHOP) {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 6,
        fixedFee: 6,
        yampiFeePercent: 0,
        cardTaxPercent: 0,
        gatewayFee: 0,
        freightPercent: 6,
        affiliateCommissionPercent: 10,
        taxPercent: 6
      }));
    } else {
      setPricingData(prev => ({
        ...prev,
        marketplaceCommissionPercent: 0,
        fixedFee: 0,
        yampiFeePercent: 2.5,
        cardTaxPercent: 4.99,
        gatewayFee: 1,
        freightPercent: 0,
        affiliateCommissionPercent: 0
      }));
    }
  }, [platform]);

  const currentResult = useMemo(() => {
    if (pricingData.pricingMode === 'manual' && pricingData.customSellingPrice !== undefined) {
      const baseProductCost = pricingData.costPrice || 0;
      const baseFreightIn = pricingData.freightIn || 0;
      const icmsFee = baseProductCost * ((pricingData.icmsPercent || 0) / 100);
      const unitCMV = baseProductCost + baseFreightIn + icmsFee;
      const unitOperatingCost = (pricingData.packagingCost || 0) + (pricingData.shippingLabel || 0);
      const totalDirectCost = unitCMV + unitOperatingCost;
      
      const targetMarkup = totalDirectCost > 0 ? (pricingData.customSellingPrice / totalDirectCost) : 1;
      return calculatePricing(pricingData, targetMarkup, platform);
    }
    return calculatePricing(pricingData, pricingData.desiredMarkup, platform);
  }, [pricingData, platform]);

  const planningDiagnostic = useMemo(() => {
    const selectedCamps = planningCampaigns.filter(c => c.selected && c.active);
    
    const budget = selectedCamps.reduce((acc, c) => acc + Number(c.spend || 0), 0);
    const impressions = selectedCamps.reduce((acc, c) => acc + Number(c.impressions || 0), 0);
    const clicks = selectedCamps.reduce((acc, c) => acc + Number(c.clicks || 0), 0);
    const atc = selectedCamps.reduce((acc, c) => acc + Number(c.atc || 0), 0);
    const ic = selectedCamps.reduce((acc, c) => acc + Number(c.ic || 0), 0);
    const sales = selectedCamps.reduce((acc, c) => acc + Number(c.sales || 0), 0);
    
    const summaryByPhase = {
      Teste: selectedCamps.filter(c => c.phase === 'Teste').length,
      Validação: selectedCamps.filter(c => c.phase === 'Validação').length,
      Escala: selectedCamps.filter(c => c.phase === 'Escala').length,
    };

    const revenue = sales * currentResult.finalPrice;
    
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (sales / clicks) * 100 : 0;
    const atcRate = clicks > 0 ? (atc / clicks) * 100 : 0;
    const icRate = atc > 0 ? (ic / atc) * 100 : 0;
    const cpm = impressions > 0 ? (budget / impressions) * 1000 : 0;
    const cpc = clicks > 0 ? budget / clicks : 0;

    const unitVariableCostsNoAds = (currentResult.unitCMV + pricingData.packagingCost + pricingData.shippingLabel + (currentResult.totalFeesOnly - currentResult.marketingCost - currentResult.marketingAdsTax));
    
    const totalCosts = (unitVariableCostsNoAds * sales) + budget + (pricingData.fixedOpCost / 30 * (selectedCamps.length || 1)); 
    const profit = revenue - totalCosts;
    const cpa = sales > 0 ? budget / sales : 0;
    const roas = budget > 0 ? revenue / budget : 0;

    const issues = [];
    
    if (selectedCamps.length === 0) {
      return { budget: 0, impressions: 0, clicks: 0, atc: 0, ic: 0, sales: 0, revenue: 0, profit: 0, cpa: 0, roas: 0, cpc: 0, ctr: 0, cvr: 0, atcRate: 0, icRate: 0, cpm: 0, issues: [], dailyData: [], scaleGuidance: 'Selecione entradas para analisar.', summaryByPhase };
    }

    if (ctr < 1) issues.push({ type: 'error', label: 'CTR Baixo', msg: 'Anúncio pouco atraente. Melhore criativo.' });
    if (atcRate < 5) issues.push({ type: 'error', label: 'ATC Baixo', msg: 'Muitos cliques, poucas intenções. Melhore a oferta.' });
    if (cvr < 1) issues.push({ type: 'error', label: 'CVR Crítica', msg: 'Sua conversão final está drenando lucro.' });
    if (cpa > currentResult.maxCPA) issues.push({ type: 'error', label: 'CPA ALTO', msg: 'Você está no prejuízo por venda.' });

    let scaleGuidance = 'Mantenha os testes.';
    if (profit > 0 && roas > 3 && cpa < currentResult.cpaIdeal) scaleGuidance = 'ESCALA LIBERADA: Aumente o budget em 20%.';
    else if (profit < 0) scaleGuidance = 'ALERTA: Reduza o budget ou congele a campanha.';
    else if (cpa > currentResult.maxCPA) scaleGuidance = 'PERIGO: CPA furando o breakeven.';

    return { budget, impressions, clicks, atc, ic, sales, revenue, profit, cpa, roas, cpc, ctr, cvr, atcRate, icRate, cpm, issues, dailyData: [], scaleGuidance, summaryByPhase };
  }, [planningCampaigns, currentResult, pricingData]);

  const scaleResult = useMemo(() => {
    const scaledData = {
      ...pricingData,
      estimatedMonthlySales: pricingData.estimatedMonthlySales * scaleMultiplier,
      fixedOpCost: pricingData.fixedOpCost * (1 + (scaleMultiplier * 0.1))
    };
    return calculatePricing(scaledData, pricingData.desiredMarkup, platform);
  }, [pricingData, platform, scaleMultiplier]);

  if (currentView === 'landing') {
    return (
      <SalesLandingPage 
        onEnterPlatform={() => setCurrentView('app')}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          if (user) setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-black font-['Plus_Jakarta_Sans']">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        platform={platform}
        setPlatform={setPlatform}
        currentUser={currentUser}
        onOpenLanding={() => setCurrentView('landing')}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          platform={platform}
          pricingData={pricingData}
          setPricingData={setPricingData}
          currentResult={currentResult}
          currentUser={currentUser}
          onOpenLanding={() => setCurrentView('landing')}
        />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          {activeTab === 'overview' && (
            <PricingCalculator 
              pricingData={pricingData}
              setPricingData={setPricingData}
              currentResult={currentResult}
              platform={platform}
            />
          )}

          {activeTab === 'simulation' && (
            <ScaleSimulation 
              pricingData={pricingData}
              currentResult={currentResult}
              scaleResult={scaleResult}
              scaleMultiplier={scaleMultiplier}
              setScaleMultiplier={setScaleMultiplier}
            />
          )}

          {activeTab === 'planning' && (
            <ScalePlanning 
              pricingData={pricingData}
              setPricingData={setPricingData}
              planningCampaigns={planningCampaigns}
              planningDiagnostic={planningDiagnostic}
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
              currentResult={currentResult}
            />
          )}

          {activeTab === 'dre' && (
            <DREFinancialStatement 
              pricingData={pricingData}
              currentResult={currentResult}
            />
          )}

          {activeTab === 'gamification' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
              <AffiliateGamification 
                pricingData={pricingData} 
                currentResult={currentResult} 
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsAccount 
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              pricingData={pricingData}
              setPricingData={setPricingData}
              savedProductsCount={savedProducts.length}
              campaignsCount={planningCampaigns.length}
            />
          )}
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          if (user) setCurrentUser(user);
        }}
      />
    </div>
  );
}
