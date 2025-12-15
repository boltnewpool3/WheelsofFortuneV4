import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Sparkles, Users, Trophy, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

type PageType = 'dashboard' | 'draw' | 'contestants' | 'winners';

interface LayoutNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative">{children}</div>
    </div>
  );
}

export function LayoutNav({ currentPage, onNavigate }: LayoutNavProps) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'draw' as PageType, label: 'Draw Arena', icon: Sparkles },
    { id: 'contestants' as PageType, label: 'Contestants', icon: Users },
    { id: 'winners' as PageType, label: 'Winners', icon: Trophy },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-gray-900/50 backdrop-blur-xl border-b border-gray-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Wheels of Fortune 2.0
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}

            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4 flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export function useNavigation() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  return {
    currentPage,
    navigate: setCurrentPage,
  };
}
