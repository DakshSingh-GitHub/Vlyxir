"use client";

import React from 'react';
import { useAppContext } from '../../app/lib/context';
import { Plus, User } from 'lucide-react';

import Link from 'next/link';

export default function ForumRightPanel() {
    const { isDark } = useAppContext();
    
    return (
        <aside className={`w-80 flex-shrink-0 hidden lg:flex flex-col py-6 px-6 border-l ${isDark ? 'border-slate-800 bg-[#0f172a]' : 'border-slate-200 bg-slate-50'} overflow-y-auto`}>
            <div className="mb-10 space-y-3">
                <Link href="/forum/create-post" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    Create New Post
                </Link>
                <Link href="/forum/your-content" className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'} text-sm font-semibold transition-all active:scale-95`}>
                    <User className="w-4 h-4" />
                    Your Contents
                </Link>
            </div>

            <div className="mb-8">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Categories</h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        'React', 'Next.js', 'Typescript', 'Design',
                        'JavaScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'Rust', 'Ruby',
                        'PHP', 'Swift', 'Kotlin', 'Dart', 'Flutter', 'React Native', 'Vue.js', 'Angular', 'Svelte',
                        'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'GraphQL', 'REST API',
                        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS',
                        'Azure', 'GCP', 'Linux', 'Bash', 'Git', 'GitHub', 'CI/CD', 'Machine Learning',
                        'Data Science', 'AI', 'Algorithms', 'Data Structures', 'System Design'
                    ].map(tag => (
                        <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </aside>
    );
}
