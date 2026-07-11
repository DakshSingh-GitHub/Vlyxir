"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Video, PlayCircle, History, Clock } from "lucide-react";
import { useAppContext } from "../../lib/auth/context";
import { useAuth } from "../../lib/auth/auth-context";
import { createInterviewSession, getActiveSessionsForHost, getPastSessionsForHost, getSessionDetails, getHostProfile } from "../../lib/api/interview";
import { InterviewSession } from "../../lib/types/interview";
import LoginPrompt from "../../../components/Auth/LoginPrompt";

export default function InterviewDashboard() {
  const { isDark } = useAppContext();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [activeSessions, setActiveSessions] = useState<InterviewSession[]>([]);
  const [pastSessions, setPastSessions] = useState<InterviewSession[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    sessionId: string;
    hostName: string;
    hostAvatar: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      getActiveSessionsForHost(user.id).then(setActiveSessions);
      getPastSessionsForHost(user.id).then(setPastSessions);
    }
  }, [user]);

  const handleCreateSession = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const session = await createInterviewSession(user.id);
      router.push(`/interview/${session.id}`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setRoomError("Please enter a room code or link");
      return;
    }
    setRoomError("");
    setIsJoining(true);
    
    // Extract UUID from link if pasted
    let cleanedId = roomCode.trim();
    try {
      if (cleanedId.includes("/interview/")) {
        const parts = cleanedId.split("/interview/");
        cleanedId = parts[parts.length - 1];
      }
    } catch (e) {
      // Fallback to raw text
    }

    try {
      const session = await getSessionDetails(cleanedId);
      if (!session) {
        setRoomError("Session not found or invalid.");
        setIsJoining(false);
        return;
      }
      
      const hostProfile = await getHostProfile(session.host_uuid);
      
      setConfirmModalData({
        sessionId: cleanedId,
        hostName: hostProfile?.full_name || hostProfile?.username || "Unknown Host",
        hostAvatar: hostProfile?.avatar_url || ""
      });
    } catch (err) {
      console.error(err);
      setRoomError("Failed to fetch session details.");
    }
    setIsJoining(false);
  };

  if (isAuthLoading) return null;

  if (!user) {
    return (
        <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
            <LoginPrompt title="Host an Interview" description="Sign in to create and manage interview sessions." nextPath="/interview" />
        </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] pb-12 ${isDark ? "text-white" : "text-slate-900"}`}>
      <div className="w-[92vw] max-w-[92vw] mx-auto px-4 md:px-0 space-y-10 mt-8">
        
        {/* Header */}
        <div className="flex flex-col items-start gap-2">
            <h1 className={`text-3xl md:text-4xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r ${isDark ? "from-white via-slate-300 to-indigo-400" : "from-slate-900 via-slate-700 to-indigo-600"}`}>
                Interview <span className={isDark ? "text-indigo-400" : "text-indigo-650"}>Dashboard</span>
            </h1>
            <p className={`text-xs md:text-sm font-semibold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Host technical interviews, collaborate in real-time, and evaluate candidates.
            </p>
        </div>

        {/* Action Grid (Hero Action Hub) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card A (Host Side) */}
            <div className={`relative p-[1px] rounded-3xl overflow-hidden group transition-all duration-300 hover:shadow-indigo-500/10 ${
                isDark 
                    ? "bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-transparent hover:from-indigo-500/50" 
                    : "bg-gradient-to-br from-indigo-300 via-purple-100 to-transparent"
            }`}>
                <div className={`p-8 rounded-[23px] flex flex-col h-full justify-between gap-6 ${
                    isDark ? "bg-slate-950" : "bg-white"
                }`}>
                    <div className="space-y-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>HOST CONSOLE</span>
                        <h2 className="text-xl font-bold tracking-tight">Launch a New Session</h2>
                        <p className={`text-xs md:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Create a secure real-time code arena and admit applicants when they arrive.
                        </p>
                    </div>
                    <button
                        onClick={handleCreateSession}
                        disabled={isCreating}
                        className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                            isCreating 
                                ? isDark ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-400"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25"
                        }`}
                    >
                        {isCreating ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Workspace
                    </button>
                </div>
            </div>

            {/* Card B (Applicant Side) */}
            <div className={`p-8 rounded-3xl border flex flex-col h-full justify-between gap-6 transition-all duration-300 ${
                isDark 
                    ? "bg-slate-900/30 border-slate-800 hover:border-slate-700" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
            }`}>
                <div className="space-y-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>APPLICANT CONSOLE</span>
                    <h2 className="text-xl font-bold tracking-tight">Join Existing Interview</h2>
                    <p className={`text-xs md:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Enter the room link or secure access code provided by your recruiter.
                    </p>
                </div>
                
                <form onSubmit={handleJoinSession} className="flex flex-col gap-2 relative">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            placeholder="Enter Code / Paste Link"
                            className={`w-full px-4 py-4 rounded-xl outline-none text-xs md:text-sm border transition-all ${
                                isDark 
                                    ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500/50" 
                                    : "bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-300"
                            }`}
                        />
                        <button
                            type="submit"
                            disabled={isJoining}
                            className={`absolute right-2 px-4 py-2.5 rounded-lg text-xs font-black text-white transition-colors ${
                                isJoining ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-750"
                            }`}
                        >
                            {isJoining ? "..." : "Join"}
                        </button>
                    </div>
                    {roomError && <p className="text-[10px] text-rose-500 font-bold ml-1">{roomError}</p>}
                </form>
            </div>

        </div>

        {/* Active Sessions List Panel */}
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Video className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
                <h2 className="text-md font-bold tracking-tight">Active Workspaces</h2>
            </div>
            
            <div className={`w-full rounded-3xl border overflow-hidden p-6 ${
                isDark 
                    ? "bg-[#0A0F1A]/40 ring-1 ring-white/5 backdrop-blur-3xl border-slate-800" 
                    : "bg-white/60 ring-1 ring-slate-900/5 backdrop-blur-3xl border-slate-200 shadow-sm"
            }`}>
                {activeSessions.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <PlayCircle className={`w-12 h-12 opacity-15 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                        <div className="space-y-1">
                            <h3 className={`font-mono text-xs md:text-sm tracking-wider font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                [NO_ACTIVE_INTERVIEW_SESSIONS]
                            </h3>
                            <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-450"}`}>
                                Ready to deploy. Generate a workspace above to invite your applicant.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeSessions.map(session => (
                            <div key={session.id} className={`p-6 rounded-2xl border transition-all duration-300 ${
                                isDark 
                                    ? "bg-slate-900/40 border-slate-800/80 hover:border-indigo-500/40" 
                                    : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                            }`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                        session.status === 'Waiting' 
                                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    }`}>
                                        {session.status}
                                    </div>
                                    <span className={`text-[10px] font-mono tracking-tighter ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        {new Date(session.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-mono text-xs font-black tracking-widest uppercase mb-4 text-indigo-400">
                                    SESSION_{session.id.split('-')[0].toUpperCase()}
                                </h4>
                                <button
                                    onClick={() => router.push(`/interview/${session.id}`)}
                                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                                        isDark 
                                            ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20" 
                                            : "bg-indigo-50 text-indigo-650 hover:bg-indigo-100 border border-indigo-100"
                                    }`}
                                >
                                    Connect Workspace
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
      
      {/* Confirm Join Modal */}
      {confirmModalData && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[2000] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm border rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h3 className="text-xl font-bold tracking-tight">Join Session</h3>
            <div className="flex flex-col items-center gap-2 my-2">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-400 font-bold text-xl">
                {confirmModalData.hostAvatar ? (
                  <img src={confirmModalData.hostAvatar} alt="Host Avatar" className="w-full h-full object-cover" />
                ) : (
                  confirmModalData.hostName.charAt(0).toUpperCase()
                )}
              </div>
              <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Hosted by <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{confirmModalData.hostName}</span>
              </p>
            </div>
            <div className="flex w-full gap-3 mt-2">
                <button
                onClick={() => setConfirmModalData(null)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isDark 
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                >
                Cancel
                </button>
                <button
                onClick={() => router.push(`/interview/${confirmModalData.sessionId}`)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
                >
                Confirm Join
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
