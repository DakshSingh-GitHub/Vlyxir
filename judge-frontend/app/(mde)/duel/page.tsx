"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Swords,
    Trophy,
    User,
    ChevronRight,
    Loader2,
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    Terminal,
    Smile,
    ArrowLeft,
    Cpu,
    Flame,
    Flag
} from "lucide-react";
import { supabase } from "../../lib/api/supabase/client";
import { useAuth } from "../../lib/auth/auth-context";
import { useAppContext } from "../../lib/auth/context";
import { getProblems, submitCode } from "../../lib/api/api";
import { Problem } from "../../lib/types/types";
import CodeEditor from "../../../components/Editor/CodeEditor";

// Emote reactions that players can trigger during duels
const DUEL_EMOTES = ["🔥", "😎", "😮", "🤔", "👑", "🎯", "💀", "👏"];

export default function DuelPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0B0C15]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        }>
            <DuelArenaContent />
        </Suspense>
    );
}

function DuelArenaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { isDark } = useAppContext();

    // Challenge target from URL query (?challenge=userId)
    const challengeTargetId = searchParams.get("challenge");

    // UI States: "lobby" | "searching" | "battle" | "results"
    const [uiState, setUiState] = useState<"lobby" | "searching" | "battle" | "results">("lobby");
    
    // Matchmaking / Lobby states
    const [challengeTargetProfile, setChallengeTargetProfile] = useState<any | null>(null);
    const [incomingChallenge, setIncomingChallenge] = useState<any | null>(null);
    const [lobbyPlayersCount, setLobbyPlayersCount] = useState(0);
    const [searchTime, setSearchTime] = useState(0);
    const [matchmakingTimeout, setMatchmakingTimeout] = useState(false);

    // Duel active session state
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
    const [opponent, setOpponent] = useState<any | null>(null);
    const [gameActive, setGameActive] = useState(false);
    
    // Coding battle states
    const [code, setCode] = useState("# Write your solution in Python here\n\n");
    const [isRunning, setIsRunning] = useState(false);
    const [submitResult, setSubmitResult] = useState<any | null>(null);
    const [testResults, setTestResults] = useState<any[]>([]);

    // Submission states
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [myFinalScore, setMyFinalScore] = useState<number | null>(null);
    const [myTotalCount, setMyTotalCount] = useState<number | null>(null);

    const [opponentSubmitted, setOpponentSubmitted] = useState(false);
    const [opponentFinalScore, setOpponentFinalScore] = useState<number | null>(null);
    const [opponentTotalCount, setOpponentTotalCount] = useState<number | null>(null);

    // Real-time synchronization states
    const [cursorLine, setCursorLine] = useState(1);
    const [opponentProgress, setOpponentProgress] = useState({
        passCount: 0,
        totalCount: 0,
        charCount: 0,
        cursorLine: 1,
        isRunning: false
    });

    // Floating emotes triggers
    const [floatingEmotes, setFloatingEmotes] = useState<Array<{ id: number; char: string; side: "left" | "right" }>>([]);

    // Question change request states
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [hasRequestedQuestionChange, setHasRequestedQuestionChange] = useState(false);
    const [pendingQuestionChangeRequest, setPendingQuestionChangeRequest] = useState<any | null>(null);
    const [incomingQuestionChangeRequest, setIncomingQuestionChangeRequest] = useState<any | null>(null);

    // Social follow list states for in-lobby challenges
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [followersList, setFollowersList] = useState<any[]>([]);
    const [socialLoading, setSocialLoading] = useState(true);

    const connectionsList = React.useMemo(() => {
        const merged = [...followingList];
        followersList.forEach((follower) => {
            if (!merged.some((f) => f.id === follower.id)) {
                merged.push(follower);
            }
        });
        return merged;
    }, [followingList, followersList]);

    // Channel refs
    const lobbyChannelRef = useRef<any>(null);
    const sessionChannelRef = useRef<any>(null);
    const timerIntervalRef = useRef<any>(null);
    const searchIntervalRef = useRef<any>(null);

    // 1. Fetch direct challenge profile if present in URL
    useEffect(() => {
        if (!challengeTargetId || authLoading) return;
        
        async function fetchTarget() {
            const { data } = await supabase
                .from("profiles")
                .select("id, username, full_name, avatar_url")
                .eq("id", challengeTargetId)
                .maybeSingle();
            if (data) {
                setChallengeTargetProfile(data);
                setUiState("searching"); // Instantly transition to challenge pending screen
            }
        }
        fetchTarget();
    }, [challengeTargetId, authLoading]);

    // Fetch followers and following for in-lobby direct challenges - prevented refetches on browser focus loss via user?.id
    useEffect(() => {
        const currentUserId = user?.id;
        if (!currentUserId) return;

        async function fetchSocial() {
            setSocialLoading(true);
            try {
                // Fetch Followers
                const { data: followersData } = await supabase
                    .from('follows')
                    .select('follower_id')
                    .eq('following_id', currentUserId);
                
                if (followersData && followersData.length > 0) {
                    const followerIds = followersData.map((f: any) => f.follower_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, bio')
                        .in('id', followerIds);
                    setFollowersList(profiles || []);
                } else {
                    setFollowersList([]);
                }

                // Fetch Following
                const { data: followingData } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', currentUserId);
                
                if (followingData && followingData.length > 0) {
                    const followingIds = followingData.map((f: any) => f.following_id);
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, username, full_name, avatar_url, bio')
                        .in('id', followingIds);
                    setFollowingList(profiles || []);
                } else {
                    setFollowingList([]);
                }
            } catch (err) {
                console.error("Failed to load social lists:", err);
            } finally {
                setSocialLoading(false);
            }
        }

        fetchSocial();
    }, [user?.id]);

    // 2. Initialize unified Lobby Channel - prevented reconnect disconnect loops via user?.id dependency
    useEffect(() => {
        if (!user?.id) return;

        // Clean up previous lobby channel if any
        if (lobbyChannelRef.current) {
            lobbyChannelRef.current.unsubscribe();
        }

        const channel = supabase.channel("vlyxir-lobby", {
            config: { presence: { key: user.id } }
        });

        lobbyChannelRef.current = channel;

        // Presence state tracking for active queue counting
        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                setLobbyPlayersCount(Object.keys(state).length);
            })
            .on("presence", { event: "join" }, ({ newPresences }) => {
                // Auto lobby sync
            })
            .on("presence", { event: "leave" }, ({ leftPresences }) => {
                // Auto lobby sync
            });

        // Broadcast messages listener
        channel.on("broadcast", { event: "lobby_event" }, async (payload: any) => {
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

            // Challenge Invite Declined
            if (data.type === "challenge_decline" && data.challengerId === user.id) {
                alert(`${challengeTargetProfile?.username || "Opponent"} declined the challenge request.`);
                setUiState("lobby");
                setChallengeTargetProfile(null);
            }

            // Direct Challenge Invite Accepted
            if (data.type === "challenge_accept" && data.challengerId === user.id) {
                // Instantly launch battle
                startBattleSession(data.sessionId, data.opponentProfile, data.problemId);
            }

            // Public Matchmaking Host Offer
            if (data.type === "match_offer" && data.guestId === user.id && uiState === "searching") {
                // Accept public match offer automatically
                channel.send({
                    type: "broadcast",
                    event: "lobby_event",
                    payload: {
                        type: "match_confirm",
                        hostId: data.hostId,
                        guestId: user.id,
                        sessionId: data.sessionId,
                        problemId: data.problemId,
                        opponentProfile: {
                            id: user.id,
                            username: user.user_metadata?.username || user.email?.split("@")[0] || "player",
                            full_name: user.user_metadata?.full_name || "Guest Coder"
                        }
                    }
                });
                
                const opponentProfile = {
                    id: data.hostId,
                    username: data.hostUsername,
                    full_name: data.hostFullName
                };
                startBattleSession(data.sessionId, opponentProfile, data.problemId);
            }

            // Public Matchmaking Guest Confirmation
            if (data.type === "match_confirm" && data.hostId === user.id && uiState === "searching") {
                startBattleSession(data.sessionId, data.opponentProfile, data.problemId);
            }
        });

        // Subscribe to channel
        channel.subscribe(async (status) => {
            if (status === "SUBSCRIBED") {
                await channel.track({
                    online_at: new Date().toISOString(),
                    username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
                    status: uiState === "searching" && !challengeTargetId ? "searching" : "idle"
                });
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [user?.id, uiState, challengeTargetId, challengeTargetProfile]);

    // Handle Public Matchmaking queue timer and scanning P2P presence matches
    useEffect(() => {
        if (uiState !== "searching" || challengeTargetId) {
            if (searchIntervalRef.current) {
                clearInterval(searchIntervalRef.current);
                searchIntervalRef.current = null;
            }
            return;
        }

        setSearchTime(0);
        setMatchmakingTimeout(false);

        searchIntervalRef.current = setInterval(async () => {
            setSearchTime((prev) => {
                if (prev >= 60) {
                    setMatchmakingTimeout(true);
                    clearInterval(searchIntervalRef.current);
                    return prev;
                }
                return prev + 1;
            });

            // Perform matchmaking scan using Supabase presence
            if (!lobbyChannelRef.current || !user) return;

            const presenceList = lobbyChannelRef.current.presenceState();
            const searchingPlayers: any[] = [];

            Object.keys(presenceList).forEach((userId) => {
                if (userId === user.id) return;
                const userPresence = presenceList[userId]?.[0];
                if (userPresence?.status === "searching") {
                    searchingPlayers.push({
                        id: userId,
                        username: userPresence.username,
                        fullName: userPresence.username
                    });
                }
            });

            // If there's an eligible opponent, host matching (the larger string ID hosts to prevent double matching)
            if (searchingPlayers.length > 0) {
                const opponentPlayer = searchingPlayers[0];
                const shouldHost = user.id > opponentPlayer.id;

                if (shouldHost) {
                    // Load problems list and pick one
                    const problemsData = await getProblems();
                    const pythonProblems = (problemsData.problems || []).filter((p: any) => p.difficulty);
                    const selectedProblem = pythonProblems[Math.floor(Math.random() * pythonProblems.length)] || { id: "1" };
                    
                    const newSessionId = `session_${Math.random().toString(36).substring(2, 10)}`;

                    lobbyChannelRef.current.send({
                        type: "broadcast",
                        event: "lobby_event",
                        payload: {
                            type: "match_offer",
                            hostId: user.id,
                            hostUsername: user.user_metadata?.username || user.email?.split("@")[0] || "host",
                            hostFullName: user.user_metadata?.full_name || "Host Player",
                            guestId: opponentPlayer.id,
                            sessionId: newSessionId,
                            problemId: selectedProblem.id
                        }
                    });
                }
            }
        }, 1000);

        return () => {
            if (searchIntervalRef.current) {
                clearInterval(searchIntervalRef.current);
            }
        };
    }, [uiState, challengeTargetId, user?.id]);

    // Handle Direct Challenge action (Inviter side)
    const handleSendChallenge = async () => {
        if (!lobbyChannelRef.current || !user || !challengeTargetProfile) return;

        lobbyChannelRef.current.send({
            type: "broadcast",
            event: "lobby_event",
            payload: {
                type: "challenge_invite",
                challengerId: user.id,
                challengerUsername: user.user_metadata?.username || user.email?.split("@")[0] || "challenger",
                challengerFullName: user.user_metadata?.full_name || "Challenger Coder",
                targetId: challengeTargetProfile.id
            }
        });
    };

    // Trigger challenge sending automatically once target is ready
    useEffect(() => {
        if (uiState === "searching" && challengeTargetProfile && user) {
            handleSendChallenge();
        }
    }, [uiState, challengeTargetProfile, user?.id]);

    // Decline incoming challenge
    const handleDeclineChallenge = () => {
        if (!lobbyChannelRef.current || !user || !incomingChallenge) return;

        lobbyChannelRef.current.send({
            type: "broadcast",
            event: "lobby_event",
            payload: {
                type: "challenge_decline",
                challengerId: incomingChallenge.challengerId
            }
        });
        setIncomingChallenge(null);
    };

    // Accept incoming challenge
    const handleAcceptChallenge = async () => {
        if (!lobbyChannelRef.current || !user || !incomingChallenge) return;

        const newSessionId = `session_${Math.random().toString(36).substring(2, 10)}`;
        
        // Pick a random problem
        const problemsData = await getProblems();
        const pythonProblems = (problemsData.problems || []).filter((p: any) => p.difficulty);
        const selectedProblem = pythonProblems[Math.floor(Math.random() * pythonProblems.length)] || { id: "1" };

        const myProfile = {
            id: user.id,
            username: user.user_metadata?.username || user.email?.split("@")[0] || "player",
            full_name: user.user_metadata?.full_name || "Guest Coder"
        };

        // Broadcast acceptance
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

        const opponentProfile = {
            id: incomingChallenge.challengerId,
            username: incomingChallenge.challengerUsername,
            full_name: incomingChallenge.challengerFullName
        };

        setIncomingChallenge(null);
        startBattleSession(newSessionId, opponentProfile, selectedProblem.id);
    };

    // 3. Initialize Battle Session
    const startBattleSession = async (sId: string, opponentProfile: any, problemId: string) => {
        setSessionId(sId);
        setOpponent(opponentProfile);
        setUiState("battle");
        setGameActive(true);
        setCode("# Enter your solution in Python here\n\n");
        setSubmitResult(null);
        setTestResults([]);

        // Reset submission states
        setHasSubmitted(false);
        setMyFinalScore(null);
        setMyTotalCount(null);
        setOpponentSubmitted(false);
        setOpponentFinalScore(null);
        setOpponentTotalCount(null);

        // Reset question change states
        setHasRequestedQuestionChange(false);
        setPendingQuestionChangeRequest(null);
        setIncomingQuestionChangeRequest(null);

        // Load targeted problem details
        try {
            const problems = await getProblems();
            const targetProb = (problems.problems || []).find((p: any) => p.id === problemId);
            if (targetProb) {
                setCurrentProblem(targetProb);
            }
        } catch (e) {
            console.error("Failed to load battle problem:", e);
        }

        // Connect to Private Session Realtime Channel
        const sessionChannel = supabase.channel(`duel-${sId}`, {
            config: { presence: { key: user?.id || "" } }
        });
        sessionChannelRef.current = sessionChannel;

        sessionChannel
            .on("broadcast", { event: "sync" }, (payload: any) => {
                const data = payload.payload;
                if (!data) return;

                if (data.type === "telemetry" && data.senderId !== user?.id) {
                    setOpponentProgress({
                        passCount: data.passCount,
                        totalCount: data.totalCount,
                        charCount: data.charCount,
                        cursorLine: data.cursorLine,
                        isRunning: data.isRunning
                    });
                }

                if (data.type === "emoji" && data.senderId !== user?.id) {
                    triggerFloatingEmote(data.emoji, "right");
                }

                if (data.type === "submitted" && data.senderId !== user?.id) {
                    setOpponentSubmitted(true);
                    setOpponentFinalScore(data.passCount);
                    setOpponentTotalCount(data.totalCount);
                    // Also update opponentProgress metrics
                    setOpponentProgress(prev => ({
                        ...prev,
                        passCount: data.passCount,
                        totalCount: data.totalCount
                    }));
                }

                if (data.type === "give_up" && data.senderId !== user?.id) {
                    // Opponent gave up!
                    setGameActive(false);
                    setUiState("results");
                    setSubmitResult({
                        outcome: "victory",
                        won: true,
                        msg: "Opponent gave up and left the challenge!"
                    });
                }

                if (data.type === "request_question_change" && data.senderId !== user?.id) {
                    setIncomingQuestionChangeRequest({
                        senderId: data.senderId,
                        problemId: data.problemId,
                        problemTitle: data.problemTitle
                    });
                }

                if (data.type === "decline_question_change" && data.senderId !== user?.id) {
                    alert("Opponent declined your request to change the question.");
                    setHasRequestedQuestionChange(true);
                    setPendingQuestionChangeRequest(null);
                }

                if (data.type === "accept_question_change" && data.senderId !== user?.id) {
                    loadAndSetProblem(data.problemId);
                    setPendingQuestionChangeRequest(null);
                    setIncomingQuestionChangeRequest(null);
                }

                if (data.type === "disconnect" && data.senderId !== user?.id) {
                    setGameActive(false);
                    setUiState("results");
                    setSubmitResult({
                        outcome: "victory",
                        won: true,
                        msg: "Opponent has disconnected from the duel!"
                    });
                }
            })
            .on("presence", { event: "leave" }, ({ key }) => {
                if (key === opponentProfile.id) {
                    setGameActive(false);
                    setUiState("results");
                    setSubmitResult({
                        outcome: "victory",
                        won: true,
                        msg: "Opponent has disconnected from the duel!"
                    });
                }
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED" && user) {
                    await sessionChannel.track({
                        online_at: new Date().toISOString()
                    });
                }
            });
    };

    // 4. Synchronize Telemetry state changes to opponent
    const syncTelemetry = (currentPass: number, totalPass: number, currentCode: string, line: number, isProcessing: boolean) => {
        if (!sessionChannelRef.current || !user) return;

        sessionChannelRef.current.send({
            type: "broadcast",
            event: "sync",
            payload: {
                type: "telemetry",
                senderId: user.id,
                passCount: currentPass,
                totalCount: totalPass,
                charCount: currentCode.length,
                cursorLine: line,
                isRunning: isProcessing
            }
        });
    };

    // Trigger local and remote emoting
    const handleSendEmote = (emoji: string) => {
        triggerFloatingEmote(emoji, "left");
        if (sessionChannelRef.current && user) {
            sessionChannelRef.current.send({
                type: "broadcast",
                event: "sync",
                payload: {
                    type: "emoji",
                    senderId: user.id,
                    emoji
                }
            });
        }
    };

    const triggerFloatingEmote = (char: string, side: "left" | "right") => {
        const id = Date.now() + Math.random();
        setFloatingEmotes((prev) => [...prev, { id, char, side }]);
        setTimeout(() => {
            setFloatingEmotes((prev) => prev.filter((e) => e.id !== id));
        }, 2000);
    };

    // Handle Code submissions
    const handleSubmitCode = async () => {
        if (!currentProblem || isRunning || !user || hasSubmitted) return;
        setIsRunning(true);
        syncTelemetry(0, 0, code, cursorLine, true);

        try {
            const res = await submitCode(currentProblem.id, code);
            setSubmitResult(res);
            setTestResults(res.test_case_results || []);

            const passed = res.summary?.passed || 0;
            const total = res.summary?.total || 0;

            setMyFinalScore(passed);
            setMyTotalCount(total);
            setHasSubmitted(true);

            syncTelemetry(passed, total, code, cursorLine, false);

            // Broadcast submitted state to opponent
            if (sessionChannelRef.current) {
                sessionChannelRef.current.send({
                    type: "broadcast",
                    event: "sync",
                    payload: {
                        type: "submitted",
                        senderId: user.id,
                        passCount: passed,
                        totalCount: total
                    }
                });
            }
        } catch (e: any) {
            alert(e.message || "Failed to execute and submit code");
        } finally {
            setIsRunning(false);
        }
    };

    const handleGiveUp = async () => {
        if (!user || !opponent || !currentProblem) return;

        if (confirm("Are you sure you want to give up and forfeit this duel?")) {
            // Broadcast give up
            if (sessionChannelRef.current) {
                sessionChannelRef.current.send({
                    type: "broadcast",
                    event: "sync",
                    payload: {
                        type: "give_up",
                        senderId: user.id
                    }
                });
            }

            setGameActive(false);
            setUiState("results");
            setSubmitResult({
                outcome: "defeat",
                won: false,
                msg: "You gave up and forfeited the challenge.",
                myScore: 0,
                myTotal: 0,
                opponentScore: opponentProgress.passCount,
                opponentTotal: opponentProgress.totalCount
            });

            // Insert into history
            if (user.id > opponent.id) {
                try {
                    await supabase
                        .from("duel_sessions")
                        .insert([{
                            problem_id: currentProblem.id,
                            creator_id: user.id,
                            opponent_id: opponent.id,
                            status: "completed",
                            winner_id: opponent.id
                        }]);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    // Evaluate results once both players have submitted
    useEffect(() => {
        if (hasSubmitted && opponentSubmitted && user && currentProblem && opponent) {
            setGameActive(false);
            setUiState("results");

            let outcome: "victory" | "defeat" | "draw" = "draw";
            let msg = "";

            const mine = myFinalScore || 0;
            const opp = opponentFinalScore || 0;
            const myTotal = myTotalCount || 0;
            const oppTotal = opponentTotalCount || 0;

            const myAllPassed = mine === myTotal && myTotal > 0;
            const oppAllPassed = opp === oppTotal && oppTotal > 0;

            if (myAllPassed && oppAllPassed) {
                outcome = "draw";
                msg = "It's a draw! Both players solved the problem perfectly passing all test cases.";
            } else if (mine > opp) {
                outcome = "victory";
                msg = `You won! You passed ${mine}/${myTotal} test cases, while your opponent passed ${opp}/${oppTotal}.`;
            } else if (mine < opp) {
                outcome = "defeat";
                msg = `Opponent won! You passed ${mine}/${myTotal} test cases, while your opponent passed ${opp}/${oppTotal}.`;
            } else {
                outcome = "draw";
                msg = `It's a draw! Both players passed ${mine} test cases.`;
            }

            setSubmitResult({
                outcome,
                msg,
                won: outcome === "victory",
                myScore: mine,
                myTotal: myTotal,
                opponentScore: opp,
                opponentTotal: oppTotal
            });

            // Insert into history
            if (user.id > opponent.id) {
                supabase
                    .from("duel_sessions")
                    .insert([{
                        problem_id: currentProblem.id,
                        creator_id: user.id,
                        opponent_id: opponent.id,
                        status: "completed",
                        winner_id: outcome === "victory" ? user.id : (outcome === "defeat" ? opponent.id : null)
                    }])
                    .then(({ error }) => {
                        if (error) console.error("Failed to insert completed duel record", error);
                    });
            }
        }
    }, [hasSubmitted, opponentSubmitted, myFinalScore, opponentFinalScore, myTotalCount, opponentTotalCount, user, currentProblem, opponent]);

    const handleChallengePlayer = (targetPlayer: any) => {
        setChallengeTargetProfile(targetPlayer);
        setUiState("searching");
    };

    // Load problem by ID and reset all battle states
    const loadAndSetProblem = async (problemId: string) => {
        try {
            const problems = await getProblems();
            const targetProb = (problems.problems || []).find((p: any) => p.id === problemId);
            if (targetProb) {
                setCurrentProblem(targetProb);
                setCode("# Enter your solution in Python here\n\n");
                setTestResults([]);
                setSubmitResult(null);
                setHasSubmitted(false);
                setMyFinalScore(null);
                setMyTotalCount(null);
                setOpponentSubmitted(false);
                setOpponentFinalScore(null);
                setOpponentTotalCount(null);
            }
        } catch (e) {
            console.error("Failed to load requested problem change:", e);
        }
    };

    // Open change question modal and load problems
    const handleOpenQuestionChangeModal = async () => {
        try {
            const data = await getProblems();
            // Filter out current problem
            const filtered = (data.problems || []).filter((p: any) => p.id !== currentProblem?.id);
            setAllProblems(filtered);
            setShowChangeModal(true);
        } catch (err) {
            console.error("Failed to load problems:", err);
        }
    };

    // Initiate change question request to opponent
    const handleInitiateQuestionChange = (selectedProb: any) => {
        if (!sessionChannelRef.current || !user) return;

        sessionChannelRef.current.send({
            type: "broadcast",
            event: "sync",
            payload: {
                type: "request_question_change",
                senderId: user.id,
                problemId: selectedProb.id,
                problemTitle: selectedProb.title
            }
        });

        setPendingQuestionChangeRequest(selectedProb);
        setShowChangeModal(false);
    };

    // Decline question change request
    const handleDeclineQuestionChange = () => {
        if (!sessionChannelRef.current || !user || !incomingQuestionChangeRequest) return;

        sessionChannelRef.current.send({
            type: "broadcast",
            event: "sync",
            payload: {
                type: "decline_question_change",
                senderId: user.id
            }
        });

        setIncomingQuestionChangeRequest(null);
    };

    // Accept question change request
    const handleAcceptQuestionChange = async () => {
        if (!sessionChannelRef.current || !user || !incomingQuestionChangeRequest) return;

        sessionChannelRef.current.send({
            type: "broadcast",
            event: "sync",
            payload: {
                type: "accept_question_change",
                senderId: user.id,
                problemId: incomingQuestionChangeRequest.problemId
            }
        });

        const targetId = incomingQuestionChangeRequest.problemId;
        setIncomingQuestionChangeRequest(null);
        await loadAndSetProblem(targetId);
    };

    // Cleanup session and search routines
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
            if (sessionChannelRef.current) {
                sessionChannelRef.current.send({
                    type: "broadcast",
                    event: "sync",
                    payload: {
                        type: "disconnect",
                        senderId: user?.id
                    }
                });
                sessionChannelRef.current.unsubscribe();
            }
        };
    }, [user?.id]);

    if (authLoading) return null;

    if (!user) {
        return (
            <div className={`flex-1 flex items-center justify-center p-4 min-h-screen ${isDark ? "bg-[#0B0C15]" : "bg-slate-50"}`}>
                <div className={`w-full max-w-md p-6 rounded-3xl border text-center shadow-sm bg-white/40 dark:bg-slate-900/50 backdrop-blur-2xl ${isDark ? "border-slate-800/30" : "border-slate-200/30"}`}>
                    <Swords className="w-12 h-12 mx-auto text-indigo-500 mb-4 animate-bounce" />
                    <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Login Required</h2>
                    <p className="text-slate-455 dark:text-slate-400 mt-2 text-xs">You must be logged in to enter Vlyxir Arena Duels.</p>
                    <button
                        onClick={() => router.push(`/login?next=${encodeURIComponent("/duel")}`)}
                        className="mt-5 w-full py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                        Sign In Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`h-[calc(100vh-80px)] flex flex-col min-h-0 relative overflow-hidden font-sans ${isDark ? "text-slate-100 bg-[#0B0C15]" : "text-slate-900 bg-slate-50"}`}>
            {/* Visual Backdrops - Blue / Violet themed */}
            <div className={`pointer-events-none absolute inset-0 ${isDark
                ? "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_40%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_35%)]"
                : "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.1),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.5),transparent_36%)]"
            }`} />

            {/* Float Emojis Layer */}
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {floatingEmotes.map((e) => (
                    <motion.div
                        key={e.id}
                        initial={{ opacity: 0, scale: 0.5, y: "100%", x: e.side === "left" ? "20%" : "80%" }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.5, 1.5, 1], y: "20%" }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        className="absolute text-5xl bottom-10"
                    >
                        {e.char}
                    </motion.div>
                ))}
            </div>

            <main className="flex-1 flex flex-col min-h-0 relative z-10 p-4 md:p-6 lg:p-8">
                {/* 1. LOBBY STATE */}
                {uiState === "lobby" && (
                    <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`w-full p-8 rounded-4xl border backdrop-blur-2xl text-center shadow-lg ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}
                        >
                            <div className="h-20 w-20 mx-auto rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5">
                                <Swords className="w-10 h-10 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Competitive 1v1 Arena</h2>
                            <p className={`mt-2 text-xs max-w-sm mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Match with other programmers worldwide or challenge your friends in real-time speed coding battles! Restricted to **Python**.
                            </p>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    onClick={() => setUiState("searching")}
                                    className="w-full py-4 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95 transition-all cursor-pointer"
                                >
                                    Start Public Matchmaking ⚔️
                                </button>
                            </div>
                        </motion.div>

                        {/* Challenging active following/followers card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`w-full p-6 rounded-4xl border backdrop-blur-2xl text-left shadow-lg ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}
                        >
                            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-1">
                                <span className="text-indigo-500">⚔️</span> Challenge a Friend
                            </h3>

                            {socialLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : connectionsList.length > 0 ? (
                                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar w-full">
                                    {connectionsList.map((player) => (
                                        <div
                                            key={player.id}
                                            className="p-3 rounded-2xl border flex items-center justify-between transition-all w-full bg-white/50 border-slate-200/50 hover:bg-white dark:bg-slate-950/20 dark:border-slate-800/40 dark:hover:bg-slate-900/30"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-black relative overflow-hidden shrink-0 shadow-xs">
                                                    {player.username[0].toUpperCase()}
                                                </div>
                                                <div className="truncate text-left">
                                                    <p className="font-bold text-xs truncate leading-none mb-0.5 text-slate-800 dark:text-slate-200">{player.full_name}</p>
                                                    <p className="text-[9px] text-slate-455 dark:text-slate-400 leading-none">@{player.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleChallengePlayer(player)}
                                                className="px-3 py-1.5 rounded-xl text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shrink-0 cursor-pointer"
                                            >
                                                Challenge
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border border-dashed rounded-3xl border-slate-200/50 dark:border-slate-800/40 text-slate-455 dark:text-slate-400 text-xs font-bold bg-white/10 dark:bg-slate-900/10">
                                    No followings yet
                                </div>
                            )}
                        </motion.div>

                        {/* Incoming Challenges alerts overlay */}
                        {incomingChallenge && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-2xl shadow-xl flex items-center justify-between gap-4`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                                        <Flame size={24} className="animate-bounce" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm text-indigo-500 uppercase tracking-wider">Duel Challenge Received!</h3>
                                        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-350" : "text-slate-600"}`}>
                                            <strong>@{incomingChallenge.challengerUsername}</strong> has challenged you to a 1v1 coding duel!
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeclineChallenge}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isDark ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={handleAcceptChallenge}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
                                    >
                                        Accept ⚔️
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* 2. MATCHMAKING / SEARCHING QUEUE STATE */}
                {uiState === "searching" && (
                    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`w-full p-8 rounded-4xl border text-center shadow-xl backdrop-blur-2xl ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}
                        >
                            <div className="relative flex items-center justify-center h-24 w-24 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-lg" />
                                <Swords className="w-10 h-10 text-indigo-500 animate-pulse" />
                            </div>

                            {challengeTargetProfile ? (
                                <>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Direct Challenge Pending</h3>
                                    <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-605"}`}>
                                        Waiting for <strong>@{challengeTargetProfile.username}</strong> to accept your 1v1 duel challenge request...
                                    </p>
                                    <div className="mt-6 p-4 rounded-2xl border flex items-center gap-3 bg-white/50 border-slate-200 dark:bg-slate-800/10 dark:border-slate-800 max-w-xs mx-auto">
                                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-black relative overflow-hidden">
                                            {challengeTargetProfile.username[0].toUpperCase()}
                                        </div>
                                        <div className="text-left truncate">
                                            <p className="font-bold text-xs truncate text-slate-800 dark:text-slate-250">{challengeTargetProfile.full_name}</p>
                                            <p className="text-[10px] text-slate-455 dark:text-slate-400">@{challengeTargetProfile.username}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Finding Opponent</h3>
                                    <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-605"}`}>
                                        Searching queue for concurrent players...
                                    </p>
                                    <div className="mt-4 text-3xl font-black font-mono text-indigo-500 tabular-nums">
                                        {String(Math.floor(searchTime / 60)).padStart(2, "0")}:{String(searchTime % 60).padStart(2, "0")}
                                    </div>
                                </>
                            )}

                            {matchmakingTimeout && (
                                <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                                    Queue is taking longer than usual. You can cancel and retry or wait.
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setUiState("lobby");
                                    setChallengeTargetProfile(null);
                                }}
                                className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${isDark ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-650 hover:bg-slate-100"}`}
                            >
                                Cancel Queue
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* 3. ACTIVE BATTLE STATE */}
                {uiState === "battle" && (
                    <div className="flex-1 flex flex-col min-h-0 w-full">
                        {/* Incoming Question Change Request Alert */}
                        {incomingQuestionChangeRequest && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-4 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-2xl shadow-xl flex items-center justify-between gap-4 shrink-0"
                            >
                                <div className="flex items-center gap-3">
                                    <Swords className="w-5 h-5 text-indigo-500 animate-bounce" />
                                    <div>
                                        <h4 className="font-black text-xs text-indigo-500 uppercase tracking-wider">Opponent Question Change Request</h4>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            The competitor wants to change the question to <strong>"{incomingQuestionChangeRequest.problemTitle}"</strong>.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={handleDeclineQuestionChange}
                                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-slate-800 text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        Decline
                                    </button>
                                    <button
                                        onClick={handleAcceptQuestionChange}
                                        className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-white bg-indigo-650 hover:bg-indigo-755 shadow-xs cursor-pointer animate-pulse"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 w-full">
                            {/* LEFT PANEL: PROBLEM SPECS */}
                        <div className={`w-full lg:w-1/3 flex flex-col min-h-0 rounded-4xl border backdrop-blur-2xl p-6 ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}>
                            {currentProblem ? (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0`}>
                                                {currentProblem.difficulty || "Medium"}
                                            </span>
                                            <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white truncate">{currentProblem.title}</h2>
                                        </div>
                                        {!hasRequestedQuestionChange && !hasSubmitted && !opponentSubmitted && (
                                            pendingQuestionChangeRequest ? (
                                                <span className="text-[9px] font-bold text-amber-500 animate-pulse bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                                                    Pending...
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={handleOpenQuestionChangeModal}
                                                    className="px-2.5 py-1 rounded-lg text-[9px] font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer shrink-0"
                                                >
                                                    Change Question
                                                </button>
                                            )
                                        )}
                                    </div>
                                    {pendingQuestionChangeRequest && (
                                        <div className="mb-4 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500 text-[10px] font-bold flex items-center justify-between shrink-0">
                                            <span>Waiting for opponent to approve change to "{pendingQuestionChangeRequest.title}"</span>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                        </div>
                                    )}
                                    <div className={`flex-1 overflow-y-auto text-xs leading-relaxed pr-2 custom-scrollbar ${isDark ? "text-slate-350" : "text-slate-600"}`}>
                                        <p className="font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-widest text-[10px]">Problem Description</p>
                                        <p className="mb-4 whitespace-pre-wrap">{currentProblem.description}</p>
                                        
                                        {currentProblem.input_format && (
                                            <>
                                                <p className="font-semibold text-slate-900 dark:text-white mb-1 uppercase tracking-widest text-[10px]">Input Format</p>
                                                <p className="mb-4">{currentProblem.input_format}</p>
                                            </>
                                        )}

                                        {currentProblem.output_format && (
                                            <>
                                                <p className="font-semibold text-slate-900 dark:text-white mb-1 uppercase tracking-widest text-[10px]">Output Format</p>
                                                <p className="mb-4">{currentProblem.output_format}</p>
                                            </>
                                        )}

                                        {currentProblem.sample_test_cases && currentProblem.sample_test_cases.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                <p className="font-semibold text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Sample Test Cases</p>
                                                {currentProblem.sample_test_cases.map((tc, idx) => (
                                                    <div key={idx} className={`p-3 rounded-2xl border font-mono text-[10px] space-y-1.5 ${isDark ? "bg-slate-950/40 border-slate-800/40" : "bg-white border-slate-200"}`}>
                                                        <p><strong className="text-indigo-400">Input:</strong> {tc.input}</p>
                                                        <p><strong className="text-emerald-400">Output:</strong> {tc.output}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Loading Battle Specs...</p>
                                </div>
                            )}
                        </div>

                        {/* CENTER PANEL: MONACO EDITOR */}
                        <div className={`w-full lg:w-5/12 flex flex-col min-h-0 rounded-4xl border backdrop-blur-2xl overflow-hidden ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}>
                            {/* Editor Header */}
                            <div className={`px-5 py-3 border-b flex items-center justify-between ${isDark ? "border-slate-850 bg-slate-950/20" : "border-slate-200 bg-slate-50/70"}`}>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">playground.py (PYTHON RUNTIME)</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGiveUp}
                                        disabled={isRunning}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shrink-0"
                                    >
                                        <Flag size={10} />
                                        GIVE UP
                                    </button>
                                    <button
                                        onClick={handleSubmitCode}
                                        disabled={isRunning || !currentProblem || hasSubmitted}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black text-white bg-indigo-650 hover:bg-indigo-755 active:scale-95 transition-all cursor-pointer shrink-0"
                                    >
                                        {hasSubmitted ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                SUBMITTED
                                            </>
                                        ) : isRunning ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                RUNNING...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={10} fill="currentColor" />
                                                SUBMIT CODE
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 relative min-h-0">
                                <CodeEditor
                                    code={code}
                                    setCode={(val) => {
                                        setCode(val);
                                        syncTelemetry(submitResult?.summary?.passed || 0, submitResult?.summary?.total || 0, val, cursorLine, false);
                                    }}
                                    isDisabled={isRunning || hasSubmitted}
                                    isDark={isDark}
                                />
                                {hasSubmitted && (
                                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
                                        <p className="text-xs font-black text-white tracking-widest uppercase">Code Submitted</p>
                                        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Waiting for opponent to submit their solution...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL: DYNAMIC LIVE COMPETITIVE DASHBOARD */}
                        <div className="w-full lg:w-1/4 flex flex-col gap-4 min-h-0">
                            {/* Opponent Status panel */}
                            <div className={`p-5 rounded-4xl border backdrop-blur-2xl flex flex-col justify-between shrink-0 ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="text-indigo-400" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">Competitor Status</span>
                                </div>

                                <div className="space-y-4">
                                    {/* Opponent Card */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-black relative overflow-hidden shrink-0 shadow-xs">
                                            {opponent?.username[0].toUpperCase()}
                                        </div>
                                        <div className="truncate min-w-0">
                                            <p className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{opponent?.full_name}</p>
                                            <p className="text-[10px] text-slate-455 dark:text-slate-400">@{opponent?.username}</p>
                                        </div>
                                    </div>

                                    {opponentSubmitted ? (
                                        <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-center uppercase tracking-wider shrink-0 mt-2">
                                            Opponent Submitted!
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-lg border border-indigo-500/10 text-center uppercase tracking-wider shrink-0 mt-2 animate-pulse">
                                            Opponent is Coding...
                                        </div>
                                    )}

                                    {/* Test cases passed progress bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-black">
                                            <span className="text-slate-455 dark:text-slate-400">Progress</span>
                                            <span className="text-indigo-400">
                                                {(hasSubmitted && opponentSubmitted) 
                                                    ? `${opponentProgress.passCount} / ${opponentProgress.totalCount || 0} Solved`
                                                    : "Hidden until both submit"}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${
                                                        (hasSubmitted && opponentSubmitted) && opponentProgress.totalCount > 0
                                                            ? (opponentProgress.passCount / opponentProgress.totalCount) * 100
                                                            : 0
                                                    }%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Other live diagnostics */}
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-455 dark:text-slate-400">
                                        <div className="p-2 rounded-xl bg-white/40 dark:bg-slate-500/5 border border-slate-200/50 dark:border-slate-800/40 flex flex-col">
                                            <span>Cursor Line</span>
                                            <span className="text-slate-900 dark:text-white font-black mt-1 font-mono">
                                                Line {opponentProgress.cursorLine}
                                            </span>
                                        </div>
                                        <div className="p-2 rounded-xl bg-white/40 dark:bg-slate-500/5 border border-slate-200/50 dark:border-slate-800/40 flex flex-col">
                                            <span>Keystrokes</span>
                                            <span className="text-slate-900 dark:text-white font-black mt-1 font-mono">
                                                {opponentProgress.charCount} chars
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Local Submission Tests log */}
                            <div className={`flex-1 p-5 rounded-4xl border backdrop-blur-2xl flex flex-col min-h-0 ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}>
                                <div className="flex items-center gap-2 mb-3 shrink-0">
                                    <Terminal className="text-indigo-400" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">Compiler Test Log</span>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {testResults.length > 0 ? (
                                        <div className="space-y-2">
                                            {testResults.map((tc, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-3 rounded-2xl border text-[10px] font-mono flex items-center justify-between ${
                                                        tc.status === "Success"
                                                            ? isDark
                                                                ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                                                                : "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                            : isDark
                                                            ? "bg-rose-500/5 border-rose-500/10 text-rose-400"
                                                            : "bg-rose-50 border-rose-100 text-rose-600"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {tc.status === "Success" ? (
                                                            <CheckCircle2 size={12} />
                                                        ) : (
                                                            <XCircle size={12} />
                                                        )}
                                                        <span>Case #{tc.test_case}</span>
                                                    </div>
                                                    <span className="font-bold">{tc.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                            <Cpu size={24} className="mb-2" />
                                            <p className="text-[9px] uppercase tracking-widest font-black">Submit code to compile</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Floating emote reactions triggers */}
                            <div className={`p-4 rounded-4xl border backdrop-blur-2xl shrink-0 ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Smile className="text-indigo-400" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-300">Duel Emotes</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {DUEL_EMOTES.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleSendEmote(emoji)}
                                            className={`p-2 rounded-xl text-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-90`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* 4. GAME OVER RESULTS PANEL STATE */}
                {uiState === "results" && (
                    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`w-full p-8 rounded-4xl border text-center shadow-xl backdrop-blur-2xl ${isDark ? "border-slate-800/30 bg-slate-900/60" : "border-slate-250/20 bg-white/30"}`}
                        >
                            <Trophy className={`w-16 h-16 mx-auto mb-4 ${submitResult?.outcome === "victory" ? "text-indigo-500 animate-bounce" : (submitResult?.outcome === "draw" ? "text-amber-500 animate-pulse" : "text-slate-450")}`} />
                            <h2 className="text-3xl font-black tracking-tight uppercase text-slate-900 dark:text-white">
                                {submitResult?.outcome === "victory" ? "🎉 VICTORY" : (submitResult?.outcome === "draw" ? "🤝 DRAW" : "💀 DEFEAT")}
                            </h2>
                            <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-350" : "text-slate-600"}`}>
                                {submitResult?.msg || "The challenge has concluded."}
                            </p>

                            {/* Performance metrics breakdown */}
                            <div className="mt-6 p-5 rounded-3xl border text-left space-y-4 bg-white/30 border-slate-200/50 dark:bg-slate-950/20 dark:border-slate-800">
                                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b pb-2 dark:border-slate-800">
                                    Duel Performance Log
                                </h3>
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">Target Problem</span>
                                        <span className="text-slate-800 dark:text-slate-200">{currentProblem?.title || "Python Level"}</span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">Your Score</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-mono">
                                            {submitResult?.myScore !== undefined ? `${submitResult.myScore} / ${submitResult.myTotal}` : "0 / 0"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">Opponent Score</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-mono">
                                            {submitResult?.opponentScore !== undefined ? `${submitResult.opponentScore} / ${submitResult.opponentTotal}` : "0 / 0"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-slate-400">Winner</span>
                                        <span className="text-indigo-500 font-black">
                                            {submitResult?.outcome === "victory" ? "You" : (submitResult?.outcome === "draw" ? "None (Draw)" : `@${opponent?.username}`)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setUiState("lobby");
                                    setChallengeTargetProfile(null);
                                }}
                                className="mt-8 w-full py-4 rounded-2xl text-xs font-black text-white bg-indigo-650 hover:bg-indigo-755 shadow-lg active:scale-95 transition-all cursor-pointer"
                            >
                                Return to Arena Lobby
                            </button>
                        </motion.div>
                    </div>
                )}
                {/* 5. QUESTION SELECTION MODAL FOR QUESTION CHANGE APPEAL */}
                {showChangeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`w-full max-w-lg p-6 rounded-4xl border shadow-2xl flex flex-col max-h-[80vh] backdrop-blur-2xl ${isDark ? "border-slate-800 bg-[#0F101A]" : "border-slate-200 bg-white"}`}
                        >
                            <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-slate-800 shrink-0">
                                <div>
                                    <h3 className="text-md font-black tracking-tight text-slate-900 dark:text-white">Appeal Question Change</h3>
                                    <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-0.5">Select a new python coding challenge to propose to your opponent.</p>
                                </div>
                                <button
                                    onClick={() => setShowChangeModal(false)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer p-1"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-2.5 custom-scrollbar min-h-0">
                                {allProblems.map((prob) => (
                                    <div
                                        key={prob.id}
                                        onClick={() => handleInitiateQuestionChange(prob)}
                                        className="p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer bg-white/40 border-slate-200 hover:bg-indigo-500/5 hover:border-indigo-500/35 dark:bg-slate-950/20 dark:border-slate-800/60 dark:hover:bg-slate-900/35"
                                    >
                                        <div className="text-left min-w-0 pr-4">
                                            <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{prob.title}</p>
                                            <p className="text-[9px] text-slate-455 dark:text-slate-400 truncate mt-0.5">{prob.description?.substring(0, 100) || "No description available"}...</p>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 select-none">
                                            {prob.difficulty || "Medium"}
                                        </span>
                                    </div>
                                ))}
                                {allProblems.length === 0 && (
                                    <div className="text-center py-10 text-xs font-semibold text-slate-455">No alternative questions available</div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 shrink-0 text-right">
                                <button
                                    onClick={() => setShowChangeModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
