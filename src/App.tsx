/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import SegmentForm from './components/SegmentForm';
import TimerDisplay from './components/TimerDisplay';
import { Segment } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isStarted, setIsStarted] = useState(false);

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center py-12">
              <SegmentForm 
                segments={segments} 
                onUpdate={setSegments} 
                onStart={() => setIsStarted(true)} 
              />
            </div>
            
            {/* Footer / Branding */}
            <footer className="p-8 text-center text-zinc-600">
              <div className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.2em]">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Live Broadcast Console
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1"
          >
            <TimerDisplay 
              segments={segments} 
              onBack={() => setIsStarted(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

