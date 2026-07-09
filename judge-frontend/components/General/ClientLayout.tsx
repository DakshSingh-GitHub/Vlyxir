"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '../../app/lib/auth/context';
import { useAuth } from '../../app/lib/auth/auth-context';
import NavBar from './NavBar';
import NewNavBar from './NewNavBar';
import SubmissionsModal from './SubmissionsModal';
import SettingsModal from './SettingsModal';
import { isCodeAnalysisPath, isCodeIdePath, isCodeJudgePath, isForumPath } from '@/app/lib/utils/paths';
import { getProblems } from '../../app/lib/api/api';
import { supabase } from '../../app/lib/api/supabase/client';
import DailyProblemModal from './DailyProblemModal';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { 
        isSidebarOpen, 
        setIsSidebarOpen, 
        isSubmissionsModalOpen, 
        setIsSubmissionsModalOpen, 
        useNewUi, 
        isDark,
        dailyProblemEnabled,
        isDailyModalOpen,
        setIsDailyModalOpen,
        dailyProblem,
        setDailyProblem,
        dailyProblemSolved,
        setDailyProblemSolved,
        codeJudgePath
    } = useAppContext();
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [incomingChallenge, setIncomingChallenge] = React.useState<any | null>(null);
    const [showRejectModal, setShowRejectModal] = React.useState(false);
    const [cancellationInfo, setCancellationInfo] = React.useState<any | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
    const lobbyChannelRef = React.useRef<any>(null);

    const excludedPaths = ['/docs', '/docs-int', '/admin', '/visuals', '/meet-developer', '/login', '/register', '/leaderboard', '/community-guidelines', '/what-is-vlyxir', '/features', '/your-plan'];
    const isNavExcluded = excludedPaths.includes(pathname) || pathname.startsWith('/forum') || pathname.startsWith('/user') || pathname.startsWith('/account');
    const NavComponent = useNewUi ? NewNavBar : NavBar;

    const isHomePage = pathname === '/';
    const isAccountPage = pathname.startsWith('/account');
    const isInterviewRoom = pathname.startsWith('/interview/') && pathname.split('/').length > 2 && pathname.split('/')[2] !== 'page';
    const isSingleScreenPage = isCodeJudgePath(pathname) || isCodeIdePath(pathname) || isCodeAnalysisPath(pathname) || isForumPath(pathname) || isInterviewRoom;
    const isGradientPage = isHomePage || isSingleScreenPage || isAccountPage || pathname.startsWith('/interview');

    const checkDailySolvedStatus = React.useCallback(async (problemId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            if (userId) {
                const { data: subData } = await supabase
                    .from('submissions')
                    .select('passed, total, final_status')
                    .eq('user_id', userId)
                    .eq('problem_id', problemId);
                    
                const isSolved = subData && subData.some((sub: any) => 
                    (sub.total > 0 && sub.passed === sub.total) || sub.final_status === "Accepted"
                );
                setDailyProblemSolved(!!isSolved);
            }
        } catch (e) {
            console.error("Error checking daily challenge solved status:", e);
        }
    }, [setDailyProblemSolved]);

    React.useEffect(() => {
        if (!dailyProblemEnabled) return;

        const loadDailyProblemAndStatus = async () => {
            try {
                // 1. Fetch problems
                const apiData = await getProblems();
                const problems = apiData?.problems || apiData || [];
                if (!problems || !Array.isArray(problems) || problems.length === 0) return;

                // 2. Determine today's date string
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                // 3. Query if today's daily question is already selected
                const { data: todayDaily } = await supabase
                    .from("daily_questions")
                    .select("problem_id")
                    .eq("date", todayString)
                    .maybeSingle();

                let selectedProblem = null;

                if (todayDaily) {
                    selectedProblem = problems.find((p: any) => p.id === todayDaily.problem_id);
                }

                // 4. If not selected, dynamically pick an unused problem and insert it
                if (!selectedProblem) {
                    const { data: allUsedDailies } = await supabase
                        .from("daily_questions")
                        .select("problem_id");

                    const usedIds = new Set((allUsedDailies || []).map((d: any) => d.problem_id));
                    let unusedProblems = problems.filter((p: any) => !usedIds.has(p.id));

                    if (unusedProblems.length === 0) {
                        unusedProblems = problems; // Pool reset if all are used
                    }

                    // Deterministic selection from unused pool to avoid conflicts between concurrent hits
                    let hash = 0;
                    for (let i = 0; i < todayString.length; i++) {
                        hash = todayString.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const index = Math.abs(hash) % unusedProblems.length;
                    const candidateProblem = unusedProblems[index];

                    // Insert candidate daily question
                    const { data: inserted, error: insertError } = await supabase
                        .from("daily_questions")
                        .insert({ problem_id: candidateProblem.id, date: todayString })
                        .select()
                        .maybeSingle();

                    if (!insertError && inserted) {
                        selectedProblem = candidateProblem;
                    } else {
                        // Conflict / other client won the race, refetch the selected one
                        const { data: refetched } = await supabase
                            .from("daily_questions")
                            .select("problem_id")
                            .eq("date", todayString)
                            .maybeSingle();
                        
                        if (refetched) {
                            selectedProblem = problems.find((p: any) => p.id === refetched.problem_id);
                        }
                        
                        // Last resort fallback
                        if (!selectedProblem) {
                            selectedProblem = candidateProblem;
                        }
                    }
                }
                
                setDailyProblem(selectedProblem);

                // 5. Check if solved by current authenticated user
                if (selectedProblem) {
                    await checkDailySolvedStatus(selectedProblem.id);
                }

                // 6. Auto pop-up daily modal on landing page ONLY if not shown today
                const isLandingPage = window.location.pathname === '/';
                if (isLandingPage) {
                    const lastShown = localStorage.getItem("vlyxir_last_daily_modal_shown");
                    if (lastShown !== todayString) {
                        // Delay modal presentation slightly for page render smoothness
                        setTimeout(() => {
                            setIsDailyModalOpen(true);
                        }, 1200);
                    }
                }
            } catch (err) {
                console.error("Failed to load daily featured problem globally:", err);
            }
        };

        loadDailyProblemAndStatus();
    }, [dailyProblemEnabled, setDailyProblem, setIsDailyModalOpen, checkDailySolvedStatus]);

    React.useEffect(() => {
        if (!dailyProblem) return;

        const handleStatusCheck = () => {
            checkDailySolvedStatus(dailyProblem.id);
        };

        window.addEventListener("submission-updated", handleStatusCheck);
        window.addEventListener("daily-score-updated", handleStatusCheck);

        // Check immediately
        handleStatusCheck();

        return () => {
            window.removeEventListener("submission-updated", handleStatusCheck);
            window.removeEventListener("daily-score-updated", handleStatusCheck);
        };
    }, [dailyProblem, checkDailySolvedStatus]);

    const handleCloseDailyModal = () => {
        setIsDailyModalOpen(false);
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        localStorage.setItem("vlyxir_last_daily_modal_shown", todayString);
    };

    React.useEffect(() => {
        const isDuelPage = pathname === '/duel';
        if (!user?.id || isDuelPage) return;

        const globalLobbyChannel = supabase.channel("vlyxir-lobby", {
            config: { presence: { key: user.id } }
        });
        lobbyChannelRef.current = globalLobbyChannel;

        globalLobbyChannel.on("broadcast", { event: "lobby_event" }, async (payload: any) => {
            const data = payload.payload;
            if (!data) return;

            // Direct Challenge Invite Received
            if (data.type === "challenge_invite" && data.targetId === user.id) {
                setIncomingChallenge({
                    challengerId: data.challengerId,
                    challengerUsername: data.challengerUsername,
                    challengerFullName: data.challengerFullName
                });
            }

            // Direct Challenge Cancelled by Challenger
            if (data.type === "challenge_cancel" && data.targetId === user.id) {
                setIncomingChallenge(null);
                setShowRejectModal(false);
                setCancellationInfo({
                    challengerUsername: data.challengerUsername || "The challenger"
                });
            }
        });

        globalLobbyChannel.subscribe();

        return () => {
            globalLobbyChannel.unsubscribe();
            lobbyChannelRef.current = null;
        };
    }, [user?.id, pathname]);

    const handleAcceptGlobalChallenge = async () => {
        if (!user || !incomingChallenge) return;

        const newSessionId = crypto.randomUUID();

        // Fetch problems
        let pythonProblems = [];
        try {
            const problemsData = await getProblems();
            pythonProblems = (problemsData.problems || problemsData || []).filter((p: any) => p.difficulty);
        } catch (err) {
            console.error("Accept global challenge problems fetch error:", err);
        }
        const selectedProblem = pythonProblems[Math.floor(Math.random() * pythonProblems.length)] || { id: "1" };

        const myProfile = {
            id: user.id,
            username: user.user_metadata?.username || user.email?.split("@")[0] || "player",
            full_name: user.user_metadata?.full_name || "Guest Coder"
        };

        if (lobbyChannelRef.current) {
            lobbyChannelRef.current.send({
                type: "broadcast",
                event: "lobby_event",
                payload: {
                    type: "challenge_accept",
                    challengerId: incomingChallenge.challengerId,
                    targetId: user.id,
                    sessionId: newSessionId,
                    problemId: selectedProblem.id,
                    opponentProfile: myProfile
                }
            });
        }
        
        setIncomingChallenge(null);
        router.push(`/duel?sessionId=${newSessionId}&opponentId=${incomingChallenge.challengerId}&problemId=${selectedProblem.id}`);
    };

    const handleConfirmDecline = () => {
        if (!incomingChallenge || !user) return;

        if (lobbyChannelRef.current) {
            lobbyChannelRef.current.send({
                type: "broadcast",
                event: "lobby_event",
                payload: {
                    type: "challenge_decline",
                    challengerId: incomingChallenge.challengerId
                }
            });
        }
        setIncomingChallenge(null);
        setShowRejectModal(false);
    };

    // Base background classes based on theme and route
    const mainBgClass = isGradientPage 
        ? (isDark 
            ? "bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)]" 
            : "bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]")
        : "bg-background";

    return (
        <main className={`flex flex-col transition-colors duration-500 ${isSingleScreenPage ? "h-screen overflow-hidden" : "min-h-screen"} ${mainBgClass}`}>
            {!isNavExcluded && (
                <NavComponent
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    setIsSubmissionsModalOpen={setIsSubmissionsModalOpen}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                />
            )}
            <div className="flex-1 min-h-0 flex flex-col">
                {children}
            </div>
            <SubmissionsModal
                isOpen={isSubmissionsModalOpen}
                onClose={() => setIsSubmissionsModalOpen(false)}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />

            <DailyProblemModal
                isOpen={isDailyModalOpen}
                onClose={handleCloseDailyModal}
                problem={dailyProblem}
                isSolved={dailyProblemSolved}
                isDark={isDark}
                codeJudgePath={codeJudgePath}
            />

            {/* Global Challenge Notification Toast */}
            {incomingChallenge && (
                <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-350">
                    <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                            <span className="font-black text-sm">⚔️</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-500">1v1 Duel Challenge!</h4>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                                <strong className="text-indigo-650 dark:text-indigo-400">@{incomingChallenge.challengerUsername}</strong> ({incomingChallenge.challengerFullName || "Opponent"}) has challenged you to a live coding duel!
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-500 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAcceptGlobalChallenge}
                            className="px-4 py-1.5 rounded-xl text-[11px] font-black text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                            Accept ⚔️
                        </button>
                    </div>
                </div>
            )}

            {/* Rejection Confirmation Modal */}
            {showRejectModal && incomingChallenge && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in scale-in-95 duration-200">
                        <div className="text-center">
                            <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Decline Duel Invite?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                Are you sure you want to reject the 1v1 coding duel invitation from <strong className="text-slate-800 dark:text-slate-250">@{incomingChallenge.challengerUsername}</strong>? This will decline their challenge request immediately.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDecline}
                                className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                Yes, Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancellation Notification Modal */}
            {cancellationInfo && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center animate-in scale-in-95 duration-200">
                        <div className="h-12 w-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-1">
                            <span className="text-xl">⚔️</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Challenge Withdrawn</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            The 1v1 coding duel invitation from <strong className="text-slate-800 dark:text-slate-250">@{cancellationInfo.challengerUsername}</strong> has been cancelled.
                        </p>
                        <button
                            onClick={() => setCancellationInfo(null)}
                            className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md cursor-pointer mt-2 animate-pulse"
                        >
                            Okay
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
