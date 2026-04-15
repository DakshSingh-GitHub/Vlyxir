/* eslint-disable prefer-const */
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ChevronLeft,
    FileText,
    Hash,
    PenSquare,
    Send,
    Sparkles,
    X,
    Settings,
} from "lucide-react";
import { useAppContext } from "../../lib/context";
import { useAuth } from "../../lib/auth-context";
import { fetchChannels, publishPost, ForumChannel, checkProfanity } from "../forum-helper/helper";
import ProfanityModal from "../forum-helper/ProfanityModal";
import CreatePostErrorModal from "../forum-helper/CreatePostErrorModal";

const COMMON_TAGS = [
    "bug", "feature-request", "question", "discussion", "help-wanted", "solved", "tutorial", "announcement",
    "python", "javascript", "typescript", "cpp", "java", "rust", "go", "swift", "kotlin", "csharp",
    "react", "nextjs", "vue", "angular", "svelte", "tailwind", "node", "express", "django", "flask", "fastapi", "spring", "laravel",
    "database", "sql", "nosql", "mongodb", "postgresql", "redis", "prisma", "supabase",
    "frontend", "backend", "fullstack", "mobile", "devops", "ai", "ml", "security", "performance",
    "leetcode", "algorithms", "data-structures", "interview-prep"
];



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
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [isLoadingChannels, setIsLoadingChannels] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredTags, setFilteredTags] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showProfanityModal, setShowProfanityModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        async function loadChannels() {
            setIsLoadingChannels(true);
            const data = await fetchChannels();
            setChannels(data);
            if (data.length > 0) {
                setSelectedChannelId(data[0].id);
            }
            setIsLoadingChannels(false);
        }

        loadChannels();
    }, []);

    const handleAddTag = (tagToAdd: string) => {
        const newTag = tagToAdd.trim().replace(/^#/, "");
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput("");
        setShowDropdown(false);
    };

    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTagInput(value);

        if (value.trim()) {
            const search = value.trim().toLowerCase().replace(/^#/, "");
            const filtered = COMMON_TAGS.filter(tag => 
                tag.toLowerCase().includes(search) && !tags.includes(tag)
            ).slice(0, 8); // Limit to 8 suggestions
            
            setFilteredTags(filtered);
            setShowDropdown(filtered.length > 0);
            setActiveIndex(0);
        } else {
            setShowDropdown(false);
        }
    };

    const onTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showDropdown && filteredTags.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % filteredTags.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + filteredTags.length) % filteredTags.length);
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                handleAddTag(filteredTags[activeIndex]);
            } else if (e.key === "Escape") {
                setShowDropdown(false);
            }
        } else if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAddTag(tagInput);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handlePublish = async () => {
        if (!title.trim() || !body.trim()) {
            setErrorMessage("Title and content are required to illuminate the forum.");
            setShowErrorModal(true);
            return;
        }
        if (!selectedChannelId) {
            setErrorMessage("Please select a destination channel.");
            setShowErrorModal(true);
            return;
        }
        if (!user) {
            setErrorMessage("Authentication required to share your wisdom.");
            setShowErrorModal(true);
            return;
        }
        if (checkProfanity(`${title} ${body}`)) {
            setShowProfanityModal(true);
            return;
        }

        setIsPublishing(true);

        const { error: publishError } = await publishPost(
            title.trim(),
            body.trim(),
            selectedChannelId,
            tags,
            user
        );

        setIsPublishing(false);

        if (publishError) {
            setErrorMessage(publishError.message || "A cosmic interference occurred. Please try again.");
            setShowErrorModal(true);
        } else {
            router.refresh();
            router.push("/forum");
        }
    };

    const wordCount = body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;
    const readTime = wordCount === 0 ? 0 : Math.ceil(wordCount / 220);

    const renderSimpleMarkdown = (text: string) => {
        let html = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") 
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-inherit">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-inherit">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-6 mb-4 text-inherit">$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-inherit">$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
            .replace(/```([\s\S]*?)```/gim, `<pre class="p-4 rounded-xl my-4 overflow-x-auto text-sm ${isDark ? 'bg-slate-950 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-800 border border-slate-200'}"><code>$1</code></pre>`)
            .replace(/`(.*?)`/gim, `<code class="px-1.5 py-0.5 rounded-md text-sm ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}">$1</code>`)
            .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc mb-1">$1</li>')
            .replace(/\n\s*\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br/>');
        return `<div class="mb-4 leading-relaxed">${html}</div>`;
    };

    // Styling constants mapped to Slate/Midnight palette explicitly
    const bgApp = isDark ? "bg-[#0a0f18] text-slate-50" : "bg-slate-50 text-slate-900";
    const bgCard = isDark ? "bg-slate-900/40 backdrop-blur-2xl border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "bg-white border-slate-200 shadow-sm";
    const inputClass = isDark
        ? "bg-slate-950/50 border-slate-800 text-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900/80 placeholder:text-slate-600"
        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400";
    const mutedTextClass = isDark ? "text-slate-400" : "text-slate-500";
    const labelClass = `text-[11px] font-bold uppercase tracking-[0.15em] ${mutedTextClass}`;

    return (
        <div className={`flex min-h-screen flex-col font-sans selection:bg-indigo-500/30 ${bgApp}`}>
            <div className="mx-auto w-full max-w-350 px-6 py-12 flex-1 flex flex-col gap-8">

                <header className="flex flex-col w-full relative">
                    <div className="absolute -top-8 left-0">
                        <Link
                            href="/forum"
                            className={`flex items-center text-sm font-semibold transition-colors ${
                                isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1.5" />
                            Back to forum
                        </Link>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full mt-2 gap-6 md:gap-0">
                        <h1 className={`text-3xl font-black tracking-tight leading-none ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                            Create a post
                        </h1>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/forum"
                                className={`px-6 py-2 rounded-xl border text-sm font-bold transition-all ${
                                    isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-50" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:active:scale-100"
                            >
                                {isPublishing ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Publish
                            </button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-8 items-stretch">
                    
                    {/* Main Composer (Left Column) */}
                    <div className="flex flex-col gap-6">
                        
                        <div className={`p-6 border rounded-2xl ${bgCard}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <PenSquare className={`h-4 w-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                <label className={`${labelClass} leading-none m-0`}>Title</label>
                            </div>
                            <input
                                type="text"
                                placeholder="What do you want to discuss?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`w-full rounded-xl border p-4 text-xl font-bold outline-none transition-all ${inputClass}`}
                            />
                        </div>

                        <div className={`flex flex-col relative border rounded-2xl min-h-120 overflow-hidden ${bgCard}`}>
                            <div className={`p-6 pb-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className={`h-4 w-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                        <h3 className={`${labelClass} leading-none m-0`}>Write your post</h3>
                                    </div>
                                    <div className={`flex items-center p-1 rounded-lg ${isDark ? "bg-slate-950 border border-slate-800" : "bg-slate-100 border border-slate-200"}`}>
                                        <button 
                                            onClick={() => setActiveTab('write')}
                                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'write' ? (isDark ? "bg-slate-800 text-slate-100 shadow-sm" : "bg-white text-indigo-600 shadow-sm") : (isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700")}`}
                                        >
                                            Write
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('preview')}
                                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'preview' ? (isDark ? "bg-slate-800 text-slate-100 shadow-sm" : "bg-white text-indigo-600 shadow-sm") : (isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700")}`}
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {activeTab === 'write' ? (
                                <textarea
                                    placeholder={"Start with the problem, the idea, or the question.\n\nExample:\n## What I tried\n- Explain the setup\n- Share the bug or result\n- Ask for the specific help you need"}
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className={`flex-1 w-full bg-transparent p-6 pb-20 text-base leading-relaxed outline-none resize-y transition-all ${
                                        isDark ? "text-slate-100 placeholder:text-slate-600 focus:bg-slate-900/30" : "text-slate-900 placeholder:text-slate-400 focus:bg-slate-50/30"
                                    }`}
                                />
                            ) : (
                                <div className={`flex-1 w-full p-6 pb-20 overflow-y-auto ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                    {body.trim() ? (
                                        <div dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(body) }} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-sm font-medium opacity-50">
                                            Nothing to preview yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                    isDark ? "bg-slate-950/80 border-slate-800 text-slate-400 backdrop-blur-md" : "bg-white/80 border-slate-200 text-slate-500 backdrop-blur-md"
                                }`}>
                                    {wordCount} words
                                </span>
                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                    isDark ? "bg-slate-950/80 border-slate-800 text-slate-400 backdrop-blur-md" : "bg-white/80 border-slate-200 text-slate-500 backdrop-blur-md"
                                }`}>
                                    {readTime} min read
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="flex flex-col gap-6 h-full">

                        <div className={`p-6 border rounded-2xl ${bgCard}`}>
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className={`h-4 w-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                <h3 className={`${labelClass} leading-none m-0`}>Quick tips</h3>
                            </div>
                            <ul className={`space-y-4 text-sm font-medium leading-relaxed ${mutedTextClass}`}>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    Lead with the exact problem, insight, or question.
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    Use headings to separate context, attempts, and results.
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    Add tags that help the right readers find your post.
                                </li>
                            </ul>
                        </div>

                        <div className={`p-6 border rounded-2xl flex flex-col flex-1 ${bgCard}`}>
                            <div className="flex items-center gap-2 mb-8">
                                <Settings className={`h-4 w-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                <h2 className={`${labelClass} leading-none m-0`}>Post settings</h2>
                            </div>

                            <div className="flex flex-col gap-8">
                                <div>
                                    <label className={`flex items-center gap-2 mb-2 ${labelClass}`}>
                                        <Hash className="h-3.5 w-3.5" />
                                        Channel
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedChannelId}
                                            onChange={(e) => setSelectedChannelId(e.target.value)}
                                            className={`w-full rounded-xl border p-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer ${inputClass}`}
                                            disabled={isLoadingChannels}
                                        >
                                            {isLoadingChannels ? (
                                                <option disabled className={isDark ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500"}>
                                                    Loading channels...
                                                </option>
                                            ) : (
                                                channels.map((channel) => (
                                                    <option 
                                                        key={channel.id} 
                                                        value={channel.id}
                                                        className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}
                                                    >
                                                        {channel.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronLeft className="w-4 h-4 text-slate-500 -rotate-90" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={`flex items-center gap-2 mb-2 ${labelClass}`}>
                                        <Hash className="h-3.5 w-3.5" />
                                        Tags
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <div className={`rounded-xl border p-4 flex flex-col overflow-hidden transition-all ${inputClass} ${showDropdown ? "ring-1 ring-indigo-500 border-indigo-500" : ""}`}>
                                            <div className="flex flex-wrap gap-2 mb-2 empty:hidden">
                                                {tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className={`inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1.5 text-xs font-bold transition-colors ${
                                                            isDark ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                                        }`}
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
                                                placeholder={tags.length === 0 ? "Type a tag and press Enter" : "Add another tag"}
                                                value={tagInput}
                                                onChange={handleTagInputChange}
                                                onKeyDown={onTagInputKeyDown}
                                                onFocus={() => tagInput.trim() && setShowDropdown(true)}
                                                className="w-full bg-transparent text-sm font-bold outline-none placeholder-inherit"
                                            />
                                        </div>

                                        {showDropdown && (
                                            <div className={`absolute z-50 w-full mt-2 rounded-xl border shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                                                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                                            }`}>
                                                <div className="p-2">
                                                    {filteredTags.map((tag, index) => (
                                                        <button
                                                            key={tag}
                                                            onClick={() => handleAddTag(tag)}
                                                            onMouseEnter={() => setActiveIndex(index)}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-between ${
                                                                index === activeIndex 
                                                                    ? (isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-600") 
                                                                    : (isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50")
                                                            }`}
                                                        >
                                                            <span>#{tag}</span>
                                                            {index === activeIndex && <Sparkles className="h-3.5 w-3.5 opacity-50" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8">
                                <button
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 p-4 text-sm font-bold tracking-widest uppercase text-white shadow-[0_8px_24px_rgba(79,70,229,0.25)] transition-all hover:bg-indigo-500 hover:shadow-[0_8px_32px_rgba(79,70,229,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
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
                                    <p className={`mt-4 text-center text-xs font-semibold ${mutedTextClass}`}>
                                        Sign in to publish this draft.
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            <ProfanityModal isOpen={showProfanityModal} onClose={() => setShowProfanityModal(false)} />
            <CreatePostErrorModal
                isOpen={showErrorModal}
                message={errorMessage}
                onClose={() => setShowErrorModal(false)}
            />
        </div>
    );
}
