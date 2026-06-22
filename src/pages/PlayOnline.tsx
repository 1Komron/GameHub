import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {GameBoard} from '../games/tic-tac-toe/components/GameBoard';
import {GameResultActions} from '../games/tic-tac-toe/components/GameResultActions';
import {TelegramTopSpacer} from '../shared/ui/TelegramTopSpacer';
import {TelegramBottomSpacer} from '../shared/ui/TelegramBottomSpacer';
import {useGameStore} from '../games/tic-tac-toe/store';
import {useRoomStore} from '../entities/room/model/store';
import {GlassCard} from '../shared/ui/GlassCard';
import {getEngineById} from '../shared/config/engines';
import {TicTacToeMove, TicTacToeVariant} from '../games/tic-tac-toe/engine';
import type { MatchStatus } from '../entities/game-engine/types';

export const PlayOnline: React.FC = () => {
    const navigate = useNavigate();
    const {initOnline, resetGame, engine, gameState, mySlot} = useGameStore();
    const roomMySlot = useRoomStore((state) => state.mySlot); // reactive

    useEffect(() => {
        resetGame();
        return () => {
            resetGame();
        };
    }, [resetGame]);

    useEffect(() => {
        const { room } = useRoomStore.getState();
        if (!room) {
            navigate('/');
            return;
        }
        if (roomMySlot === null) return; // wait until slot is known

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameEngine = getEngineById<any, TicTacToeMove, TicTacToeVariant>(room.gameId ?? '');
        if (gameEngine) {
            initOnline(gameEngine, roomMySlot);
        }
    }, [roomMySlot, initOnline, navigate]); // re-run when slot becomes available

    const status = engine && gameState ? engine.getStatus(gameState) : 'playing' as MatchStatus;
    const isGameOver = status === 'won' || status === 'draw';

    if (!engine || !gameState) return null;

    const currentSlot = engine.getCurrentSlot(gameState);
    const isMyTurn = currentSlot === mySlot;
    const winner = status === 'won' ? engine.getWinner(gameState) : null;
    const iWon = winner === mySlot;

    return (
        <div
            className="flex flex-col items-center justify-start h-screen max-w-md mx-auto w-full select-none relative overflow-hidden" style={{ overscrollBehavior: 'none' }}>
            <TelegramTopSpacer/>
            <main className="flex-1 flex flex-col items-center justify-center p-4 gap-2 w-full">
                <AnimatePresence mode="wait">
                    {!isGameOver ? (
                        <motion.div
                            key="turn"
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.95}}
                            className="w-full"
                        >
                            <GlassCard
                                className={`flex items-center justify-center py-4 px-6 border-2 transition-colors ${isMyTurn ? 'border-tg-primary bg-tg-primary/5' : 'border-transparent'}`}>

                                <div className="flex items-center gap-3">
                  <span className="text-tg-hint font-medium">
                    {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
                  </span>
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${currentSlot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>

                                        {currentSlot === 0 ? 'X' : 'O'}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, scale: 0.95}}
                            className="w-full"
                        >
                            <GlassCard className="flex items-center justify-center py-4 px-6">
                                <div className="flex items-center gap-3">
                                    {status === 'draw' ? (
                                        <span className="text-yellow-500 font-bold text-lg">Draw Game!</span>
                                    ) : (
                                        <>
                                            <div
                                                className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${(winner === 0) ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {winner === 0 ? 'X' : 'O'}
                                            </div>
                                            <span className="text-tg-hint font-medium">
                        {iWon ? 'You Win!' : `Player ${winner === 0 ? 'X' : 'O'} Wins!`}
                      </span>
                                        </>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <GameBoard />
                <GameResultActions
                  isVisible={isGameOver}
                  status={status}
                  winner={mySlot !== null ? (iWon ? mySlot : (mySlot === 0 ? 1 : 0)) : null}
                  mode="online"
                  isWinner={iWon}
                  onPlayAgain={() => {
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                  }}
                  onBackToMenu={() => {
                    resetGame();
                    const { room } = useRoomStore.getState();
                    const baseGameId = (room?.gameId ?? 'tic-tac-toe').replace('-shift', '');
                    useRoomStore.setState({ room: null, mySlot: null, matchId: null, isCreator: false });
                    navigate(`/game/${baseGameId}/mode`);
                  }}
                />
                <TelegramBottomSpacer />
            </main>
        </div>
    );
};