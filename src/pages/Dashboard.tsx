import { motion } from 'framer-motion';
import { Users, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Contestant, Winner } from '../types';

export function Dashboard() {
  const [contestants] = useLocalStorage<Contestant[]>('contestants', []);
  const [winners] = useLocalStorage<Winner[]>('winners', []);

  const stats = [
    {
      label: 'Total Contestants',
      value: contestants.length,
      icon: Users,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      label: 'Total Winners',
      value: winners.length,
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      label: 'Remaining Prizes',
      value: Math.max(0, 3 - winners.length),
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/20',
    },
    {
      label: 'Success Rate',
      value: contestants.length > 0 ? `${((winners.length / contestants.length) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-500/20 to-rose-500/20',
    },
  ];

  const recentWinners = winners.slice(-3).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400 mb-8">Overview of your lucky draw contest</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} blur-xl group-hover:blur-2xl transition-all`}></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-r ${stat.bgColor} rounded-xl`}>
                      <Icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-cyan-400" />
                Recent Winners
              </h3>
              {recentWinners.length > 0 ? (
                <div className="space-y-3">
                  {recentWinners.map((winner, index) => (
                    <motion.div
                      key={winner.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                    >
                      <div>
                        <p className="text-white font-medium">{winner.name}</p>
                        <p className="text-gray-400 text-sm">{winner.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-semibold text-sm">{winner.prize}</p>
                        <p className="text-gray-500 text-xs">{new Date(winner.wonAt).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">No winners yet</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Contest Status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{winners.length} / 3 prizes awarded</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(winners.length / 3) * 100}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    ></motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20">
                    <span className="text-gray-300">Pulsar NS 125 (1)</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      winners.filter(w => w.prize === 'Pulsar NS 125').length > 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {winners.filter(w => w.prize === 'Pulsar NS 125').length > 0 ? 'Awarded' : 'Available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20">
                    <span className="text-gray-300">Pulsar NS 125 (2)</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      winners.filter(w => w.prize === 'Pulsar NS 125').length > 1
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {winners.filter(w => w.prize === 'Pulsar NS 125').length > 1 ? 'Awarded' : 'Available'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-blue-500/20">
                    <span className="text-gray-300">TVS Jupiter</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      winners.filter(w => w.prize === 'TVS Jupiter').length > 0
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {winners.filter(w => w.prize === 'TVS Jupiter').length > 0 ? 'Awarded' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
