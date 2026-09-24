import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Trash2, 
  Fuel, 
  Wrench, 
  FileText, 
  Gauge
} from 'lucide-react';
import { FinancialMode, Vehicle, VehicleExpense } from '../types/finance';

interface FinanceVehiclesProps {
  mode: FinancialMode;
  vehicles: Vehicle[];
  expenses: VehicleExpense[];
  onAddVehicle: (veh: Omit<Vehicle, 'id'>) => void;
  onAddExpense: (exp: Omit<VehicleExpense, 'id'>) => void;
}

export function FinanceVehicles({
  mode,
  vehicles,
  expenses,
  onAddVehicle,
  onAddExpense
}: FinanceVehiclesProps) {
  const [isVehModalOpen, setIsVehModalOpen] = useState<boolean>(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState<boolean>(false);

  // Vehicle form
  const [name, setName] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [plate, setPlate] = useState<string>('');
  const [year, setYear] = useState<string>('2022');
  const [currentKm, setCurrentKm] = useState<string>('45000');
  const [fuelType, setFuelType] = useState<'flex' | 'gasolina' | 'etanol' | 'diesel' | 'eletrico'>('flex');

  // Expense form
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [expDesc, setExpDesc] = useState<string>('');
  const [expType, setExpType] = useState<'fuel' | 'maintenance' | 'tax' | 'insurance' | 'wash'>('fuel');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expKm, setExpKm] = useState<string>('');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleSaveVeh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddVehicle({
      name: name.trim(),
      brand: 'Geral',
      model: model.trim(),
      plate: plate.trim().toUpperCase(),
      year: parseInt(year, 10) || 2022,
      currentKm: parseInt(currentKm, 10) || 0,
      fuelType,
      mode
    });

    setIsVehModalOpen(false);
    setName('');
    setModel('');
    setPlate('');
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim() || !expAmount) return;

    onAddExpense({
      vehicleId: selectedVehicleId || vehicles[0]?.id || '',
      description: expDesc.trim(),
      type: expType,
      amount: parseFloat(expAmount.replace(',', '.')) || 0,
      date: expDate,
      km: parseInt(expKm, 10) || undefined
    });

    setIsExpModalOpen(false);
    setExpDesc('');
    setExpAmount('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Car size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestão de Veículos</h1>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Controle de combustível, manutenção, IPVA e quilometragem
          </p>
        </div>

        <div className="flex gap-2">
          {vehicles.length > 0 && (
            <button
              onClick={() => {
                setSelectedVehicleId(vehicles[0]?.id || '');
                setIsExpModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              + Despesa de Veículo
            </button>
          )}

          <button
            onClick={() => setIsVehModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Adicionar Veículo</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Car size={36} className="text-slate-300" />
          <h3 className="text-sm font-extrabold text-slate-700">Nenhum veículo cadastrado</h3>
          <p className="text-xs text-slate-400">Cadastre seu carro ou moto para controlar manutenções e abastecimentos.</p>
          <button onClick={() => setIsVehModalOpen(true)} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">
            Cadastrar Veículo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map(v => (
            <div key={v.id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{v.name}</h3>
                  <p className="text-xs text-slate-500">{v.model} • Placa: {v.plate || 'S/N'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">KM ATUAL</span>
                  <strong className="text-slate-800">{v.currentKm.toLocaleString('pt-BR')} km</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">COMBUSTÍVEL</span>
                  <strong className="text-slate-800 capitalize">{v.fuelType}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Expenses List */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Histórico de Gastos do Veículo</h3>
          <div className="divide-y divide-slate-100">
            {expenses.map(exp => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    {exp.type === 'fuel' ? <Fuel size={16} /> : <Wrench size={16} />}
                  </div>
                  <div>
                    <strong className="text-slate-800">{exp.description}</strong>
                    <div className="text-[10px] text-slate-400">{exp.date} {exp.km ? `• ${exp.km} km` : ''}</div>
                  </div>
                </div>
                <span className="font-black text-rose-600">-{formatBRL(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Vehicle */}
      {isVehModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Cadastrar Veículo</h3>
            <form onSubmit={handleSaveVeh} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Nome / Apelido</label>
                <input required placeholder="Ex: Meu Carro, Civic, Honda CG" value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Modelo</label>
                  <input placeholder="Ex: Civic 2.0" value={model} onChange={e => setModel(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Placa</label>
                  <input placeholder="BRA2E19" value={plate} onChange={e => setPlate(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">KM Atual</label>
                  <input value={currentKm} onChange={e => setCurrentKm(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Combustível</label>
                  <select value={fuelType} onChange={(e: any) => setFuelType(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs">
                    <option value="flex">Flex</option>
                    <option value="gasolina">Gasolina</option>
                    <option value="etanol">Etanol</option>
                    <option value="diesel">Diesel</option>
                    <option value="eletrico">Elétrico</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsVehModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">Salvar Veículo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Expense */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Nova Despesa do Veículo</h3>
            <form onSubmit={handleSaveExp} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700">Descrição</label>
                <input required placeholder="Ex: Gasolina Comum, Troca de Óleo, Seguro" value={expDesc} onChange={e => setExpDesc(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Valor (R$)</label>
                  <input required placeholder="150,00" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Tipo</label>
                  <select value={expType} onChange={(e: any) => setExpType(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs">
                    <option value="fuel">Combustível</option>
                    <option value="maintenance">Manutenção</option>
                    <option value="tax">IPVA / Taxas</option>
                    <option value="insurance">Seguro</option>
                    <option value="wash">Lavagem</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsExpModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
