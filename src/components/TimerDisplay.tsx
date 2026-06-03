import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, ChevronLeft } from 'lucide-react';
import { Segment, TimerStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TimerDisplayProps {
  segments: Segment[];
  onBack: () => void;
}

export default function TimerDisplay({ segments, onBack }: TimerDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(segments[0]?.durationSeconds || 0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSegment = segments[currentIndex];
  const isLastSegment = currentIndex === segments.length - 1;

  useEffect(() => {
    if (status === 'running' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isLastSegment) {
        // Auto advance or pause? Typically for live show we might want to alert then user advances
        // But let's handle auto-next for better flow
        nextSegment();
      } else {
        setStatus('finished');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeLeft, currentIndex]);

  const toggleTimer = () => {
    if (status === 'running') setStatus('paused');
    else setStatus('running');
  };

  const nextSegment = () => {
    if (!isLastSegment) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(segments[currentIndex + 1].durationSeconds);
      setStatus('running');
    }
  };

  const resetTimer = () => {
    setTimeLeft(currentSegment.durationSeconds);
    setStatus('idle');
  };

  const repeatSession = () => {
    setCurrentIndex(0);
    setTimeLeft(segments[0].durationSeconds);
    setStatus('running');
  };

  const jumpToSegment = (index: number) => {
    setCurrentIndex(index);
    setTimeLeft(segments[index].durationSeconds);
    setStatus('running');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Warning states
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isCritical = timeLeft <= 10;

  const getBackgroundColor = () => {
    if (status === 'finished') return 'bg-zinc-900 border-zinc-800';
    if (isCritical) return 'bg-red-950/40 border-red-500/50';
    if (isWarning) return 'bg-yellow-950/40 border-yellow-500/50';
    return 'bg-zinc-900 border-zinc-800';
  };

  const getTextColor = () => {
    if (isCritical) return 'text-red-500';
    if (isWarning) return 'text-yellow-500';
    return 'text-white';
  };

  return (
    <div className={`fixed inset-0 flex transition-colors duration-500 ${isCritical ? 'bg-red-950/20' : isWarning ? 'bg-yellow-950/10' : 'bg-black'}`}>
      {/* Sidebar List */}
      <div className="hidden lg:flex w-80 bg-zinc-950 border-r border-zinc-800 flex-col py-8 overflow-hidden">
        <div className="px-6 mb-8 flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Live Rundown Cozyon</h3>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-hide">
          {segments.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => jumpToSegment(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1 group ${
                idx === currentIndex 
                ? 'bg-red-600/10 border-red-500/50' 
                : idx < currentIndex 
                  ? 'bg-zinc-900/30 border-zinc-800 opacity-50' 
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase tracking-widest ${idx === currentIndex ? 'text-red-500' : 'text-zinc-600'}`}>
                  Segment {idx + 1}
                </span>
                <span className={`font-mono text-xs ${idx === currentIndex ? 'text-white' : 'text-zinc-500'}`}>
                  {formatTime(s.durationSeconds)}
                </span>
              </div>
              <div className={`font-bold transition-colors ${idx === currentIndex ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                {s.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Area */}
      <div className="flex-1 flex flex-col items-center overflow-hidden relative">
        <div className="lg:hidden absolute top-6 left-6 z-10">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </div>

        <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center space-y-4 md:space-y-6 px-4 py-4 md:py-6">
          {/* Current Segment Info */}
          <div className="text-center space-y-2 w-full">
            <motion.div
              key={currentSegment?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[9px] font-mono uppercase tracking-[0.2em] border border-zinc-700">
                  Segment {currentIndex + 1}/{segments.length}
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight break-words px-4">
                  {currentSegment?.label}
                </h2>
              </div>
              {currentSegment?.description && (
                <p className="text-sm md:text-base text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap">
                  {currentSegment.description}
                </p>
              )}
            </motion.div>
          </div>

          {/* Big Timer */}
          <div className={`relative w-full max-w-2xl flex-1 min-h-0 max-h-[45vh] flex items-center justify-center rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all duration-500 shadow-2xl overflow-hidden ${getBackgroundColor()}`}>
            <div className={`font-mono text-6xl sm:text-8xl md:text-[8rem] lg:text-[12rem] font-bold tabular-nums leading-none tracking-tighter transition-colors duration-300 ${getTextColor()}`}>
              {formatTime(timeLeft)}
            </div>
            
            {status === 'paused' && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-white text-xl font-bold tracking-widest uppercase">PAUSED</span>
              </div>
            )}

            {status === 'finished' && (
              <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="space-y-1">
                  <span className="text-red-500 text-[10px] font-mono uppercase tracking-[0.3em]">Session Over</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tighter">Live Session Complete</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px]">
                  <button
                    onClick={repeatSession}
                    className="flex-1 bg-white text-black text-xs font-bold py-3 rounded-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} /> REPEAT
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 bg-zinc-800 text-white text-xs font-bold py-3 rounded-lg hover:bg-zinc-700 transition-all"
                  >
                    END SESSION
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 md:gap-8">
            <button
              onClick={resetTimer}
              className="p-2 md:p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
              title="Reset segment"
            >
              <RotateCcw size={24} />
            </button>

            <button
              onClick={toggleTimer}
              disabled={status === 'finished'}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all ${
                status === 'running' 
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                  : 'bg-white text-black hover:bg-zinc-200'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95`}
            >
              {status === 'running' ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="translate-x-1" fill="currentColor" />}
            </button>

            <button
              onClick={nextSegment}
              disabled={isLastSegment}
              className="p-2 md:p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Skip to next"
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Upcoming */}
          {!isLastSegment && (
            <div className="w-full max-w-sm bg-zinc-900/40 p-2 px-4 rounded-xl border border-zinc-800/50 flex items-center justify-between">
              <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">NEXT</span>
              <span className="font-semibold text-xs text-zinc-300 truncate px-4">{segments[currentIndex + 1]?.label}</span>
              <span className="font-mono text-zinc-500 text-xs text-right shrink-0">
                {formatTime(segments[currentIndex + 1]?.durationSeconds)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
