import React, { useMemo } from 'react';
import { 
  Tag, 
  Package, 
  Save, 
  History, 
  Download, 
  Trash2, 
  Plus, 
  Navigation,
  MousePointer2, 
  MousePointerClick, 
  Eye, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Target, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { PricingData, CampaignInput } from '../../types.ts';
import { formatCurrency, getCurrencySymbol } from '../../utils/calculations.ts';

interface ScalePlanningProps {
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  planningCampaigns: CampaignInput[];
  planningDiagnostic?: any;
  planningHistory: any[];
  savedProducts?: PricingData[];
  saveProduct?: () => void;
  loadProduct?: (p: PricingData) => void;
  deleteProduct?: (name: string) => void;
  addPlanningCampaign: (phase?: string) => void;
  updatePlanningCampaign: (id: string, updates: Partial<CampaignInput>) => void;
  removePlanningCampaign: (id: string) => void;
  toggleSelectAllPlanning: (selected: boolean) => void;
  savePlanningSimulation: () => void;
  setPlanningHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ScalePlanning({
  pricingData,
  setPricingData,
  planningCampaigns,
  planningHistory,
  saveProduct,
  addPlanningCampaign,
  updatePlanningCampaign,
  removePlanningCampaign,
  toggleSelectAllPlanning,
  savePlanningSimulation,
  setPlanningHistory
}: ScalePlanningProps) {
  const currentSymbol = getCurrencySymbol(pricingData.currency);

  // Live calculations for the active campaigns
  const calculatedMetrics = useMemo(() => {
    const activeCamps = planningCampaigns.filter(c => c.active !== false);
    const selectedCamps = activeCamps.filter(c => c.selected !== false);
    const targetCamps = selectedCamps.length > 0 ? selectedCamps : activeCamps;

    const spend = targetCamps.reduce((sum, c) => sum + (Number(c.spend) || 0), 0);
    const impressions = targetCamps.reduce((sum, c) => sum + (Number(c.impressions) || 0), 0);
    const clicks = targetCamps.reduce((sum, c) => sum + (Number(c.clicks) || 0), 0);
    const atc = targetCamps.reduce((sum, c) => sum + (Number(c.atc) || 0), 0);
    const ic = targetCamps.reduce((sum, c) => sum + (Number(c.ic) || 0), 0);
    const sales = targetCamps.reduce((sum, c) => sum + (Number(c.sales) || 0), 0);

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const atcRate = clicks > 0 ? (atc / clicks) * 100 : 0;
    const cvr = clicks > 0 ? (sales / clicks) * 100 : 0;
    const cpa = sales > 0 ? spend / sales : 0;

    const sellingPrice = (pricingData.costPrice || 0) * (pricingData.desiredMarkup || 2.5);
    const revenue = sales * sellingPrice;
    const productCost = sales * (pricingData.costPrice || 0);
    const estimatedProfit = revenue - productCost - spend;
    const roas = spend > 0 ? revenue / spend : 0;

    const testeCount = activeCamps.filter(c => (c.phase || 'Teste') === 'Teste').length;
    const validacaoCount = activeCamps.filter(c => c.phase === 'Validação').length;
    const escalaCount = activeCamps.filter(c => c.phase === 'Escala').length;

    let scaleGuidance = 'Selecione entradas para analisar.';
    if (targetCamps.length > 0 && spend > 0) {
      if (roas >= 2.5) {
        scaleGuidance = 'Excelente desempenho! Pronto para aumentar orçamento ou duplicar conjuntos.';
      } else if (roas >= 1.5) {
        scaleGuidance = 'Desempenho estável. Valide novos criativos antes de escalar agressivo.';
      } else {
        scaleGuidance = 'Atenção aos custos. Otimize a taxa de conversão e reduza o CPA.';
      }
    }

    return {
      spend,
      impressions,
      clicks,
      atc,
      ic,
      sales,
      ctr,
      cpc,
      cpm,
      atcRate,
      cvr,
      cpa,
      revenue,
      estimatedProfit,
      roas,
      testeCount,
      validacaoCount,
      escalaCount,
      scaleGuidance,
      hasEntries: targetCamps.length > 0
    };
  }, [planningCampaigns, pricingData]);

  const handleExportCSV = () => {
    if (planningHistory.length === 0) return;
    const headers = ["Data", "Gasto", "Receita", "ROAS", "CPA", "Lucro"];
    const rows = planningHistory.map(h => [
      `"${h.date}"`,
      h.spend || 0,
      h.revenue || 0,
      (h.roas || 0).toFixed(2),
      (h.cpa || 0).toFixed(2),
      (h.profit || 0).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_planejamento_${pricingData.productName || 'gerenciie'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToHistory = () => {
    const record = {
      id: 'sim_' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR'),
      spend: calculatedMetrics.spend,
      revenue: calculatedMetrics.revenue,
      roas: calculatedMetrics.roas,
      cpa: calculatedMetrics.cpa,
      profit: calculatedMetrics.estimatedProfit,
      campaignsCount: planningCampaigns.length,
      productName: pricingData.productName || 'Produto'
    };
    setPlanningHistory(prev => [record, ...prev]);
    if (savePlanningSimulation) {
      savePlanningSimulation();
    }
  };

  const allSelected = planningCampaigns.length > 0 && planningCampaigns.every(c => c.selected !== false);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Top Header & Product/Action Pills */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight italic">
            Simulador de Planejamento
          </h1>
          <p className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest mt-0.5">
            ORGANIZE SUAS METAS E PREVEJA O LUCRO
          </p>
        </div>

        {/* Right Top Widgets */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Product pill widget */}
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-xs border border-slate-200/90 gap-3">
            {/* Produto */}
            <div className="flex items-center gap-2">
              <Tag size={15} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">PRODUTO</span>
                <input
                  type="text"
                  value={pricingData.productName || ''}
                  onChange={e => setPricingData({ ...pricingData, productName: e.target.value })}
                  placeholder="Nome do produto"
                  className="text-xs font-black text-slate-900 bg-transparent border-none p-0 focus:outline-hidden focus:ring-0 w-28 md:w-32"
                />
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Custo */}
            <div className="flex items-center gap-2">
              <Package size={15} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">CUSTO</span>
                <input
                  type="number"
                  step="0.01"
                  value={pricingData.costPrice || 0}
                  onChange={e => setPricingData({ ...pricingData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="text-xs font-black text-slate-900 bg-transparent border-none p-0 focus:outline-hidden focus:ring-0 w-14"
                />
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Markup */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">MARKUP</span>
                <input
                  type="number"
                  step="0.1"
                  value={pricingData.desiredMarkup || 2.5}
                  onChange={e => setPricingData({ ...pricingData, desiredMarkup: parseFloat(e.target.value) || 0 })}
                  className="text-xs font-black text-slate-900 bg-transparent border-none p-0 focus:outline-hidden focus:ring-0 w-12"
                />
              </div>
            </div>

            {/* Save Button */}
            {saveProduct && (
              <button
                onClick={saveProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                title="Salvar Configuração"
              >
                <Save size={14} />
              </button>
            )}
          </div>

          {/* Black Pill Button: + ADICIONAR DIA/CAMPANHA */}
          <button
            onClick={() => addPlanningCampaign('Teste')}
            className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white rounded-full text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>ADICIONAR DIA/CAMPANHA</span>
          </button>
        </div>
      </div>

      {/* Table Header Bar & Campaign Rows */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-900 uppercase tracking-wider bg-slate-50/50">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={e => toggleSelectAllPlanning(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-14 text-center">ON</th>
                <th className="p-3 w-28">FASE</th>
                <th className="p-3">ID/NOME DA CAMPANHA</th>
                <th className="p-3 text-right">INVESTIDO ({currentSymbol})</th>
                <th className="p-3 text-right">IMPRESSÕES</th>
                <th className="p-3 text-right">CLIQUES LINK</th>
                <th className="p-3 text-right">TAXA ATC (%)</th>
                <th className="p-3 text-right">ADD CARRINHO</th>
                <th className="p-3 text-right">CHECKOUTS</th>
                <th className="p-3 text-right">CVR (%)</th>
                <th className="p-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {planningCampaigns.length > 0 ? (
                planningCampaigns.map((camp) => {
                  const campSpend = Number(camp.spend) || 0;
                  const campImpressions = Number(camp.impressions) || 0;
                  const campClicks = Number(camp.clicks) || 0;
                  const campAtc = Number(camp.atc) || 0;
                  const campSales = Number(camp.sales) || 0;
                  const campAtcRate = campClicks > 0 ? ((campAtc / campClicks) * 100).toFixed(1) : '0.0';
                  const campCvr = campClicks > 0 ? ((campSales / campClicks) * 100).toFixed(1) : '0.0';

                  return (
                    <tr
                      key={camp.id}
                      className={`hover:bg-slate-50/60 transition-colors ${camp.active === false ? 'opacity-50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={camp.selected !== false}
                          onChange={e => updatePlanningCampaign(camp.id, { selected: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* ON Toggle */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => updatePlanningCampaign(camp.id, { active: camp.active === false ? true : false })}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer inline-flex items-center ${
                            camp.active !== false ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 bg-white rounded-full shadow-xs" />
                        </button>
                      </td>

                      {/* Fase */}
                      <td className="p-3">
                        <select
                          value={camp.phase || 'Teste'}
                          onChange={e => updatePlanningCampaign(camp.id, { phase: e.target.value })}
                          className={`text-[10px] font-black uppercase rounded-lg px-2 py-1 border-none cursor-pointer focus:ring-0 ${
                            camp.phase === 'Validação'
                              ? 'bg-blue-50 text-blue-700'
                              : camp.phase === 'Escala'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <option value="Teste">Teste</option>
                          <option value="Validação">Validação</option>
                          <option value="Escala">Escala</option>
                        </select>
                      </td>

                      {/* ID / Nome */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={camp.name}
                          onChange={e => updatePlanningCampaign(camp.id, { name: e.target.value })}
                          className="w-full bg-transparent text-xs font-black text-slate-800 border-none p-0 focus:ring-0 focus:outline-hidden"
                          placeholder="Nome da Campanha"
                        />
                      </td>

                      {/* Investido */}
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={camp.spend ?? ''}
                          onChange={e => updatePlanningCampaign(camp.id, { spend: parseFloat(e.target.value) || 0 })}
                          className="w-24 text-right bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs font-black text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </td>

                      {/* Impressões */}
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={camp.impressions ?? ''}
                          onChange={e => updatePlanningCampaign(camp.id, { impressions: parseInt(e.target.value, 10) || 0 })}
                          className="w-24 text-right bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </td>

                      {/* Cliques */}
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={camp.clicks ?? ''}
                          onChange={e => updatePlanningCampaign(camp.id, { clicks: parseInt(e.target.value, 10) || 0 })}
                          className="w-20 text-right bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </td>

                      {/* Taxa ATC % */}
                      <td className="p-3 text-right text-xs font-black text-slate-700">
                        {campAtcRate}%
                      </td>

                      {/* Add Carrinho */}
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={camp.atc ?? ''}
                          onChange={e => updatePlanningCampaign(camp.id, { atc: parseInt(e.target.value, 10) || 0 })}
                          className="w-16 text-right bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </td>

                      {/* Checkouts */}
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={camp.ic ?? ''}
                          onChange={e => updatePlanningCampaign(camp.id, { ic: parseInt(e.target.value, 10) || 0 })}
                          className="w-16 text-right bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </td>

                      {/* CVR % */}
                      <td className="p-3 text-right text-xs font-black text-slate-700">
                        {campCvr}%
                      </td>

                      {/* Delete */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removePlanningCampaign(camp.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Excluir Linha"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="p-6 text-center text-slate-400 text-xs font-medium">
                    Nenhuma campanha adicionada. Clique em <span className="font-bold text-slate-900">+ ADICIONAR DIA/CAMPANHA</span> acima para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Left (Calculadora Tempo Real) | Right (Histórico Recente) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Calculadora Tempo Real) */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-xs space-y-5">
          {/* Header */}
          <div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">CALCULADORA</span>
            <span className="text-sm font-black text-slate-900 italic">TEMPO REAL</span>
          </div>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* CTR */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MousePointer2 size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">CTR</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {calculatedMetrics.ctr.toFixed(2)}%
              </p>
            </div>

            {/* CPC */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MousePointerClick size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">CPC</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {formatCurrency(calculatedMetrics.cpc, pricingData.currency)}
              </p>
            </div>

            {/* CPM */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Eye size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">CPM</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {formatCurrency(calculatedMetrics.cpm, pricingData.currency)}
              </p>
            </div>

            {/* TAXA ATC */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ShoppingCart size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600 truncate">TAXA A...</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {calculatedMetrics.atcRate.toFixed(2)}%
              </p>
            </div>

            {/* ATC */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ShoppingCart size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">ATC</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {calculatedMetrics.atc}
              </p>
            </div>

            {/* IC */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <CreditCard size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">IC</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {calculatedMetrics.ic}
              </p>
            </div>

            {/* ROAS */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <TrendingUp size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">ROAS</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {calculatedMetrics.roas.toFixed(2)}
              </p>
            </div>

            {/* CPA */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Target size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">CPA</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {formatCurrency(calculatedMetrics.cpa, pricingData.currency)}
              </p>
            </div>

            {/* CVR */}
            <div className="bg-slate-50/90 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between min-h-[64px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ShoppingBag size={12} />
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-600">CVR</span>
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">
                {calculatedMetrics.cvr.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Green Card: LUCRO EST. (DIA) */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block">
                LUCRO EST. (DIA)
              </span>
              <p className="text-2xl font-black text-emerald-600 tracking-tight mt-0.5">
                {formatCurrency(calculatedMetrics.estimatedProfit, pricingData.currency)}
              </p>
            </div>

            <button
              onClick={handleSaveToHistory}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="Salvar no Histórico"
            >
              <Save size={16} />
            </button>
          </div>

          {/* Light Gray Card: ORIENTAÇÃO DE ESCALA */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-blue-600" />
              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                ORIENTAÇÃO DE ESCALA
              </span>
            </div>

            <p className="text-xs font-bold text-slate-500 italic">
              {calculatedMetrics.scaleGuidance}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">TESTE</span>
                <span className="text-xs font-black text-slate-900">{calculatedMetrics.testeCount}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">VALIDAÇÃO</span>
                <span className="text-xs font-black text-slate-900">{calculatedMetrics.validacaoCount}</span>
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">ESCALA</span>
                <span className="text-xs font-black text-slate-900">{calculatedMetrics.escalaCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (HISTÓRICO RECENTE) */}
        <div className="lg:col-span-8 bg-white rounded-[36px] p-6 md:p-8 border border-slate-200/80 shadow-xs min-h-[460px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <History size={20} className="text-blue-600" />
              <h2 className="text-lg md:text-xl font-black italic text-slate-900 tracking-tight">
                HISTÓRICO RECENTE
              </h2>
            </div>

            <button
              onClick={handleExportCSV}
              className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download size={14} />
              <span>EXPORTAR CSV</span>
            </button>
          </div>

          {/* Table / Empty State */}
          <div className="flex-1 flex flex-col">
            <table className="w-full text-left border-collapse mt-4">
              <thead>
                <tr className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-3">DATA</th>
                  <th className="pb-3 text-right">GASTO</th>
                  <th className="pb-3 text-right">RECEITA</th>
                  <th className="pb-3 text-right">ROAS</th>
                  <th className="pb-3 text-right">CPA</th>
                  <th className="pb-3 text-right">LUCRO EST.</th>
                  <th className="pb-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {planningHistory.length > 0 ? (
                  planningHistory.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs font-bold">
                      <td className="py-3 font-black text-slate-800">{h.date}</td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(h.spend || 0, pricingData.currency)}</td>
                      <td className="py-3 text-right text-emerald-600 font-black">{formatCurrency(h.revenue || 0, pricingData.currency)}</td>
                      <td className="py-3 text-right text-blue-600 font-black">{(h.roas || 0).toFixed(2)}x</td>
                      <td className="py-3 text-right text-slate-700">{formatCurrency(h.cpa || 0, pricingData.currency)}</td>
                      <td className={`py-3 text-right font-black ${(h.profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(h.profit || 0, pricingData.currency)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setPlanningHistory(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-300 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>

            {/* Empty State when no history */}
            {planningHistory.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                <p className="text-xl md:text-2xl font-black text-slate-300 italic tracking-tight">
                  Nenhum dado registrado para este produto.
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                  SEUS REGISTROS SALVOS APARECERÃO AQUI
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
