import React, { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, User, ShoppingBag, ChevronDown, Shield } from 'lucide-react';
import { Platform, CurrencyCode } from '../../types';

interface HeaderProps {
  currentUser?: any;
  marginPercent?: number;
  netProfit?: number;
  currencySymbol?: string;
  platform?: Platform;
  setPlatform?: (p: Platform) => void;
  currency?: CurrencyCode;
  setCurrency?: (c: CurrencyCode) => void;
  onOpenAuthModal: () => void;
  onNavigateProfile: () => void;
  onOpenLanding?: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export function Header({
  currentUser,
  marginPercent = 0,
  netProfit = 0,
  currencySymbol = 'R$',
  platform,
  setPlatform,
  currency,
  setCurrency,
  onOpenAuthModal,
  onNavigateProfile,
  onOpenLanding,
  onOpenAdmin,
  onLogout
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = currentUser?.displayName 
    ? currentUser.displayName.slice(0, 2).toUpperCase() 
    : currentUser?.email 
      ? currentUser.email.slice(0, 2).toUpperCase() 
      : 'COM';

  const platforms: { id: Platform; label: string }[] = [
    { id: Platform.DROPSHIPPING, label: 'Dropshipping' },
    { id: Platform.SHOPEE, label: 'Shopee' },
    { id: Platform.MERCADO_LIVRE, label: 'Mercado Livre' },
    { id: Platform.TIKTOK_SHOP, label: 'TikTok Shop' },
  ];

  const isHealthyMargin = marginPercent >= 20;
  const isWarningMargin = marginPercent > 0 && marginPercent < 20;

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left Platform Switcher when in Ecom mode */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
        {setPlatform && (
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {platforms.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  platform === p.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Margem Líquida Badge, Currency & Avatar */}
      <div className="flex items-center gap-3">
        {/* Currency Switcher */}
        {setCurrency && (
          <select
            value={currency || 'BRL'}
            onChange={e => setCurrency(e.target.value as CurrencyCode)}
            className="hidden md:block bg-slate-100 border border-slate-200 text-xs font-black text-slate-700 px-2.5 py-1.5 rounded-xl cursor-pointer"
          >
            <option value="BRL">R$ BRL</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        )}

        {/* Margem Líquida Display Badge */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border shadow-2xs transition-all ${
          isHealthyMargin 
            ? 'bg-emerald-50 border-emerald-200/90 text-emerald-950' 
            : isWarningMargin 
              ? 'bg-amber-50 border-amber-200/90 text-amber-950' 
              : 'bg-rose-50 border-rose-200/90 text-rose-950'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isHealthyMargin ? 'bg-emerald-500 animate-pulse' : isWarningMargin ? 'bg-amber-500' : 'bg-rose-500'
          }`} />
          <div className="flex items-baseline gap-1.5">
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
              isHealthyMargin ? 'text-emerald-700' : isWarningMargin ? 'text-amber-700' : 'text-rose-700'
            }`}>
              Margem Líquida:
            </span>
            <span className="text-xs sm:text-sm font-extrabold">
              {marginPercent.toFixed(1)}%
            </span>
            {netProfit !== 0 && (
              <span className={`hidden lg:inline text-[11px] font-semibold ${
                isHealthyMargin ? 'text-emerald-700' : isWarningMargin ? 'text-amber-700' : 'text-rose-700'
              }`}>
                ({currencySymbol} {netProfit.toFixed(2)})
              </span>
            )}
          </div>
        </div>

        {/* Avatar / User Menu Dropdown */}
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {userInitials}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[120px] truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {currentUser.displayName || 'Lojista Conectado'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate font-medium">
                    {currentUser.email}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onNavigateProfile();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User size={15} className="text-slate-400" />
                    <span>Meu Perfil</span>
                  </button>

                  {onOpenLanding && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenLanding();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag size={15} className="text-slate-400" />
                      <span>Página de Vendas</span>
                    </button>
                  )}

                  {onOpenAdmin && (currentUser?.email === 'Betosouza3322@gmail.com' || 
                    currentUser?.email?.toLowerCase() === 'betosouza3322@gmail.com' ||
                    currentUser?.email === 'g2midiasoficial@gmail.com' || 
                    currentUser?.role === 'admin') && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-black text-amber-600 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Shield size={15} className="text-amber-500" />
                      <span>Painel Admin Pro</span>
                    </button>
                  )}
                </div>

                {onLogout && (
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={15} className="text-rose-500" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-3.5 py-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <LogIn size={14} />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </header>
  );
}
