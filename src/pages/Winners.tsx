import { motion } from 'framer-motion';
import { Trophy, Calendar, Mail, Phone, Award, Download, Sparkles } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Winner } from '../types';

export function Winners() {
  const [winners] = useLocalStorage<Winner[]>('winners', []);

  const exportWinners = () => {
    const dataStr = JSON.stringify(winners, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `winners_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Winners History</h2>
            <p className="text-gray-400">View all lucky draw winners</p>
          </div>
          {winners.length > 0 && (
            <motion.button
              onClick={exportWinners}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
            >
              <Download className="w-5 h-5" />
              Export Data
            </motion.button>
          )}
        </div>

        {winners.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-6 py-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{winner.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(winner.wonAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
                          <Award className="w-3 h-3" />
                          Winner #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                      <p className="text-gray-400 text-xs mb-1">Prize Won</p>
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {winner.prize}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-400 text-xs mb-0.5">Email</p>
                          <p className="text-white text-sm truncate">{winner.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                          <p className="text-white text-sm">{winner.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-600/10 blur-xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-16 text-center">
              <Trophy className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">No Winners Yet</h3>
              <p className="text-gray-400 mb-6">
                Start the draw to select your first lucky winner
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg text-gray-500 text-sm">
                <Sparkles className="w-4 h-4" />
                Head to the Draw Arena to begin
              </div>
            </div>
          </motion.div>
        )}

        {winners.length > 0 && winners.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: winners.length * 0.1 + 0.2, duration: 0.5 }}
            className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
          >
            <p className="text-cyan-400 text-sm text-center">
              <Trophy className="w-4 h-4 inline mr-2" />
              {3 - winners.length} {3 - winners.length === 1 ? 'prize' : 'prizes'} remaining to be awarded
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
