import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { onPresenceMessage } from '../../shared/api/presenceSocket';
import { useRoomStore } from '../../entities/room/model/store';
import { Button } from '../../shared/ui/Button';

export const InviteHandler: React.FC = () => {
  const navigate = useNavigate();
  const { joinRoomById } = useRoomStore();

  useEffect(() => {
    return onPresenceMessage((data) => {
      if (data.type === 'INVITE') {
        const { matchId, fromName, fromUserId } = data;
        
        toast.custom((t) => (
          <div className="w-full max-w-md bg-tg-secondary border border-tg-border rounded-xl shadow-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">
                {fromName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{fromName} позвал тебя в игру</p>
                <p className="text-xs text-tg-hint">ID: {fromUserId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={async () => {
                  try {
                    await joinRoomById(matchId);
                    toast.dismiss(t);
                    navigate(`/lobby/${matchId}`);
                  } catch (error) {
                    console.error(error);
                    toast.error('Не удалось присоединиться к матчу');
                  }
                }}
              >
                Принять
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1" 
                onClick={() => toast.dismiss(t)}
              >
                Отклонить
              </Button>
            </div>
          </div>
        ), {
            duration: 10000,
            position: 'top-center'
        });
      }
    });
  }, [navigate, joinRoomById]);

  return null;
};
