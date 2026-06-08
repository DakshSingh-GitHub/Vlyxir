"use client";

import React, { useState } from "react";
import { 
    Folder, FolderOpen, File, Plus, Trash2, Edit3, 
    ChevronRight, ChevronDown, FileCode, Lock, Sparkles
} from "lucide-react";

interface VirtualFile {
    name: string;
    path: string;
    content: string;
    isFolder: boolean;
}

interface FileExplorerProps {
    files: Record<string, VirtualFile>;
    activeFilePath: string;
    onSelectFile: (path: string) => void;
    onCreateFile: (path: string, isFolder: boolean) => void;
    onRename: (oldPath: string, newPath: string) => void;
    onDelete: (path: string) => void;
    isDark: boolean;
    hasAccess: boolean;
}

export default function FileExplorer({
    files,
    activeFilePath,
    onSelectFile,
    onCreateFile,
    onRename,
    onDelete,
    isDark,
    hasAccess
}: FileExplorerProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ ".": true });
    const [isCreating, setIsCreating] = useState<{ parent: string; isFolder: boolean } | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [editingPath, setEditingPath] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    // Build tree structure from flat paths
    const buildTree = () => {
        const root: any = { name: "Root", path: "", isFolder: true, children: [] };
        
        Object.keys(files).sort().forEach(path => {
            const parts = path.split("/");
            let current = root;
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const curPath = parts.slice(0, i + 1).join("/");
                const isLast = i === parts.length - 1;
                
                let existing = current.children.find((c: any) => c.name === part);
                if (!existing) {
                    const isFolder = !isLast || files[path].isFolder;
                    existing = {
                        name: part,
                        path: curPath,
                        isFolder,
                        children: []
                    };
                    current.children.push(existing);
                }
                current = existing;
            }
        });
        
        // Sort folders first, then files
        const sortNodes = (node: any) => {
            node.children.sort((a: any, b: any) => {
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                return a.name.localeCompare(b.name);
            });
            node.children.forEach(sortNodes);
        };
        sortNodes(root);
        return root;
    };

    const tree = buildTree();

    const handleToggleFolder = (path: string) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !isCreating) return;
        
        const parentPath = isCreating.parent;
        const fullPath = parentPath ? `${parentPath}/${newItemName.trim()}` : newItemName.trim();
        
        if (files[fullPath]) {
            alert("File or directory already exists!");
            return;
        }
        
        onCreateFile(fullPath, isCreating.isFolder);
        setNewItemName("");
        setIsCreating(null);
        setExpanded(prev => ({ ...prev, [parentPath]: true }));
    };

    const handleStartRename = (path: string, currentName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingPath(path);
        setEditName(currentName);
    };

    const handleRenameSubmit = (e: React.FormEvent, oldPath: string) => {
        e.preventDefault();
        if (!editName.trim()) return;
        
        const parts = oldPath.split("/");
        parts[parts.length - 1] = editName.trim();
        const newPath = parts.join("/");
        
        if (newPath !== oldPath && files[newPath]) {
            alert("Name already exists!");
            return;
        }
        
        onRename(oldPath, newPath);
        setEditingPath(null);
    };

    const renderNode = (node: any, depth: number) => {
        const isRoot = node.path === "";
        const isFolder = node.isFolder;
        const isNodeExpanded = expanded[node.path];
        const isActive = activeFilePath === node.path;
        
        if (isRoot) {
            return (
                <div className="space-y-1">
                    {node.children.map((child: any) => renderNode(child, depth + 1))}
                    {isCreating && isCreating.parent === "" && (
                        <form onSubmit={handleCreate} className="pl-4 pr-2 py-1 flex items-center gap-1.5">
                            {isCreating.isFolder ? (
                                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                                <File className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                            <input
                                autoFocus
                                type="text"
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                onBlur={() => setIsCreating(null)}
                                className={`w-full bg-transparent outline-hidden text-xs py-0.5 border-b ${
                                    isDark ? "text-slate-200 border-indigo-500/50" : "text-slate-700 border-indigo-500"
                                }`}
                                placeholder={isCreating.isFolder ? "Folder..." : "File..."}
                            />
                        </form>
                    )}
                </div>
            );
        }

        const isEditing = editingPath === node.path;

        return (
            <div key={node.path} className="space-y-1">
                <div
                    onClick={() => {
                        if (isFolder) {
                            handleToggleFolder(node.path);
                        } else {
                            onSelectFile(node.path);
                        }
                    }}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        isActive
                            ? isDark
                                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-[inset_0_1px_10px_rgba(99,102,241,0.1)]"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs"
                            : isDark
                                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                    }`}
                    style={{ paddingLeft: `${depth * 12}px` }}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        {isFolder ? (
                            <>
                                {isNodeExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                ) : (
                                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                                )}
                                {isNodeExpanded ? (
                                    <FolderOpen className="w-4 h-4 shrink-0 text-amber-500/80" />
                                ) : (
                                    <Folder className="w-4 h-4 shrink-0 text-amber-500/80" />
                                )}
                            </>
                        ) : (
                            <>
                                <span className="w-3.5" /> {/* alignment spacer */}
                                {node.name.endsWith(".py") ? (
                                    <FileCode className="w-4 h-4 shrink-0 text-indigo-400" />
                                ) : (
                                    <File className="w-4 h-4 shrink-0 opacity-70" />
                                )}
                            </>
                        )}
                        
                        {isEditing ? (
                            <form onSubmit={(e) => handleRenameSubmit(e, node.path)} className="min-w-0">
                                <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onBlur={() => setEditingPath(null)}
                                    onClick={e => e.stopPropagation()}
                                    className={`w-full bg-transparent outline-hidden text-xs py-0.5 border-b ${
                                        isDark ? "text-slate-200 border-indigo-500/50" : "text-slate-700 border-indigo-500"
                                    }`}
                                />
                            </form>
                        ) : (
                            <span className="text-xs font-semibold truncate tracking-tight">{node.name}</span>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-200">
                            {isFolder && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpanded(prev => ({ ...prev, [node.path]: true }));
                                            setIsCreating({ parent: node.path, isFolder: false });
                                        }}
                                        title="New File"
                                        className={`p-0.5 rounded-md transition-colors ${
                                            isDark ? "hover:bg-slate-700/60 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                                        }`}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={(e) => handleStartRename(node.path, node.name, e)}
                                title="Rename"
                                className={`p-0.5 rounded-md transition-colors ${
                                    isDark ? "hover:bg-slate-700/60 text-slate-400" : "hover:bg-slate-200 text-slate-500"
                                }`}
                            >
                                <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Are you sure you want to delete ${node.name}?`)) {
                                        onDelete(node.path);
                                    }
                                }}
                                title="Delete"
                                className="p-0.5 rounded-md hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 dark:text-slate-400 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {isFolder && isNodeExpanded && (
                    <div className="space-y-1">
                        {node.children.map((child: any) => renderNode(child, depth + 1))}
                        {isCreating && isCreating.parent === node.path && (
                            <form onSubmit={handleCreate} className="py-1 flex items-center gap-1.5" style={{ paddingLeft: `${(depth + 1) * 12 + 16}px` }}>
                                {isCreating.isFolder ? (
                                    <Folder className="w-3.5 h-3.5 text-indigo-400" />
                                ) : (
                                    <File className="w-3.5 h-3.5 text-indigo-400" />
                                )}
                                <input
                                    autoFocus
                                    type="text"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    onBlur={() => setIsCreating(null)}
                                    className={`w-full bg-transparent outline-hidden text-xs py-0.5 border-b ${
                                        isDark ? "text-slate-200 border-indigo-500/50" : "text-slate-700 border-indigo-500"
                                    }`}
                                    placeholder={isCreating.isFolder ? "Folder..." : "File..."}
                                />
                            </form>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`h-full flex flex-col ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-100 bg-slate-50/70"
            }`}>
                <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">Files</span>
                </div>
                {hasAccess ? (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsCreating({ parent: "", isFolder: false })}
                            title="New File"
                            className={`p-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
                                isDark 
                                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30" 
                                    : "bg-white border-slate-200 text-slate-500 hover:text-indigo-600"
                            }`}
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setIsCreating({ parent: "", isFolder: true })}
                            title="New Folder"
                            className={`p-1.5 rounded-lg border transition-all duration-200 active:scale-95 ${
                                isDark 
                                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30" 
                                    : "bg-white border-slate-200 text-slate-500 hover:text-indigo-600"
                            }`}
                        >
                            <Folder className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <Lock className="w-3 h-3" />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {hasAccess ? (
                    renderNode(tree, 0)
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${
                            isDark ? "bg-slate-900/50 border-slate-800/80 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}>
                            <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Multi-File Locked</h4>
                        <p className={`text-[10px] leading-relaxed max-w-[180px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            Upgrade to Pro Tier 2 to create folders and import custom helper files!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
