import React from 'react';
import { Loader2, ShieldCheck, DoorOpen } from 'lucide-react';
import { useAppContext } from '../../app/lib/auth/context';

interface WaitingRoomProps {
  status: 'Waiting' | 'Denied' | 'Ended';
  onLeave: () => void;
}

export default function WaitingRoom({ status, onLeave }: WaitingRoomProps) {
  const { isDark } = useAppContext();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
      <div className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl text-center space-y-6 ${
          isDark 
            ? "bg-slate-900 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
            : "bg-white border-slate-200"
        }`}>
        
        {status === 'Waiting' && (
            <>
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 mb-6 relative">
                    <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400/20"></div>
                    <Loader2 className="w-8 h-8 animate-spin relative z-10" />
                </div>
                <div>
                    <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Waiting for Host
                    </h2>
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        You have joined the lobby. The interview will begin as soon as the host admits you into the workspace.
                    </p>
                </div>
            </>
        )}

        {status === 'Denied' && (
             <>
                 <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-rose-500/20 text-rose-400 mb-6">
                     <ShieldCheck className="w-8 h-8" />
                 </div>
                 <div>
                     <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                         Access Denied
                     </h2>
                     <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                         The host has declined your request to join this session.
                     </p>
                 </div>
             </>
        )}

        {status === 'Ended' && (
             <>
                 <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-slate-500/20 text-slate-400 mb-6">
                     <DoorOpen className="w-8 h-8" />
                 </div>
                 <div>
                     <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                         Session Ended
                     </h2>
                     <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                         This interview session has been concluded by the host.
                     </p>
                 </div>
             </>
        )}

        <button
          onClick={onLeave}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            isDark 
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          }`}
        >
          Leave Lobby
        </button>
      </div>
    </div>
  );
}
