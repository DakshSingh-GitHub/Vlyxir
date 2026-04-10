"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    FileText,
    Hash,
    Info,
    PenSquare,
    Send,
    Sparkles,
    X,
} from "lucide-react";
import { useAppContext } from "../../lib/context";
import { useAuth } from "../../lib/auth-context";
import { fetchChannels, publishPost, ForumChannel } from "../forum-helper/helper";

export default function CreatePostPage() {
    const { isDark } = useAppContext();
    const { user } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [channels, setChannels] = useState<ForumChannel[]>([]);
    const [selectedChannelId, setSelectedChannelId] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadChannels() {
            const data = await fetchChannels();
            setChannels(data);
            if (data.length > 0) {
                setSelectedChannelId(data[0].id);
            }
        }

        loadChannels();
    }, []);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/^#/, "");
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handlePublish = async () => {
        if (!title.trim() || !body.trim()) {
            setError("Title and content are required to illuminate the forum.");
            return;
        }
        if (!selectedChannelId) {
            setError("Please select a destination channel.");
            return;
        }
        if (!user) {
            setError("Authentication required to share your wisdom.");
            return;
        }

        setIsPublishing(true);
        setError(null);

        const { error: publishError } = await publishPost(
            title.trim(),
            body.trim(),
            selectedChannelId,
            tags,
            user
        );

        setIsPublishing(false);

        if (publishError) {
            setError(publishError.message || "A cosmic interference occurred. Please try again.");
        } else {
            router.push("/forum");
        }
    };

    const wordCount = body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;
    const readTime = wordCount === 0 ? 0 : Math.ceil(wordCount / 220);
    const paragraphCount = body
        .split(/\n+/)
        .map((segment) => segment.trim())
        .filter(Boolean).length;

    const shellClass = isDark
        ? "border-white/8 bg-slate-950/65 text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)]"
        : "border-slate-200/80 bg-white/88 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.10)]";
    const mutedTextClass = isDark ? "text-slate-400" : "text-slate-500";
    const subtlePanelClass = isDark
        ? "border-white/8 bg-slate-900/55"
        : "border-slate-200/80 bg-white/92";
    const inputClass = isDark
        ? "border-white/8 bg-slate-950/80 text-slate-100 placeholder:text-slate-500"
        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400";

    return (
        <div className={`relative flex h-full min-h-0 flex-1 overflow-hidden ${isDark ? "bg-[#0b1020] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className={`absolute left-[-10%] top-[-12%] h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-cyan-500/12" : "bg-cyan-300/30"}`} />
                <div className={`absolute right-[-8%] top-[8%] h-96 w-96 rounded-full blur-3xl ${isDark ? "bg-indigo-500/14" : "bg-indigo-300/35"}`} />
                <div className={`absolute bottom-[-8%] left-[20%] h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-fuchsia-500/10" : "bg-violet-300/30"}`} />
            </div>

            <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[1760px] flex-col px-4 pt-4 pb-8 md:px-6 md:pt-5 md:pb-10 xl:px-8 xl:pb-12">
                <header className={`mb-4 flex-shrink-0 rounded-[1.75rem] border p-5 md:p-6 backdrop-blur-xl ${shellClass}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? "bg-white/5 text-cyan-300" : "bg-cyan-50 text-cyan-700"}`}>
                            <Sparkles className="h-3.5 w-3.5" />
                            Forum Composer
                        </span>
                        <span className={`text-xs font-medium ${mutedTextClass}`}>
                            Build a post that is easy to scan, helpful, and worth replying to.
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-4xl space-y-2">
                            <Link
                                href="/forum"
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${isDark ? "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to forum
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight md:text-3xl">Create a post</h1>
                                <p className={`mt-1 max-w-2xl text-sm ${mutedTextClass}`}>
                                    Full-canvas composer with a fixed page layout and a wider workspace.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-3">
                            <Link
                                href="/forum"
                                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${isDark ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing || !title.trim() || !body.trim()}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPublishing ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Publish post
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-4 flex-shrink-0">
                        <div className="flex items-start gap-3 rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
                            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid flex-1 min-h-0 items-stretch gap-5 lg:grid-cols-[minmax(0,1.35fr)_400px] xl:grid-cols-[minmax(0,1.45fr)_430px]">
                    <section className="flex min-h-0 flex-col gap-4 self-stretch">
                        <div className={`flex-shrink-0 rounded-[1.75rem] border p-4 md:p-5 backdrop-blur-xl ${subtlePanelClass}`}>
                            <label className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                                <PenSquare className="h-4 w-4" />
                                Title
                            </label>
                            <input
                                type="text"
                                placeholder="What do you want to discuss?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`w-full rounded-[1.4rem] border px-5 py-3.5 text-2xl font-black tracking-tight outline-none transition focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10 md:text-3xl ${inputClass}`}
                            />
                        </div>

                        <div className={`flex flex-1 min-h-[34rem] flex-col rounded-[2rem] border backdrop-blur-xl ${shellClass}`}>
                            <div className={`flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-white/8" : "border-slate-200/80"}`}>
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <FileText className="h-4 w-4 text-indigo-400" />
                                        Write your post
                                    </div>
                                    <p className={`mt-1 text-xs ${mutedTextClass}`}>
                                        The page stays fixed; only the editor scrolls if your draft grows longer.
                                    </p>
                                </div>

                                <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                    Markdown-ready
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col p-4 md:p-5">
                                <textarea
                                    placeholder={"Start with the problem, the idea, or the question.\n\nExample:\n## What I tried\n- Explain the setup\n- Share the bug or result\n- Ask for the specific help you need"}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className={`h-full min-h-[24rem] w-full resize-none rounded-[1.6rem] border px-5 py-4 text-base leading-7 outline-none transition focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10 md:min-h-[28rem] md:px-6 md:py-5 md:text-lg lg:min-h-[32rem] ${inputClass}`}
                                />
                            </div>

                            <div className={`flex flex-shrink-0 flex-wrap items-center gap-3 border-t px-5 py-3.5 ${isDark ? "border-white/8" : "border-slate-200/80"}`}>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                    {wordCount} words
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                    {paragraphCount} paragraphs
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                                    {readTime} min read
                                </span>
                            </div>
                        </div>
                    </section>

                    <aside className="flex min-h-0 flex-col gap-4 self-stretch">
                        <div className={`flex-shrink-0 rounded-[1.75rem] border p-4 md:p-5 backdrop-blur-xl ${subtlePanelClass}`}>
                            <div className="mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-indigo-400" />
                                <h3 className="text-sm font-bold uppercase tracking-[0.18em]">Quick tips</h3>
                            </div>
                            <ul className={`space-y-2.5 text-sm ${mutedTextClass}`}>
                                <li>Lead with the exact problem, insight, or question.</li>
                                <li>Use headings to separate context, attempts, and results.</li>
                                <li>Add tags that help the right readers find your post.</li>
                            </ul>
                        </div>

                        <div className={`flex-shrink-0 rounded-[1.75rem] border p-4 md:p-5 backdrop-blur-xl ${shellClass}`}>
                            <div className="mb-4">
                                <h2 className="text-base font-bold">Post settings</h2>
                                <p className={`mt-1 text-xs ${mutedTextClass}`}>
                                    Choose a channel, add tags, then publish when the draft feels ready.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                                        <Hash className="h-4 w-4" />
                                        Channel
                                    </label>
                                    <select
                                        value={selectedChannelId}
                                        onChange={(e) => setSelectedChannelId(e.target.value)}
                                        className={`w-full rounded-[1.15rem] border px-4 py-3 text-sm font-semibold outline-none transition focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/10 ${inputClass}`}
                                    >
                                        {channels.length === 0 && <option disabled>Loading channels...</option>}
                                        {channels.map((channel) => (
                                            <option key={channel.id} value={channel.id}>
                                                {channel.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={`mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${mutedTextClass}`}>
                                        <Hash className="h-4 w-4" />
                                        Tags
                                    </label>
                                    <div className={`rounded-[1.35rem] border p-3 ${inputClass}`}>
                                        <div className="mb-3 flex min-h-[32px] flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? "bg-indigo-500/12 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}
                                                >
                                                    #{tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="opacity-60 transition hover:opacity-100"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Type a tag and press Enter"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleAddTag}
                                            className={`w-full bg-transparent text-sm font-medium outline-none ${isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"}`}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePublish}
                                    disabled={isPublishing || !title.trim() || !body.trim()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isPublishing ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Publish post
                                        </>
                                    )}
                                </button>

                                {!user && (
                                    <p className={`text-xs ${mutedTextClass}`}>
                                        Sign in to publish this draft.
                                    </p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
