"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth/auth-context";
import { 
  getSessionDetails, 
  joinSessionAsParticipant, 
  endSession, 
  updateSessionStatus 
} from "../../../lib/api/interview";
import { useInterviewRealtime } from "../../../lib/hooks/useInterviewRealtime";
import InterviewLayout from "../../../../components/Interview/InterviewLayout";
import WaitingRoom from "../../../../components/Interview/WaitingRoom";
import LoginPrompt from "../../../../components/Auth/LoginPrompt";
import { InterviewSession, InterviewVerdict } from "../../../lib/types/interview";
import { runCode } from "../../../lib/api/api";
import { useAppContext } from "../../../lib/auth/context";
import { Check, X, Clock, Info, Copy } from "lucide-react";

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  
  const { user, isLoading: isAuthLoading, dbProfile } = useAuth();
  const { isDark } = useAppContext();
  const router = useRouter();

  const displayName = dbProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';
  const avatarUrl = dbProfile?.avatar_url || user?.user_metadata?.avatar_url || "";

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [accessState, setAccessState] = useState<'Checking' | 'Waiting' | 'Admitted' | 'Denied' | 'Ended'>('Checking');
  
  const [code, setCode] = useState("# Write your code here");
  const [files, setFiles] = useState<Record<string, any>>({
    "main.py": { name: "main.py", path: "main.py", content: "# Write your code here", isFolder: false }
  });
  const [activeFilePath, setActiveFilePath] = useState("main.py");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isLoadingRun, setIsLoadingRun] = useState(false);
  const [notes, setNotes] = useState("");
  const [verdict, setVerdict] = useState<InterviewVerdict>('Pending');
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize Data
  useEffect(() => {
    if (!user) return;
    
    getSessionDetails(sessionId).then(async (data) => {
      if (!data) {
         setAccessState('Ended');
         return;
      }
      
      setSession(data);
      
      if (data.status === 'Completed') {
          setAccessState('Ended');
          return;
      }

      if (data.host_uuid === user.id) {
          setIsHost(true);
          setAccessState('Admitted'); // Host goes straight in
          // Set to active if it was waiting
          if (data.status === 'Waiting') {
              updateSessionStatus(sessionId, 'Active');
          }
      } else {
          // It's a candidate
          setIsHost(false);
          const success = await joinSessionAsParticipant(sessionId, user.id);
          if (success || data.participant_uuid === user.id) {
              setAccessState('Waiting');
          } else {
              setAccessState('Denied'); // Someone else took the slot
          }
      }
    });
  }, [sessionId, user]);

  // Realtime hook
  const {
    participants,
    chatMessages,
    candidateLogs,
    isExecutionLocked,
    syncCode,
    sendChatMessage,
    toggleExecutionLock,
    admitCandidate,
    denyCandidate,
    notifySessionEnd,
    appendLog
  } = useInterviewRealtime({
    sessionId,
    userId: user?.id || "",
    isHost,
    userName: displayName,
    userAvatar: avatarUrl,
    onCodeChange: (newCode) => {
      setCode(newCode);
      setFiles(prev => {
        if (!prev[activeFilePath]) return prev;
        return {
          ...prev,
          [activeFilePath]: {
            ...prev[activeFilePath],
            content: newCode
          }
        };
      });
    },
    onCandidateAdmitted: () => setAccessState('Admitted'),
    onCandidateDenied: () => setAccessState('Denied'),
    onSessionEnded: () => setAccessState('Ended')
  });

  // Sync state to Global Navbar
  useEffect(() => {
    const handleRequestState = () => {
      window.dispatchEvent(new CustomEvent('vlyxir-interview-state-update', {
        detail: {
          isHost,
          isExecutionLocked,
          leftSidebarOpen,
          rightSidebarOpen
        }
      }));
    };

    window.addEventListener('vlyxir-interview-request-state', handleRequestState);
    handleRequestState();

    return () => window.removeEventListener('vlyxir-interview-request-state', handleRequestState);
  }, [isHost, isExecutionLocked, leftSidebarOpen, rightSidebarOpen]);

  // Handle actions dispatched by Global Navbar
  useEffect(() => {
    const handleAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const action = customEvent.detail?.action;
      if (!action) return;

      if (action === 'end') {
        setIsEndModalOpen(true);
      } else if (action === 'leave') {
        handleLeaveSession();
      } else if (action === 'toggle-lock') {
        toggleExecutionLock(!isExecutionLocked);
      } else if (action === 'toggle-left-sidebar') {
        setLeftSidebarOpen(prev => !prev);
      } else if (action === 'toggle-sidebar') {
        setRightSidebarOpen(prev => !prev);
      } else if (action === 'info') {
        setIsInfoModalOpen(true);
      }
    };

    window.addEventListener('vlyxir-interview-action', handleAction);
    return () => window.removeEventListener('vlyxir-interview-action', handleAction);
  }, [isExecutionLocked, leftSidebarOpen, rightSidebarOpen, isHost, session, candidateLogs, verdict, notes, isEndModalOpen, isInfoModalOpen]);

  const handleSetCode = (newCode: string) => {
    setCode(newCode);
    setFiles(prev => {
      if (!prev[activeFilePath]) return prev;
      return {
        ...prev,
        [activeFilePath]: {
          ...prev[activeFilePath],
          content: newCode
        }
      };
    });
    syncCode(newCode); // Fast relay
  };

  const handleSelectFile = (path: string) => {
     setActiveFilePath(path);
     const fileContent = files[path]?.content || "";
     setCode(fileContent);
     syncCode(fileContent);
  };

  const handleCreateFile = (path: string, isFolder: boolean) => {
    setFiles(prev => ({
      ...prev,
      [path]: {
        name: path.split("/").pop() || "",
        path,
        content: isFolder ? "" : `# ${path}\n`,
        isFolder
      }
    }));
    if (!isFolder) {
      setActiveFilePath(path);
      setCode(`# ${path}\n`);
      syncCode(`# ${path}\n`);
    }
  };

  const handleRename = (oldPath: string, newPath: string) => {
    setFiles(prev => {
      const updated = { ...prev };
      if (!updated[oldPath]) return prev;
      const fileNode = updated[oldPath];
      delete updated[oldPath];
      updated[newPath] = {
        ...fileNode,
        path: newPath,
        name: newPath.split("/").pop() || ""
      };
      return updated;
    });
    if (activeFilePath === oldPath) {
      setActiveFilePath(newPath);
    }
  };

  const handleDelete = (path: string) => {
    setFiles(prev => {
      const updated = { ...prev };
      delete updated[path];
      return updated;
    });
    if (activeFilePath === path) {
      setActiveFilePath("main.py");
    }
  };

  const handleRunCode = async () => {
    if (isLoadingRun || (!isHost && isExecutionLocked)) return;
    setIsLoadingRun(true);
    appendLog('Executed code');
    try {
        const res = await runCode(code, input);
        setOutput(res);
    } catch (err: any) {
        setOutput({ status: "Error", stderr: err.message });
    } finally {
        setIsLoadingRun(false);
    }
  };

  const handleEndSession = async () => {
    if (!isHost || !session) return;
    try {
        await endSession(sessionId, verdict, notes, candidateLogs);
        notifySessionEnd();
        router.push('/interview');
    } catch (err) {
        console.error("Failed to end session", err);
    }
  };

  const handleLeaveSession = () => {
      router.push('/interview');
  };

  if (isAuthLoading || accessState === 'Checking') {
      return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
            <LoginPrompt title="Join Interview" description="Sign in to join the interview session." nextPath={`/interview/${sessionId}`} />
        </div>
    );
  }

  // Candidate waiting room gates
  if (!isHost && accessState !== 'Admitted') {
      return (
          <>
            <WaitingRoom status={accessState as any} onLeave={handleLeaveSession} />
          </>
      );
  }

  return (
    <>
      <InterviewLayout
        isHost={isHost}
        code={code}
        setCode={handleSetCode}
        input={input}
        setInput={setInput}
        output={output}
        onRunCode={handleRunCode}
        isLoadingRun={isLoadingRun}
        files={files}
        activeFilePath={activeFilePath}
        onSelectFile={handleSelectFile}
        onCreateFile={handleCreateFile}
        onRename={handleRename}
        onDelete={handleDelete}
        isExecutionLocked={isExecutionLocked}
        onToggleExecutionLock={toggleExecutionLock}
        participants={participants}
        chatMessages={chatMessages}
        onSendChatMessage={sendChatMessage}
        onAdmitCandidate={admitCandidate}
        onDenyCandidate={denyCandidate}
        notes={notes}
        setNotes={setNotes}
        onEndSession={() => setIsEndModalOpen(true)}
        onLeaveSession={handleLeaveSession}
        userId={user.id}
        hostUuid={session?.host_uuid || ""}
        leftSidebarOpen={leftSidebarOpen}
        onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
        rightSidebarOpen={rightSidebarOpen}
      />

      {isEndModalOpen && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-xs z-[2000] flex items-center justify-center p-4">
          <div className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-indigo-400">
                End Session & Evaluate
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Conclude the interview and record the candidate's final status. This choice will persist in the database.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Choose Candidate Verdict
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Accept', color: 'emerald', label: 'Accept', icon: Check },
                  { value: 'Reject', color: 'rose', label: 'Reject', icon: X },
                  { value: 'Pending', color: 'amber', label: 'Pending', icon: Clock }
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = verdict === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setVerdict(opt.value as any)}
                      className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? opt.color === 'emerald'
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : opt.color === 'rose'
                            ? "bg-rose-500/10 border-rose-500 text-rose-450"
                            : "bg-amber-500/10 border-amber-500 text-amber-400"
                          : isDark
                          ? "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-350 hover:text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsEndModalOpen(false)}
                className={`flex-1 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                  isDark ? "border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-colors cursor-pointer"
              >
                Submit & End
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[2000] flex items-center justify-center p-4">
          <div className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Meeting Details
              </h3>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark ? "border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <div>
                <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Meeting Room Code
                </label>
                <div className={`flex items-center gap-2 mt-1 p-3 rounded-xl border font-mono text-sm justify-between ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-350" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <span className="truncate mr-2 select-all">{sessionId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sessionId);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                      copiedCode
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : isDark ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Sharable Join Link
                </label>
                <div className={`flex items-center gap-2 mt-1 p-3 rounded-xl border font-mono text-xs justify-between ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-350" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <span className="truncate mr-2 select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/interview/${sessionId}` : ''}
                  </span>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/interview/${sessionId}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                      copiedLink
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : isDark ? "border-slate-800 hover:bg-slate-800 text-slate-400" : "border-slate-200 hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
