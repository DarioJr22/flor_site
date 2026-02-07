import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  UtensilsCrossed,
  Megaphone,
  ShoppingBag,
  Star,
  Users,
  LogOut,
  Home,
  Loader2,
} from 'lucide-react';
import { MenuManager } from './MenuManager';
import { PromoBannersManager } from './PromoBannersManager';
import { OrdersManager } from './OrdersManager';
import { ReviewsManager } from './ReviewsManager';
import { LeadsManager } from './LeadsManager';

const tabs = [
  { id: 'menu',    label: 'Cardápio',   icon: UtensilsCrossed },
  { id: 'promos',  label: 'Promoções',  icon: Megaphone },
  { id: 'orders',  label: 'Pedidos',    icon: ShoppingBag },
  { id: 'reviews', label: 'Avaliações', icon: Star },
  { id: 'leads',   label: 'Leads',      icon: Users },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('menu');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/admin/login');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'menu':    return <MenuManager />;
      case 'promos':  return <PromoBannersManager />;
      case 'orders':  return <OrdersManager />;
      case 'reviews': return <ReviewsManager />;
      case 'leads':   return <LeadsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌺</span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-gray-900">
              Painel Admin
            </h1>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
          >
            <Home size={14} /> Ver Site
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
          >
            {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            Sair
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto px-4 sm:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{renderActiveTab()}</main>
    </div>
  );
}
