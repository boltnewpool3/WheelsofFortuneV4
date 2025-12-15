import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, AlertCircle, RefreshCw, Bike } from 'lucide-react';
import { Contestant, ContestData, DrawResult, Winner } from '../types';
import { loadContestData, executeLocalDraw, getLocalDrawResults, saveDrawResults } from '../services/drawEngine';

export function DrawArena() {
  const [contestData, setContestData] = useState<ContestData | null>(null);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [currentDrawNumber, setCurrentDrawNumber] = useState(0);

  const vehicleImages: Record<string, string> = {
    'Pulsar NS 125': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600',
    'TVS Jupiter': 'https://images.pexels.com/photos/3862627/pexels-photo-3862627.jpeg?auto=compress&cs=tinysrgb&w=600',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadContestData();
      setContestData(data);

      const results = getLocalDrawResults();
      setDrawResults(results);

      const completedWinners: Winner[] = results
        .filter(draw => draw.status === 'completed' && draw.winner_id)
        .map(draw => ({
          id: draw.winner_id!,
          name: draw.winner_name || '',
          department: data.contestants.find(c => c.id === draw.winner_id)?.department || '',
          supervisor: data.contestants.find(c => c.id === draw.winner_id)?.supervisor || '',
          prize: draw.prize,
          winningTicket: draw.winning_ticket || '',
          wonAt: draw.drawn_at || '',
        }));

      setWinners(completedWinners);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const completedDraws = drawResults.filter(d => d.status === 'completed').length;
  const canDraw = completedDraws < 3 && !isSpinning;

  const handleDraw = async () => {
    if (!canDraw || !contestData) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedWinner(null);
    setError('');

    try {
      const drawNumber = completedDraws + 1;
      setCurrentDrawNumber(drawNumber);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const { ticketNumber, contestant } = executeLocalDraw(
        drawNumber,
        contestData.contestants,
        drawResults
      );

      const drawDef = contestData.draws.find(d => d.drawNumber === drawNumber);
      const newWinner: Winner = {
        id: contestant.id,
        name: contestant.name,
        department: contestant.department,
        supervisor: contestant.supervisor,
        prize: drawDef?.prize || '',
        winningTicket: ticketNumber,
        wonAt: new Date().toISOString(),
      };

      const newDrawResult: DrawResult = {
        id: `draw-${drawNumber}`,
        draw_number: drawNumber,
        prize: drawDef?.prize || '',
        winning_ticket: ticketNumber,
        winner_id: contestant.id,
        winner_name: contestant.name,
        status: 'completed',
        drawn_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const updatedResults = [...drawResults, newDrawResult];
      saveDrawResults(updatedResults);
      setDrawResults(updatedResults);

      setWinners([...winners, newWinner]);
      setSelectedWinner(newWinner);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draw failed');
    } finally {
      setIsSpinning(false);
      setShowResult(true);
    }
  };

  const resetDraw = () => {
    setShowResult(false);
    setSelectedWinner(null);
  };

  if (!contestData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  const currentPrize = drawResults[completedDraws]?.prize || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Draw Arena</h2>
        <p className="text-gray-400 mb-8">3 draws, 2 Pulsar NS 125s, 1 TVS Jupiter</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {drawResults.map(draw => (
            <motion.div
              key={draw.draw_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">Draw {draw.draw_number}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    draw.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {draw.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {draw.status === 'completed' && draw.winning_ticket ? (
                  <div className="space-y-3">
                    <img
                      src={vehicleImages[draw.prize]}
                      alt={draw.prize}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Prize</p>
                      <p className="text-cyan-400 font-bold">{draw.prize}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Winning Ticket</p>
                      <p className="text-white font-bold">#{draw.winning_ticket}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Winner</p>
                      <p className="text-blue-400 font-bold">{draw.winner_name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-gray-600" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl">
              <div className="flex items-center justify-center mb-8">
                <motion.div
                  animate={
                    isSpinning
                      ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={
                    isSpinning
                      ? {
                          rotate: { duration: 0.5, repeat: Infinity, ease: 'linear' },
                          scale: { duration: 0.5, repeat: Infinity },
                        }
                      : {}
                  }
                  className="relative"
                >
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                    <div className="w-56 h-56 rounded-full bg-gray-900 flex items-center justify-center border-4 border-cyan-400/30">
                      {isSpinning ? (
                        <Sparkles className="w-20 h-20 text-cyan-400" />
                      ) : (
                        <Trophy className="w-20 h-20 text-cyan-400" />
                      )}
                    </div>
                  </div>
                  {isSpinning && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400"
                    ></motion.div>
                  )}
                </motion.div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm mb-2">Draw {completedDraws + 1}</p>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  {currentPrize || 'All prizes awarded!'}
                </h3>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {!canDraw && !error && (
                <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <p className="text-yellow-400 text-sm">
                    {completedDraws >= 3
                      ? 'All prizes have been awarded!'
                      : 'Draw in progress...'}
                  </p>
                </div>
              )}

              <motion.button
                onClick={handleDraw}
                disabled={!canDraw || isSpinning}
                whileHover={canDraw && !isSpinning ? { scale: 1.02 } : {}}
                whileTap={canDraw && !isSpinning ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                  canDraw && !isSpinning
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Drawing...
                  </span>
                ) : (
                  'Start Draw'
                )}
              </motion.button>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-1">Total Tickets</p>
                  <p className="text-white font-bold text-lg">
                    {contestData.contestants.reduce((sum, c) => sum + c.tickets.length, 0)}
                  </p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-1">Draws Done</p>
                  <p className="text-cyan-400 font-bold text-lg">{completedDraws}/3</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-1">Remaining</p>
                  <p className="text-blue-400 font-bold text-lg">{3 - completedDraws}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl"></div>
            <div className="relative bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-gray-700/50 shadow-2xl h-full">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-400" />
                Winner Announcement
              </h3>

              <AnimatePresence mode="wait">
                {showResult && selectedWinner ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50"
                    >
                      <Trophy className="w-16 h-16 text-white" />
                    </motion.div>

                    <motion.h4
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      Congratulations!
                    </motion.h4>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-6"
                    >
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        {selectedWinner.name}
                      </p>
                      <p className="text-gray-400 text-sm mb-1">{selectedWinner.department} - {selectedWinner.supervisor}</p>
                      <p className="text-gray-400 text-sm">Ticket #{selectedWinner.winningTicket}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 mb-6"
                    >
                      <p className="text-gray-400 text-sm mb-1">Prize Won</p>
                      <p className="text-2xl font-bold text-cyan-400">{selectedWinner.prize}</p>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      onClick={resetDraw}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                      Draw Again
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    <Sparkles className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 text-lg">
                      {isSpinning ? 'Selecting a winner...' : 'Click "Start Draw" to begin'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
