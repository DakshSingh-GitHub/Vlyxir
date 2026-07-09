import React from 'react';
import { Gavel, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAppContext } from '../../app/lib/auth/context';
import { InterviewVerdict } from '../../app/lib/types/interview';

interface VerdictSelectorProps {
  verdict: InterviewVerdict;
  setVerdict: (verdict: InterviewVerdict) => void;
  onEndInterview: () => void;
}

export default function VerdictSelector({ verdict, setVerdict, onEndInterview }: VerdictSelectorProps) {
  const { isDark } = useAppContext();

  const options: { value: InterviewVerdict; label: string; icon: React.ReactNode; colorClass: string }[] = [
    { value: 'Accepted', label: 'Accept', icon: <CheckCircle2 className="w-4 h-4" />, colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20' },
    { value: 'Rejected', label: 'Reject', icon: <XCircle className="w-4 h-4" />, colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' },
    { value: 'Pending', label: 'Pending', icon: <Clock className="w-4 h-4" />, colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20' },
  ];

  return (
    <div className={`p-4 rounded-2xl border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Gavel className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Evaluation
            </h3>
        </div>
      </div>
      
      <div className="flex gap-2 mb-6">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setVerdict(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-semibold transition-all ${
              verdict === opt.value
                ? `${opt.colorClass} border-opacity-50 ring-2 ring-opacity-50 ${opt.value === 'Accepted' ? 'ring-emerald-500' : opt.value === 'Rejected' ? 'ring-rose-500' : 'ring-amber-500'}`
                : isDark
                    ? "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={onEndInterview}
        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all active:scale-95 ${
            isDark 
                ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-rose-500/25" 
                : "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/30"
        }`}
      >
        <XCircle className="w-5 h-5" />
        End Interview
      </button>
    </div>
  );
}
