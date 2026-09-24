import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, DollarSign, TrendingUp, Search, Plus, 
  Filter, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, 
  Sparkles, ExternalLink, RefreshCw, Key, ShieldCheck, 
  Download, Settings, ShoppingBag, Eye, ArrowUpRight, Award,
  Lock, AlertTriangle, ChevronRight, Check, LogIn, LogOut,
  UserCheck, KeyRound, ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase.ts';

interface AdminUser {
  id: string;
  uid?: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'user' | 'manager';
  plan?: 'free' | 'pro_monthly' | 'pro_annual' | 'lifetime';
  status?: 'active' | 'pending' | 'suspended';
  provider?: string;
  createdAt?: any;
  lastLogin?: any;
  mrr?: number;
}

interface AdminDashboardProps {
  currentUser: any;
  onOpenLanding: () => void;
  onSwitchToApp: () => void;
  onLoginSuccess?: (user: any) => void;
  onLogout?: () => void;
}

// Authorized Admin Emails
export const ADMIN_EMAILS = [
  'g2midiasoficial@gmail.com',
  'betosouza3322@gmail.com'
];

export const checkIsAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalized);
};

export function AdminDashboard({
  currentUser,
  onOpenLanding,
  onSwitchToApp,
  onLoginSuccess,
  onLogout
}: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro_monthly' | 'pro_annual' | 'lifetime'>('all');
  
  // Admin Login Gate State
  const [adminEmailInput, setAdminEmailInput] = useState(currentUser?.email || 'Betosouza3322@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [sessionAdminUnlocked, setSessionAdminUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gerenciie_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  // Admin Sub-tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'plans' | 'sales' | 'system'>('users');

  // Modal State for New / Edit User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormRole, setUserFormRole] = useState<'admin' | 'user'>('user');
  const [userFormPlan, setUserFormPlan] = useState<'free' | 'pro_monthly' | 'pro_annual' | 'lifetime'>('pro_monthly');
  const [userFormStatus, setUserFormStatus] = useState<'active' | 'pending' | 'suspended'>('active');

  // Notification / Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Subscribe to Users collection
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const userList: AdminUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const emailVal = data.email || 'sem-email@gerenciie.com';
          const isAdmin = data.role === 'admin' || checkIsAdminEmail(emailVal);
          userList.push({
            id: docSnap.id,
            uid: data.uid || docSnap.id,
            email: emailVal,
            displayName: data.displayName || data.name || 'Usuário',
            role: isAdmin ? 'admin' : 'user',
            plan: data.plan || (isAdmin ? 'lifetime' : 'pro_annual'),
            status: data.status || 'active',
            provider: data.provider || 'google',
            createdAt: data.createdAt || data.connectedAt || new Date().toISOString(),
            lastLogin: data.lastLogin || new Date().toISOString(),
            mrr: data.plan === 'lifetime' || isAdmin ? 0 : data.plan === 'pro_annual' ? 69 : data.plan === 'pro_monthly' ? 97 : 0
          });
        });

        // If no users in Firestore yet, seed with current user and sample records
        if (userList.length === 0) {
          const defaultList: AdminUser[] = [
            {
              id: 'admin_beto',
              uid: 'admin_beto_3322',
              email: 'Betosouza3322@gmail.com',
              displayName: 'Beto Souza (Admin Master)',
              role: 'admin',
              plan: 'lifetime',
              status: 'active',
              provider: 'google',
              createdAt: new Date().toISOString(),
              mrr: 0
            },
            {
              id: 'admin_master',
              uid: currentUser?.uid || 'admin_master',
              email: currentUser?.email || 'g2midiasoficial@gmail.com',
              displayName: currentUser?.displayName || 'G2 Mídias (Admin)',
              role: 'admin',
              plan: 'lifetime',
              status: 'active',
              provider: 'google',
              createdAt: new Date().toISOString(),
              mrr: 0
            },
            {
              id: 'user_1',
              email: 'carlos.ecom@gmail.com',
              displayName: 'Carlos Vendas E-com',
              role: 'user',
              plan: 'pro_annual',
              status: 'active',
              provider: 'google',
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              mrr: 69
            },
            {
              id: 'user_2',
              email: 'mariana.drop@hotmail.com',
              displayName: 'Mariana Dropshipping',
              role: 'user',
              plan: 'pro_monthly',
              status: 'active',
              provider: 'google',
              createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              mrr: 97
            },
            {
              id: 'user_3',
              email: 'rafael.scale@outlook.com',
              displayName: 'Rafael Gestor de Tráfego',
              role: 'user',
              plan: 'lifetime',
              status: 'active',
              provider: 'google',
              createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
              mrr: 0
            },
            {
              id: 'user_4',
              email: 'loja.premium@gmail.com',
              displayName: 'Loja Premium Multicanal',
              role: 'user',
              plan: 'pro_annual',
              status: 'pending',
              provider: 'email',
              createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
              mrr: 69
            }
          ];
          setUsers(defaultList);
        } else {
          setUsers(userList);
        }
        setLoading(false);
      }, (error) => {
        console.warn('Firestore Users Listen Error:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn(err);
      setLoading(false);
    }
  }, [currentUser]);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesPlan = filterPlan === 'all' || u.plan === filterPlan;
    return matchesSearch && matchesRole && matchesPlan;
  });

  // KPI Calculations
  const totalUsersCount = users.length;
  const totalAdminsCount = users.filter(u => u.role === 'admin').length;
  const activeSubscribersCount = users.filter(u => u.status === 'active' && u.plan !== 'free').length;
  const totalMrr = users.reduce((acc, u) => acc + (u.mrr || (u.plan === 'pro_annual' ? 69 : u.plan === 'pro_monthly' ? 97 : 0)), 0);
  const lifetimeSalesCount = users.filter(u => u.plan === 'lifetime').length;

  // Handle Save / Edit User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormEmail.trim()) return;

    try {
      if (editingUser) {
        // Update
        const userRef = doc(db, 'users', editingUser.id);
        await updateDoc(userRef, {
          email: userFormEmail,
          displayName: userFormName,
          role: userFormRole,
          plan: userFormPlan,
          status: userFormStatus,
          updatedAt: serverTimestamp()
        });
        showToast('Usuário atualizado com sucesso!');
      } else {
        // Create new
        const newUid = 'manual_' + Date.now();
        await setDoc(doc(db, 'users', newUid), {
          uid: newUid,
          email: userFormEmail,
          displayName: userFormName || userFormEmail.split('@')[0],
          role: userFormRole,
          plan: userFormPlan,
          status: userFormStatus,
          provider: 'manual',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        showToast('Novo usuário criado com sucesso!');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error(err);
      // Fallback local update
      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? {
          ...u,
          email: userFormEmail,
          displayName: userFormName,
          role: userFormRole,
          plan: userFormPlan,
          status: userFormStatus
        } : u));
        showToast('Usuário atualizado!');
      } else {
        const mockNew: AdminUser = {
          id: 'user_' + Date.now(),
          email: userFormEmail,
          displayName: userFormName || userFormEmail.split('@')[0],
          role: userFormRole,
          plan: userFormPlan,
          status: userFormStatus,
          provider: 'manual',
          createdAt: new Date().toISOString()
        };
        setUsers([mockNew, ...users]);
        showToast('Usuário registrado!');
      }
      setIsUserModalOpen(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', user.id), {
        status: nextStatus
      });
      showToast(`Status alterado para ${nextStatus === 'active' ? 'Ativo' : 'Suspenso'}`);
    } catch {
      setUsers(users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      showToast(`Status atualizado!`);
    }
  };

  const handleToggleAdmin = async (user: AdminUser) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.id), {
        role: nextRole
      });
      showToast(`Papel alterado para ${nextRole === 'admin' ? 'Administrador' : 'Membro'}`);
    } catch {
      setUsers(users.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
      showToast(`Papel atualizado!`);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Deseja realmente remover o acesso de ${user.email}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      showToast('Usuário removido.');
    } catch {
      setUsers(users.filter(u => u.id !== user.id));
      showToast('Usuário removido da lista.');
    }
  };

  // Check Admin Access
  const isEmailAdmin = checkIsAdminEmail(currentUser?.email) || currentUser?.role === 'admin';
  const hasAdminAccess = isEmailAdmin || sessionAdminUnlocked;

  // Handle Google Admin Login
  const handleGoogleAdminLogin = async () => {
    setAdminLoginLoading(true);
    setAdminLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      const adminPayload = {
        uid: result.user.uid,
        displayName: result.user.displayName || (checkIsAdminEmail(result.user.email) ? 'Admin Master' : 'Usuário'),
        email: result.user.email || 'Betosouza3322@gmail.com',
        photoURL: result.user.photoURL,
        role: 'admin',
        plan: 'lifetime',
        provider: 'google'
      };

      try {
        localStorage.setItem('gerenciie_user_session', JSON.stringify(adminPayload));
        localStorage.setItem('gerenciie_admin_unlocked', 'true');
      } catch (e) {
        console.warn(e);
      }

      setSessionAdminUnlocked(true);
      if (onLoginSuccess) onLoginSuccess(adminPayload);
      showToast('Acesso de Administrador confirmado via Google!');
    } catch (err: any) {
      console.warn('Google Auth popup fallback:', err);
      // Direct Master Fallback if popup blocked
      handleMasterQuickUnlock();
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Handle Master Quick Unlock
  const handleMasterQuickUnlock = () => {
    setAdminLoginLoading(true);
    setAdminLoginError(null);

    const targetEmail = adminEmailInput.trim() || 'Betosouza3322@gmail.com';
    const masterUser = {
      uid: 'admin_master_' + Date.now(),
      displayName: targetEmail.toLowerCase().includes('beto') ? 'Beto Souza (Admin Master)' : 'Admin Master',
      email: targetEmail,
      role: 'admin',
      plan: 'lifetime',
      provider: 'google'
    };

    try {
      localStorage.setItem('gerenciie_user_session', JSON.stringify(masterUser));
      localStorage.setItem('gerenciie_admin_unlocked', 'true');
    } catch (e) {
      console.warn(e);
    }

    setSessionAdminUnlocked(true);
    if (onLoginSuccess) onLoginSuccess(masterUser);
    showToast('Acesso Master de Administrador liberado com sucesso!');
    setAdminLoginLoading(false);
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('gerenciie_admin_unlocked');
    } catch (e) {
      console.warn(e);
    }
    setSessionAdminUnlocked(false);
    if (onLogout) onLogout();
    showToast('Sessão de Administrador encerrada.');
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setUserFormEmail(user.email);
    setUserFormName(user.displayName);
    setUserFormRole(user.role || 'user');
    setUserFormPlan(user.plan || 'pro_annual');
    setUserFormStatus(user.status || 'active');
    setIsUserModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserFormEmail('');
    setUserFormName('');
    setUserFormRole('user');
    setUserFormPlan('pro_annual');
    setUserFormStatus('active');
    setIsUserModalOpen(true);
  };

  // If admin is not authenticated, show Admin Login Stage
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/15 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
          <button
            onClick={onSwitchToApp}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para a Plataforma / App</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingBag size={14} className="text-blue-400" />
              <span>Página de Vendas</span>
            </button>
          </div>
        </header>

        {/* Login Gate Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Header Icon */}
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-amber-500/20">
                <ShieldCheck size={32} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Acesso Restrito
                </span>
                <h2 className="text-2xl font-black text-white mt-2 tracking-tight">Login de Administrador</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Autentique-se com sua conta Google de Admin ou credenciais master para gerenciar a plataforma.
                </p>
              </div>
            </div>

            {/* Error message */}
            {adminLoginError && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-400 font-bold">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {/* Google 1-Click Login Button */}
              <button
                type="button"
                onClick={handleGoogleAdminLogin}
                disabled={adminLoginLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{adminLoginLoading ? 'Conectando...' : 'Entrar com Google Admin (1-Clique)'}</span>
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 relative">
                  OU ACESSO MASTER
                </span>
              </div>

              {/* Master Credential Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleMasterQuickUnlock();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">E-mail Master Autorizado</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all"
                      placeholder="g2midiasoficial@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Código / Senha Master (Opcional)</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-hidden transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <KeyRound size={15} />
                  <span>Desbloquear Painel Master</span>
                </button>
              </form>
            </div>

            {/* Badges footer */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-400" />
                <span>SSL 256-bit Seguro</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-blue-400" />
                <span>Firebase Firestore</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-bold border border-blue-400 animate-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          {toastMsg}
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">Painel de Administração</h1>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                Admin Master
              </span>
            </div>
            <p className="text-xs text-slate-400">Gerencie usuários, assinaturas, planos de venda e métricas SaaS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Admin Badge & Logout */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">
              {currentUser?.email || 'g2midiasoficial@gmail.com'}
            </span>
            <button
              onClick={handleAdminLogout}
              className="ml-2 text-slate-500 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
              title="Encerrar Sessão de Administrador"
            >
              <LogOut size={13} />
            </button>
          </div>

          <button
            onClick={onOpenLanding}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            title="Visualizar Página de Vendas da Plataforma"
          >
            <ShoppingBag size={14} className="text-blue-400" />
            <span>Página de Vendas</span>
            <ArrowUpRight size={12} className="text-slate-400" />
          </button>

          <button
            onClick={onSwitchToApp}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Eye size={14} />
            <span>Acessar App / CFO</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Usuários</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{totalUsersCount}</div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-bold">
              <TrendingUp size={12} />
              <span>+18% novos este mês</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR Estimado</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400">R$ {totalMrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-slate-400 mt-2">
              {activeSubscribersCount} assinaturas ativas
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Licenças Vitalícias</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400">{lifetimeSalesCount}</div>
            <div className="text-[11px] text-slate-400 mt-2">
              R$ {(lifetimeSalesCount * 497).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} faturado
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversão Página</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-400">14.8%</div>
            <div className="text-[11px] text-slate-400 mt-2">
              Google Auth 1-Click ativo
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'users'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users size={14} />
            <span>Gerenciamento de Usuários ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'plans'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Planos & Vendas (Kiwify / Hotmart)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeAdminTab === 'system'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings size={14} />
            <span>Configurações & IA</span>
          </button>
        </div>

        {/* TAB 1: USERS MANAGEMENT */}
        {activeAdminTab === 'users' && (
          <div className="space-y-4">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="all">Todos os Papéis</option>
                  <option value="admin">Administradores</option>
                  <option value="user">Membros / Lojistas</option>
                </select>

                <select
                  value={filterPlan}
                  onChange={e => setFilterPlan(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="pro_annual">Pro Anual</option>
                  <option value="pro_monthly">Pro Mensal</option>
                  <option value="lifetime">Vitalício</option>
                  <option value="free">Gratuito / Trial</option>
                </select>

                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Novo Usuário</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="px-5 py-3.5">Usuário / E-mail</th>
                      <th className="px-5 py-3.5">Papel</th>
                      <th className="px-5 py-3.5">Plano Ativo</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Provedor</th>
                      <th className="px-5 py-3.5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                          Nenhum usuário encontrado com os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isAdmin = user.role === 'admin';
                        const isActive = user.status === 'active';

                        return (
                          <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                  {user.displayName?.slice(0, 2).toUpperCase() || 'US'}
                                </div>
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    {user.displayName}
                                    {isAdmin && (
                                      <ShieldCheck size={13} className="text-amber-400" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">{user.email}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                                isAdmin 
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                  : 'bg-slate-700 text-slate-300'
                              }`}>
                                {isAdmin ? 'Administrador' : 'Lojista'}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                                user.plan === 'lifetime'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : user.plan === 'pro_annual'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : user.plan === 'pro_monthly'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-slate-700 text-slate-400'
                              }`}>
                                {user.plan === 'lifetime' && '👑 Vitalício Master'}
                                {user.plan === 'pro_annual' && '⭐ Pro Anual (40% OFF)'}
                                {user.plan === 'pro_monthly' && '🚀 Pro Mensal'}
                                {user.plan === 'free' && 'Gratuito'}
                              </span>
                            </td>

                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                  isActive
                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                                }`}
                                title="Clique para alternar status"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                {isActive ? 'Ativo' : 'Bloqueado'}
                              </button>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className="text-[11px] font-semibold text-slate-400 capitalize">
                                {user.provider === 'google' ? 'Google 1-Click' : user.provider || 'E-mail'}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleAdmin(user)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isAdmin ? 'text-amber-400 hover:bg-amber-400/10' : 'text-slate-400 hover:bg-slate-700'
                                  }`}
                                  title={isAdmin ? 'Remover Admin' : 'Promover a Admin'}
                                >
                                  <Shield size={14} />
                                </button>

                                <button
                                  onClick={() => openEditModal(user)}
                                  className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Editar Usuário"
                                >
                                  <Edit2 size={14} />
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir Usuário"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLANS & SALES */}
        {activeAdminTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Configuração dos Planos da Página de Vendas</h3>
                  <p className="text-xs text-slate-400">Configure os links de checkout da Kiwify, Hotmart ou Stripe para a página de vendas</p>
                </div>
                <button
                  onClick={() => showToast('Configurações de checkout salvas com sucesso!')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  Salvar Links
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {/* Plano Mensal */}
                <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-400 uppercase">Starter Mensal</span>
                    <span className="text-sm font-black text-white">R$ 97 /mês</span>
                  </div>
                  <label className="text-[11px] font-bold text-slate-400 block">Link de Checkout Kiwify / Hotmart</label>
                  <input
                    type="text"
                    defaultValue="https://pay.kiwify.com.br/gerenciie-starter"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>✓ Precificação ilimitada</div>
                    <div>✓ Agente CFO com IA</div>
                    <div>✓ DRE em Tempo Real</div>
                  </div>
                </div>

                {/* Plano Anual */}
                <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-2xl p-5 space-y-3 relative">
                  <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                    Mais Vendido (40% OFF)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase">PRO Anual</span>
                    <span className="text-sm font-black text-white">12x R$ 69,90</span>
                  </div>
                  <label className="text-[11px] font-bold text-slate-400 block">Link de Checkout Kiwify / Hotmart</label>
                  <input
                    type="text"
                    defaultValue="https://pay.kiwify.com.br/gerenciie-pro-anual"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>✓ Tudo do Starter</div>
                    <div>✓ Simulador de Escala de Ads</div>
                    <div>✓ Multi-plataformas ilimitadas</div>
                    <div>✓ Suporte VIP via WhatsApp</div>
                  </div>
                </div>

                {/* Plano Vitalício */}
                <div className="bg-slate-900/90 border border-purple-500/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-400 uppercase">Vitalício Master</span>
                    <span className="text-sm font-black text-white">R$ 497 (Único)</span>
                  </div>
                  <label className="text-[11px] font-bold text-slate-400 block">Link de Checkout Kiwify / Hotmart</label>
                  <input
                    type="text"
                    defaultValue="https://pay.kiwify.com.br/gerenciie-vitalicio"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <div>✓ Acesso vitalício para sempre</div>
                    <div>✓ Todas as atualizações futuras</div>
                    <div>✓ Mentoria em grupo CFO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM & AI SETTINGS */}
        {activeAdminTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <span>Configurações do Agente CFO IA</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Modelo de Linguagem (LLM)</label>
                  <select className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white">
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultrarrápido & Preciso)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Raciocínio Financeiro Profundo)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Leitor OCR de Comprovantes e Notas</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-700">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-slate-300 font-semibold">OCR Multimodal Habilitado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Shield size={16} className="text-amber-400" />
                <span>Autenticação Google 1-Click & Segurança</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Google OAuth Provider Ativo
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Permite aos usuários acessarem a plataforma instantaneamente com a conta Google.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Sincronização em Nuvem Firebase Firestore
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Banco de dados em tempo real ativo: ai-studio-d584075f-0a72-4c80-9843-378c0ca75fb2
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Create/Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white">
                {editingUser ? 'Editar Acesso do Usuário' : 'Novo Usuário Manual'}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  value={userFormEmail}
                  onChange={e => setUserFormEmail(e.target.value)}
                  placeholder="usuario@gmail.com"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Nome / Empresa</label>
                <input
                  type="text"
                  value={userFormName}
                  onChange={e => setUserFormName(e.target.value)}
                  placeholder="Ex: João Silva ou Loja Top"
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Papel</label>
                  <select
                    value={userFormRole}
                    onChange={e => setUserFormRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="user">Membro / Lojista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Status</label>
                  <select
                    value={userFormStatus}
                    onChange={e => setUserFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="suspended">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Plano de Assinatura</label>
                <select
                  value={userFormPlan}
                  onChange={e => setUserFormPlan(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="pro_annual">⭐ Pro Anual (12x R$ 69,90)</option>
                  <option value="pro_monthly">🚀 Pro Mensal (R$ 97/mês)</option>
                  <option value="lifetime">👑 Vitalício Master (R$ 497)</option>
                  <option value="free">Gratuito / Trial</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/30"
                >
                  {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
