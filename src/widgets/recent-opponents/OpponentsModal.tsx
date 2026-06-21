import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { RecentOpponent } from '../../entities/user/types';
import { getRecentOpponents, inviteToMatch } from '../../shared/api/users/recentOpponents';
import { Button } from '../../shared/ui/Button';

interface OpponentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMatchId: string;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export const OpponentsModal: React.FC<OpponentsModalProps> = ({ isOpen, onClose, currentMatchId }) => {
  const [opponents, setOpponents] = useState<RecentOpponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'opponents' | 'friends'>('opponents');
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);

  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const loadMore = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setLoading(true);
    try {
      const data = await getRecentOpponents(page, 10);
      setOpponents((prev) => [...prev, ...data.content]);
      setHasMore(data.pageNumber < data.totalPages);
      setPage(data.pageNumber + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'opponents' && opponents.length === 0) {
      loadMore();
    }
  }, [isOpen, activeTab]);

  const handleInvite = async (opponent: RecentOpponent) => {
    try {
        await inviteToMatch(currentMatchId, opponent.userId);
        toast.success('Приглашение отправлено');
        onClose();
    } catch (error) {
        console.error(error);
        toast.error('Не удалось отправить приглашение');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-tg-secondary border border-tg-border rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[80vh]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Соперники</h2>
              <button onClick={onClose} className="text-tg-hint hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex gap-2 mb-6 border-b border-tg-border">
              <button
                onClick={() => setActiveTab('opponents')}
                className={`pb-2 px-1 text-sm font-medium ${activeTab === 'opponents' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-tg-hint'}`}
              >
                Соперники
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`pb-2 px-1 text-sm font-medium ${activeTab === 'friends' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-tg-hint'}`}
              >
                Друзья
              </button>
            </div>

            {activeTab === 'opponents' ? (
              <div className="flex flex-col gap-3">
                {opponents.map((opponent) => (
                  <div key={opponent.userId} className="flex items-center justify-between p-3 bg-tg-bg rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-sm font-semibold">{getInitials(opponent.name)}</span>
                        {opponent.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-tg-bg" />
                        )}
                      </div>
                      <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate">{opponent.name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] ${opponent.isOnline ? 'text-green-400' : 'text-tg-hint'}`}>
                              {opponent.isOnline ? 'в сети' : 'не в сети'}
                            </span>
                            <span className="text-[10px] text-tg-hint/40">•</span>
                            <p className="text-[10px] text-tg-hint">Играли {formatRelativeTime(opponent.lastPlayedAt)}</p>
                          </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-500 text-blue-400 flex-shrink-0" onClick={() => handleInvite(opponent)}>
                      Позвать
                    </Button>
                  </div>
                ))}
                <div ref={sentinelRef} style={{ height: 1 }} />
                {loading && <p className="text-center text-xs text-tg-hint">Загрузка...</p>}
                {!loading && opponents.length === 0 && <p className="text-center text-xs text-tg-hint py-4">Пока нет соперников</p>}
              </div>
            ) : (
              <p className="text-center text-tg-hint py-8">Скоро</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
