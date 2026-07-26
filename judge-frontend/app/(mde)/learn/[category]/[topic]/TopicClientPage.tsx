"use client";

import { use, useEffect, useState, useCallback } from "react";
import { getTopicBySlug } from "../../../../lib/data/learnData";
import { getLearningProgress, toggleTopicStatus } from "../../../../lib/utils/storage";
import TopicViewer from "../../components/TopicViewer";

interface TopicPageProps {
    params: Promise<{
        category: string;
        topic: string;
    }>;
}

export default function TopicClientPage({ params }: TopicPageProps) {
    const resolvedParams = use(params);
    const topicData = getTopicBySlug(resolvedParams.category, resolvedParams.topic);

    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());

    useEffect(() => {
        let isMounted = true;
        async function fetchProgress() {
            try {
                const supabaseProgress = await getLearningProgress();
                
                if (supabaseProgress && isMounted) {
                    const completed = new Set<string>();
                    const bookmarked = new Set<string>();
                    
                    supabaseProgress.forEach(p => {
                        if (p.is_completed) completed.add(p.topic_id);
                        if (p.is_bookmarked) bookmarked.add(p.topic_id);
                    });
                    
                    setCompletedTopics(completed);
                    setBookmarkedTopics(bookmarked);
                } else if (isMounted) {
                    const savedCompleted = localStorage.getItem("vlyxir_learn_completed");
                    if (savedCompleted) {
                        setCompletedTopics(new Set(JSON.parse(savedCompleted)));
                    }
                    const savedBookmarked = localStorage.getItem("vlyxir_learn_bookmarked");
                    if (savedBookmarked) {
                        setBookmarkedTopics(new Set(JSON.parse(savedBookmarked)));
                    }
                }
            } catch (e) {
                console.error("Error fetching learner progress", e);
            }
        }
        
        fetchProgress();
        return () => { isMounted = false; };
    }, []);

    const toggleCompleted = useCallback(() => {
        if (!topicData) return;
        setCompletedTopics(prev => {
            const next = new Set(prev);
            const newValue = !next.has(topicData.id);
            if (newValue) {
                next.add(topicData.id);
            } else {
                next.delete(topicData.id);
            }
            localStorage.setItem("vlyxir_learn_completed", JSON.stringify(Array.from(next)));
            toggleTopicStatus(topicData.id, 'is_completed', newValue).catch(console.error);
            return next;
        });
    }, [topicData]);

    const toggleBookmark = useCallback(() => {
        if (!topicData) return;
        setBookmarkedTopics(prev => {
            const next = new Set(prev);
            const newValue = !next.has(topicData.id);
            if (newValue) {
                next.add(topicData.id);
            } else {
                next.delete(topicData.id);
            }
            localStorage.setItem("vlyxir_learn_bookmarked", JSON.stringify(Array.from(next)));
            toggleTopicStatus(topicData.id, 'is_bookmarked', newValue).catch(console.error);
            return next;
        });
    }, [topicData]);

    if (!topicData) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Topic Not Found</h2>
                <p className="text-xs text-slate-500 max-w-sm">
                    The requested learning topic standard does not exist or has been relocated. Select a topic from the curriculum sidebar.
                </p>
            </div>
        );
    }

    return (
        <TopicViewer
            topic={topicData}
            isCompleted={completedTopics.has(topicData.id)}
            isBookmarked={bookmarkedTopics.has(topicData.id)}
            onToggleCompleted={toggleCompleted}
            onToggleBookmark={toggleBookmark}
        />
    );
}
