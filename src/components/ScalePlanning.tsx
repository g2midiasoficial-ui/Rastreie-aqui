import React from 'react';
import { 
  Tag, Package, Box, ChevronDown, Trash2, Plus, Save, History, Download, 
  MousePointer2, MousePointerClick, Eye, ShoppingCart, CreditCard, 
  TrendingUp, Target, ShoppingBag, Navigation, XCircle 
} from 'lucide-react';
import { PricingData, CampaignInput } from '../../types.ts';
import { formatCurrency, getCurrencySymbol } from '../../utils/calculations.ts';
import { MetricCardSmall } from './UIComponents.tsx';

interface ScalePlanningProps {
  pricingData: PricingData;
  setPricingData: React.Dispatch<React.SetStateAction<PricingData>>;
  planningCampaigns: CampaignInput[];
  planningDiagnostic: any;
  planningHistory: any[];
  savedProducts: PricingData[];
  saveProduct: () => void;
  loadProduct: (p: PricingData) => void;
  deleteProduct: (name: string) => void;
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
  planningDiagnostic,
  planningHistory,
  savedProducts,
  saveProduct,
  loadProduct,
  deleteProduct,
  addPlanningCampaign,
  updatePlanningCampaign,
  removePlanningCampaign,
  toggleSelectAllPlanning,
  savePlanningSimulation,
  setPlanningHistory
}: ScalePlanningProps) {
  const currentSymbol = getCurrencySymbol(pricingData.currency);

  const handleExportCSV = () => {
    if (planningHistory.length === 0) return;
    const headers = ["Data", "Gasto", "Receita", "ROAS", "CPA", "Lucro"];
    const rows = planningHistory.map(h => [
      `"${h.date}"`,
      h.spend,
      h.revenue,
      h.roas.toFixed(2),
      h.cpa.toFixed(2),
      h.profit.toFixed(2)
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black text-black tracking-tight italic">Simulador de Planejamento</h2>
          <p className="text-slate-900 font-bold uppercase text-[10px] tracking-[0.1em]">
            ORGANIZE SUAS METAS E PREVEJA O LUCRO
          </p>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          {/* Quick Product Setup Widget */}
          <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 items-center px-4 shrink-0">
            <Tag size={16} className="text-slate-400 mr-2" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">Produto</span>
              <input 
                type="text"
                value={pricingData.productName || ''}
                onChange={v => setPricingData(prev => ({ ...prev, productName: v.target.value }))}
                className="text-[11px] font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-24"
              />
            </div>
            <div className="w-px h-6 bg-slate-100 mx-2" />
            <Package size={16} className="text-slate-400 mr-2" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">Custo</span>
              <input 
                type="number"
                value={pricingData.costPrice}
                onChange={v => setPricingData(prev => ({ ...prev, costPrice: Number(v.target.value) }))}
                className="text-[11px] font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-16"
              />
            </div>
            <div className="w-px h-6 bg-slate-100 mx-2" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase">Markup</span>
              <input 
                type="number"
                value={pricingData.desiredMarkup}
                onChange={v => setPricingData(prev => ({ ...prev, desiredMarkup: Number(v.target.value) }))}
                className="text-[11px] font-black text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-10"
              />
            </div>
            <button 
              onClick={saveProduct}
              className="ml-2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              title="Salvar Produto"
            >
              <Save size={14} />
            </button>
          </div>

          {/* Saved Products Dropdown */}
          {savedProducts.length > 0 && (
            <div className="relative group">
              <button className="h-full px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-[10px] font-black uppercase text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer">
                <Box size={16} className="text-blue-500" />
                Meus Produtos
                <ChevronDown size={14} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden hidden group-hover:block animate-in fade-in slide-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produtos Salvos</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {savedProducts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-blue-50 transition-colors group/item">
                      <button 
                        onClick={() => loadProduct(p)}
                        className="flex-1 text-left cursor-pointer"
                      >
                        <p className="text-xs font-black text-slate-800">{p.productName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                           Custo: {formatCurrency(p.costPrice, p.currency)} • MKP: {p.desiredMarkup}x
                        </p>
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.productName)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/item:opacity-100 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => addPlanningCampaign('Teste')}
            className="px-6 py-2.5 bg-black text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            ADICIONAR DIA/CAMPANHA
          </button>
        </div>
      </div>

      {/* Tabela de Campanhas */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded accent-blue-600 cursor-pointer" 
                    checked={planningCampaigns.length > 0 && planningCampaigns.every(c => c.selected)}
                    onChange={(e) => toggleSelectAllPlanning(e.target.checked)}
                  />
                </th>
                <th className="p-4 w-16 text-center text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100">ON</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100">Fase</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">ID/Nome da Campanha</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Investido ({currentSymbol})</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Impressões</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Cliques Link</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Taxa ATC (%)</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Add Carrinho</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Checkouts</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">CVR (%)</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 text-right whitespace-nowrap">Vendas</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap">Notas / Observações</th>
                <th className="p-4 text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {planningCampaigns.map((camp) => (
                <tr key={camp.id} className={`hover:bg-slate-50/50 transition-colors group ${!camp.active ? 'opacity-40' : ''}`}>
                  <td className="p-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded accent-blue-600 cursor-pointer" 
                      checked={!!camp.selected} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { selected: e.target.checked })}
                    />
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => updatePlanningCampaign(camp.id, { active: !camp.active })}
                      className={`w-8 h-4 rounded-full relative transition-all mx-auto cursor-pointer ${camp.active ? 'bg-blue-600' : 'bg-slate-400'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${camp.active ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="p-4">
                    <select 
                      value={camp.phase || 'Teste'}
                      onChange={(e) => updatePlanningCampaign(camp.id, { phase: e.target.value })}
                      className={`border-none text-[10px] font-black uppercase rounded-lg p-1 focus:ring-0 cursor-pointer transition-colors ${
                        camp.phase === 'Teste' ? 'bg-amber-100 text-amber-700' :
                        camp.phase === 'Validação' ? 'bg-blue-100 text-blue-700' :
                        camp.phase === 'Escala' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <option value="Teste">Teste</option>
                      <option value="Validação">Validação</option>
                      <option value="Escala">Escala</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={camp.name} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { name: e.target.value })}
                      className="w-full bg-transparent text-xs font-black text-blue-700 border-none p-0 focus:ring-0"
                    />
                  </td>
                  <td className="p-2">
                     <input 
                      type="number" 
                      value={camp.spend} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { spend: Number(e.target.value) })}
                      className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg transition-all"
                    />
                  </td>
                  <td className="p-2">
                     <input 
                      type="number" 
                      value={camp.impressions} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { impressions: Number(e.target.value) })}
                      className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={camp.clicks} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { clicks: Number(e.target.value) })}
                      className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                    />
                  </td>
                  <td className="p-4 text-right text-xs font-black text-slate-800">
                    {camp.clicks > 0 ? ((camp.atc / camp.clicks) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={camp.atc} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { atc: Number(e.target.value) })}
                      className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={camp.ic} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { ic: Number(e.target.value) })}
                      className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                    />
                  </td>
                  <td className="p-4 text-right text-xs font-black text-slate-800">
                     {camp.clicks > 0 ? ((camp.sales / camp.clicks) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      value={camp.sales} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { sales: Number(e.target.value) })}
                      className="w-full bg-transparent text-right text-xs font-black text-slate-800 border-none p-2 focus:ring-0 focus:bg-white rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <textarea 
                      value={camp.notes || ''} 
                      onChange={(e) => updatePlanningCampaign(camp.id, { notes: e.target.value })}
                      placeholder="Observações..."
                      rows={1}
                      className="w-full bg-transparent text-xs font-bold text-slate-600 border-none p-2 focus:ring-0 focus:bg-white rounded-lg resize-none min-h-[36px]"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => removePlanningCampaign(camp.id)} 
                      className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calculadora Tempo Real */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Calculadora</h3>
                <p className="text-xs font-black italic text-black">TEMPO REAL</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricCardSmall label="CTR" value={`${planningDiagnostic.ctr.toFixed(2)}%`} icon={<MousePointer2 size={12}/>} />
              <MetricCardSmall label="CPC" value={formatCurrency(planningDiagnostic.cpc, pricingData.currency)} icon={<MousePointerClick size={12}/>} />
              <MetricCardSmall label="CPM" value={formatCurrency(planningDiagnostic.cpm, pricingData.currency)} icon={<Eye size={12}/>} />
              
              <MetricCardSmall label="TAXA ATC" value={`${planningDiagnostic.atcRate.toFixed(2)}%`} icon={<ShoppingCart size={12}/>} />
              <MetricCardSmall label="ATC" value={Math.floor(planningDiagnostic.atc)} icon={<ShoppingCart size={12}/>} />
              <MetricCardSmall label="IC" value={Math.floor(planningDiagnostic.ic)} icon={<CreditCard size={12}/>} />
              
              <MetricCardSmall label="ROAS" value={planningDiagnostic.roas.toFixed(2)} icon={<TrendingUp size={12}/>} />
              <MetricCardSmall label="CPA" value={formatCurrency(planningDiagnostic.cpa, pricingData.currency)} icon={<Target size={12}/>} />
              <MetricCardSmall label="CVR" value={`${planningDiagnostic.cvr.toFixed(2)}%`} icon={<ShoppingBag size={12}/>} />
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Lucro Est. (DIA)</p>
                <p className={`text-xl font-black ${planningDiagnostic.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(planningDiagnostic.profit / (planningCampaigns.filter(c => c.selected && c.active).length || 30), pricingData.currency)}
                </p>
              </div>
              <button 
                onClick={savePlanningSimulation}
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Salvar no Histórico"
              >
                <Save size={16} />
              </button>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Navigation size={14} className="text-blue-600" />
                <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Orientação de Escala</p>
              </div>
              <p className="text-[10px] font-black text-slate-700 italic">
                {planningDiagnostic.scaleGuidance}
              </p>
              
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase">Teste</span>
                  <span className="text-[10px] font-black text-slate-800">{planningDiagnostic.summaryByPhase.Teste}</span>
                </div>
                <div className="flex flex-col border-x border-slate-200 px-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase">Validação</span>
                  <span className="text-[10px] font-black text-slate-800">{planningDiagnostic.summaryByPhase['Validação']}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase">Escala</span>
                  <span className="text-[10px] font-black text-slate-800">{planningDiagnostic.summaryByPhase.Escala}</span>
                </div>
              </div>

              {planningDiagnostic.issues && planningDiagnostic.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {planningDiagnostic.issues.slice(0, 2).map((issue: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 text-rose-500">
                      <XCircle size={10} />
                      <span className="text-[8px] font-black uppercase">{issue.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Histórico Recente */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <History size={24} className="text-blue-600" />
                <h3 className="text-xl font-black italic">HISTÓRICO RECENTE</h3>
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
              >
                <Download size={14} />
                EXPORTAR CSV
              </button>
            </div>

            <div className="flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest">DATA</th>
                    <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest">GASTO</th>
                    <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">RECEITA</th>
                    <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">ROAS</th>
                    <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">CPA</th>
                    <th className="pb-4 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">LUCRO EST.</th>
                    <th className="pb-4 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {planningHistory.length > 0 ? (
                    planningHistory.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 group">
                        <td className="py-4 text-xs font-black text-slate-700">{h.date}</td>
                        <td className="py-4 text-xs font-black text-slate-900">{formatCurrency(h.spend, pricingData.currency)}</td>
                        <td className="py-4 text-xs font-black text-emerald-700 text-right">{formatCurrency(h.revenue, pricingData.currency)}</td>
                        <td className="py-4 text-xs font-black text-blue-700 text-right">{h.roas.toFixed(2)}x</td>
                        <td className="py-4 text-xs font-black text-slate-800 text-right">{formatCurrency(h.cpa, pricingData.currency)}</td>
                        <td className={`py-4 text-xs font-black text-right ${h.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {formatCurrency(h.profit, pricingData.currency)}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button 
                            onClick={() => setPlanningHistory(planningHistory.filter((_, idx) => idx !== i))}
                            className="text-slate-200 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <p className="text-xl font-black text-slate-300 italic mb-2">Nenhum dado registrado para este produto.</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Seus registros salvos aparecerão aqui</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
