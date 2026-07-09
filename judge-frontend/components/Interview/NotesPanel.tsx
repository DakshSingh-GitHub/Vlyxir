import React from 'react';
import { FileText } from 'lucide-react';
import { useAppContext } from '../../app/lib/auth/context';

interface NotesPanelProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export default function NotesPanel({ notes, setNotes }: NotesPanelProps) {
  const { isDark } = useAppContext();

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
      <div className={`px-4 py-3 flex items-center gap-2 border-b ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-100 bg-slate-50"}`}>
        <FileText className="w-4 h-4 text-emerald-500" />
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Interviewer Notes
        </h3>
        <span className="ml-auto text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">PRIVATE</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Take private notes during the interview here. The candidate cannot see this."
        className={`flex-1 p-4 resize-none outline-none font-sans text-sm ${
            isDark 
                ? "bg-transparent text-slate-300 placeholder:text-slate-600" 
                : "bg-transparent text-slate-700 placeholder:text-slate-400"
        }`}
      />
    </div>
  );
}
