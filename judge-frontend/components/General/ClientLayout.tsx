"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../app/lib/auth/context';
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
    const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

    const excludedPaths = ['/docs', '/docs-int', '/admin', '/visuals', '/meet-developer', '/login', '/register', '/leaderboard', '/community-guidelines', '/what-is-vlyxir', '/features', '/your-plan'];
    const isNavExcluded = excludedPaths.includes(pathname) || pathname.startsWith('/forum') || pathname.startsWith('/user') || pathname.startsWith('/account');
    const NavComponent = useNewUi ? NewNavBar : NavBar;

    const isHomePage = pathname === '/';
    const isAccountPage = pathname.startsWith('/account');
    const isSingleScreenPage = isCodeJudgePath(pathname) || isCodeIdePath(pathname) || isCodeAnalysisPath(pathname) || isForumPath(pathname);
    const isGradientPage = isHomePage || isSingleScreenPage || isAccountPage;

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

                // 2. Select problem deterministically
                const today = new Date();
                const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                
                let hash = 0;
                for (let i = 0; i < todayString.length; i++) {
                    hash = todayString.charCodeAt(i) + ((hash << 5) - hash);
                }
                const index = Math.abs(hash) % problems.length;
                const selectedProblem = problems[index];
                
                setDailyProblem(selectedProblem);

                // 3. Check if solved by current authenticated user
                await checkDailySolvedStatus(selectedProblem.id);

                // 4. Auto pop-up daily modal on landing page ONLY if not shown today
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
        </main>
    );
}
