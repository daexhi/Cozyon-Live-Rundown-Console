import React, { useState } from 'react';
import { Plus, Trash2, Edit2, XCircle } from 'lucide-react';
import { Segment } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SegmentFormProps {
  segments: Segment[];
  onUpdate: (segments: Segment[]) => void;
  onStart: () => void;
}

export default function SegmentForm({ segments, onUpdate, onStart }: SegmentFormProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMinutes, setNewMinutes] = useState('');
  const [newSeconds, setNewSeconds] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;
    
    const totalSeconds = (parseInt(newMinutes) || 0) * 60 + (parseInt(newSeconds) || 0);
    if (totalSeconds <= 0) return;

    if (editingId) {
      onUpdate(segments.map(s => s.id === editingId ? {
        ...s,
        label: newLabel,
        description: newDescription,
        durationSeconds: totalSeconds,
      } : s));
      setEditingId(null);
    } else {
      const newSegment: Segment = {
        id: crypto.randomUUID(),
        label: newLabel,
        description: newDescription,
        durationSeconds: totalSeconds,
      };
      onUpdate([...segments, newSegment]);
    }
    
    setNewLabel('');
    setNewDescription('');
    setNewMinutes('');
    setNewSeconds('');
  };

  const startEdit = (segment: Segment) => {
    setEditingId(segment.id);
    setNewLabel(segment.label);
    setNewDescription(segment.description || '');
    setNewMinutes(Math.floor(segment.durationSeconds / 60).toString());
    setNewSeconds((segment.durationSeconds % 60).toString());
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewLabel('');
    setNewDescription('');
    setNewMinutes('');
    setNewSeconds('');
  };

  const removeSegment = (id: string) => {
    onUpdate(segments.filter(s => s.id !== id));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tighter text-white">Live Rundown Cozyon</h1>
        <p className="text-zinc-400">Configure your session segments and durations.</p>
      </div>

      <form onSubmit={handleSubmit} className={`space-y-3 p-4 rounded-xl border transition-all ${editingId ? 'bg-zinc-900 border-red-500/50 ring-1 ring-red-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {editingId ? 'Edit Segment' : 'New Segment'}
          </span>
          {editingId && (
            <button 
              type="button" 
              onClick={cancelEdit}
              className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs font-medium"
            >
              <XCircle size={14} /> Cancel Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Segment Name (e.g. Opening)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
            <input
              type="number"
              placeholder="Sec"
              min="0"
              max="59"
              value={newSeconds}
              onChange={(e) => setNewSeconds(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className={`${editingId ? 'bg-white text-black hover:bg-zinc-200' : 'bg-red-600 hover:bg-red-500 text-white'} font-medium rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 transition-colors`}
          >
            {editingId ? 'Update' : <><Plus size={18} /> Add</>}
          </button>
        </div>
        <div>
          <textarea
            placeholder="Description / Host notes (Optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
          />
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Segments</h2>
          {segments.length > 0 && (
            <div className="text-xs font-mono text-zinc-500">
              Total Duration: <span className="text-white font-bold">
                {Math.floor(segments.reduce((acc, s) => acc + s.durationSeconds, 0) / 60)}m {segments.reduce((acc, s) => acc + s.durationSeconds, 0) % 60}s
              </span>
            </div>
          )}
        </div>
        <AnimatePresence initial={false}>
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group"
            >
              <div className="text-zinc-600 font-mono text-xs w-4 self-start mt-1">{index + 1}</div>
              <div className="flex-1 space-y-0.5 min-w-0">
                <div className="font-medium text-white break-words">{segment.label}</div>
                {segment.description && (
                  <div className="text-sm text-zinc-500 whitespace-pre-wrap break-words">{segment.description}</div>
                )}
              </div>
              <div className="font-mono text-red-500 tabular-nums font-bold">
                {Math.floor(segment.durationSeconds / 60)}:{(segment.durationSeconds % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(segment)}
                  className="text-zinc-600 hover:text-white p-2 rounded-md transition-colors"
                  title="Edit segment"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => removeSegment(segment.id)}
                  className="text-zinc-600 hover:text-red-400 p-2 rounded-md transition-colors"
                  title="Remove segment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {segments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pt-4"
        >
          <button
            onClick={onStart}
            className="w-full bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
          >
            START COUNTDOWN
          </button>
        </motion.div>
      )}
    </div>
  );
}
