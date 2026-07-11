import React, { useState } from 'react';
import { 
  Loader2, Play, Lock, LockOpen, LogOut, Video, 
  LayoutTemplate, FolderOpen, FileText, ChevronLeft, ChevronRight,
  Terminal, ArrowUpDown, ChevronDown, ChevronUp, LockKeyhole
} from 'lucide-react';
import { useAppContext } from '../../app/lib/auth/context';
import ChatPanel from './ChatPanel';
import NotesPanel from './NotesPanel';
import CodeEditor from '../Editor/CodeEditor';
import FileExplorer from '../Editor/FileExplorer';
import { ChatMessage, CandidateLog } from '../../app/lib/types/interview';

interface InterviewLayoutProps {
  isHost: boolean;
  code: string;
  setCode: (code: string) => void;
  input: string;
  setInput: (input: string) => void;
  output: any;
  onRunCode: () => void;
  isLoadingRun: boolean;
  
  // VFS
  files: Record<string, any>;
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string, isFolder: boolean) => void;
  onRename: (oldPath: string, newPath: string) => void;
  onDelete: (path: string) => void;

  // Real-time
  isExecutionLocked: boolean;
  onToggleExecutionLock: (locked: boolean) => void;
  participants: { uuid: string; status: 'online' | 'offline'; isAdmitted?: boolean; name?: string; avatarUrl?: string; }[];
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
  
  // Host controls
  notes: string;
  setNotes: (notes: string) => void;
  onEndSession: () => void;
  onLeaveSession: () => void;
  
  userId: string;
  hostUuid: string;
  leftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  rightSidebarOpen: boolean;
}

export default function InterviewLayout({
  isHost,
  code,
  setCode,
  input,
  setInput,
  output,
  onRunCode,
  isLoadingRun,
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onRename,
  onDelete,
  isExecutionLocked,
  onToggleExecutionLock,
  participants,
  chatMessages,
  onSendChatMessage,
  notes,
  setNotes,
  onEndSession,
  onLeaveSession,
  userId,
  hostUuid,
  leftSidebarOpen,
  onToggleLeftSidebar,
  rightSidebarOpen
}: InterviewLayoutProps) {
  const { isDark } = useAppContext();
  
  // Collapsible panel states
  const [leftSidebarTab, setLeftSidebarTab] = useState<'files' | 'notes'>('files');
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<'input' | 'output'>('input');

  const [leftWidth, setLeftWidth] = useState(256); // default 256px
  const [rightWidth, setRightWidth] = useState(320); // default 320px
  const [bottomHeight, setBottomHeight] = useState(240); // default 240px
  const [isResizing, setIsResizing] = useState(false);
  const [isExecutionBlockedModalOpen, setIsExecutionBlockedModalOpen] = useState(false);

  const handleRunCodeClick = () => {
    if (!isHost && isExecutionLocked) {
      setIsExecutionBlockedModalOpen(true);
      return;
    }
    onRunCode();
  };

  const finalLeftWidth = leftSidebarOpen ? leftWidth : 0;
  const finalRightWidth = rightSidebarOpen ? rightWidth : 0;
  const finalBottomHeight = consoleOpen ? bottomHeight : 44; // h-11 is 44px

  const startResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = leftWidth;
    
    const doDrag = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(160, Math.min(480, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
    };
    
    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = rightWidth;
    
    const doDrag = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(240, Math.min(600, startWidth - (moveEvent.clientX - startX)));
      setRightWidth(newWidth);
    };
    
    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const startResizeBottom = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = bottomHeight;
    
    const doDrag = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(100, Math.min(500, startHeight - (moveEvent.clientY - startY)));
      setBottomHeight(newHeight);
    };
    
    const stopDrag = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className={`h-full w-full flex min-h-0 overflow-hidden relative p-4 bg-transparent ${isDark ? "text-white" : "text-slate-900"}`}>
        
        {/* LEFT TOOLPANE SIDEBAR (Collapsible) */}
        <div style={{ width: `${finalLeftWidth}px` }} className={`h-full shrink-0 flex relative rounded-3xl border overflow-hidden ${
          !isResizing ? "transition-all duration-300" : "transition-none"
        } ${
          leftSidebarOpen 
            ? "border-slate-800/80 bg-slate-950/50 backdrop-blur-md p-1 shadow-lg" 
            : "border-transparent overflow-hidden"
        }`}>
          
          {leftSidebarOpen && (
            <div className={`flex-1 flex flex-col h-full min-w-0 rounded-[1.25rem] border overflow-hidden ${isDark ? "border-slate-800/40 bg-[#0A0F1A]" : "border-slate-200 bg-white"}`}>
              {/* Tab Selector */}
              <div className={`flex border-b shrink-0 ${isDark ? "border-slate-900 bg-slate-950/20" : "border-slate-200 bg-slate-50"}`}>
                <button
                  onClick={() => setLeftSidebarTab('files')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                    leftSidebarTab === 'files'
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Files
                </button>
                <button
                  onClick={() => setLeftSidebarTab('notes')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all ${
                    leftSidebarTab === 'notes'
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {isHost ? "Notes" : "Workspace"}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {leftSidebarTab === 'files' ? (
                  <FileExplorer
                    files={files}
                    activeFilePath={activeFilePath}
                    onSelectFile={onSelectFile}
                    onCreateFile={onCreateFile}
                    onRename={onRename}
                    onDelete={onDelete}
                    isDark={isDark}
                    hasAccess={true}
                  />
                ) : (
                  <div className="p-4 h-full flex flex-col gap-4">
                    {isHost ? (
                      <div className="flex-1 min-h-0">
                        <NotesPanel notes={notes} setNotes={setNotes} />
                      </div>
                    ) : (
                      <div className="space-y-4 text-slate-400 text-xs leading-relaxed">
                        <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Candidate Guidelines</h4>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Write your solution in the coding environment.</li>
                          <li>You can create helper files in the explorer tab.</li>
                          <li>Use the Bottom Drawer to configure input cases.</li>
                          <li>Only the host can toggle Execution Lock permissions.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trigger to Collapse Left Sidebar */}
          <button
            onClick={onToggleLeftSidebar}
            className={`absolute top-1/2 -translate-y-1/2 -right-3.5 z-20 p-1 rounded-full border shadow-md transition-colors ${
              isDark 
                ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200" 
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
            }`}
          >
            {leftSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>

        {leftSidebarOpen && (
          <div
            onMouseDown={startResizeLeft}
            className="w-1 shrink-0 cursor-col-resize self-stretch hover:bg-indigo-500/30 active:bg-indigo-500/50 rounded-full transition-colors mx-1 select-none z-10"
          />
        )}

        {/* CENTER WORKSPACE (Code IDE + Expandable Bottom Console) */}
        <div className="flex-1 h-full min-w-0 flex flex-col relative">
          
          {/* CODE EDITOR CANVAS */}
          <div className={`flex-1 min-h-0 relative flex flex-col rounded-3xl border overflow-hidden p-1 shadow-lg ${
            isDark ? "bg-slate-950/50 border-slate-800/80 backdrop-blur-md" : "bg-slate-100 border-slate-250"
          }`}>
            <div className={`flex-1 min-h-0 relative flex flex-col rounded-[1.25rem] border overflow-hidden ${isDark ? "border-slate-800/40 bg-[#0A0F1A]" : "border-slate-200 bg-white"}`}>
              <div className={`px-4 py-2 border-b flex items-center justify-between shrink-0 ${
              isDark ? "border-slate-800/60 bg-slate-950/20" : "border-slate-250 bg-slate-50"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  {activeFilePath}
                </span>
              </div>
              <button
                onClick={handleRunCodeClick}
                disabled={isLoadingRun}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  isLoadingRun
                    ? isDark ? "bg-slate-900/60 text-slate-500 cursor-not-allowed" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95"
                }`}
              >
                {isLoadingRun ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Code
              </button>
            </div>
            
            <div className="flex-1 min-h-0 relative">
              <CodeEditor code={code} setCode={setCode} isDark={isDark} flat={true} isDisabled={false} />
            </div>
            </div>
          </div>

          {/* Bottom Divider */}
          {consoleOpen && (
            <div
              onMouseDown={startResizeBottom}
              className="h-1 shrink-0 cursor-row-resize self-stretch hover:bg-indigo-500/30 active:bg-indigo-500/50 rounded-full transition-colors my-1 select-none z-10"
            />
          )}

          {/* BOTTOM DRAWER (Input / Output Drawer) */}
          <div style={{ height: `${finalBottomHeight}px` }} className={`shrink-0 border flex flex-col rounded-3xl overflow-hidden p-1 shadow-lg ${
            !isResizing ? "transition-all duration-300" : "transition-none"
          } ${
            isDark ? "border-slate-800/80 bg-slate-950/50 backdrop-blur-md" : "border-slate-200 bg-slate-100"
          } ${!consoleOpen ? "mt-4" : ""}`}>
            <div className={`flex-1 min-h-0 relative flex flex-col rounded-[1.25rem] border overflow-hidden ${isDark ? "border-slate-800/40 bg-[#0A0F1A]" : "border-slate-200 bg-white"}`}>
            
            {/* Header bar */}
            <div className={`px-4 py-2 flex items-center justify-between border-b shrink-0 ${
              isDark ? "border-slate-800/60 bg-slate-950/20" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setConsoleOpen(true); setConsoleTab('input'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    consoleOpen && consoleTab === 'input'
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Input Stream
                </button>
                <button
                  onClick={() => { setConsoleOpen(true); setConsoleTab('output'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    consoleOpen && consoleTab === 'output'
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Output Console
                </button>
              </div>

              {/* Close/Minimize trigger */}
              <button
                onClick={() => setConsoleOpen(!consoleOpen)}
                className={`p-1 rounded-md hover:bg-slate-800/40 text-slate-450 transition-colors`}
              >
                {consoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* Content areas */}
            {consoleOpen && (
              <div className="flex-1 min-h-0">
                {consoleTab === 'input' ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-full h-full p-4 resize-none outline-none font-mono text-xs ${
                      isDark ? "bg-transparent text-slate-300 placeholder:text-slate-600" : "bg-transparent text-slate-700"
                    }`}
                    placeholder="Provide input feed for the execution engine here..."
                  />
                ) : (
                  <div className={`w-full h-full p-4 overflow-auto font-mono text-xs whitespace-pre-wrap ${
                    !output ? (isDark ? "text-slate-600" : "text-slate-400") : 
                    output.status === "Error" ? "text-rose-500" : (isDark ? "text-emerald-450" : "text-emerald-600")
                  }`}>
                    {output ? (output.stderr ? output.stderr : output.stdout) : "Compile and run solution to receive output..."}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>

        {rightSidebarOpen && (
          <div
            onMouseDown={startResizeRight}
            className="w-1 shrink-0 cursor-col-resize self-stretch hover:bg-indigo-500/30 active:bg-indigo-500/50 rounded-full transition-colors mx-1 select-none z-10"
          />
        )}

        {/* RIGHT COMMUNICATION SIDEBAR (Chat / Presence / Video Placeholder) */}
        <div style={{ width: `${finalRightWidth}px` }} className={`h-full shrink-0 flex flex-col relative rounded-3xl border overflow-hidden ${
          !isResizing ? "transition-all duration-300" : "transition-none"
        } ${
          rightSidebarOpen 
            ? "border-slate-800/80 bg-slate-950/50 backdrop-blur-md p-1 shadow-lg" 
            : "border-transparent overflow-hidden"
        }`}>
          {rightSidebarOpen && (
            <div className={`flex-1 flex flex-col h-full min-w-0 rounded-[1.25rem] border overflow-hidden ${isDark ? "border-slate-800/40 bg-[#0A0F1A]" : "border-slate-200 bg-white"}`}>
              {/* Chat Panel & Participants */}
              <div className="flex-1 min-h-0">
                <ChatPanel
                  messages={chatMessages}
                  participants={participants}
                  onSendMessage={onSendChatMessage}
                  userId={userId}
                  hostUuid={hostUuid}
                  isHost={isHost}
                />
              </div>
            </div>
          )}
        </div>

      {isExecutionBlockedModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[2000] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm border rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <LockKeyhole className="w-5 h-5" />
                Execution Locked
              </h3>
              <p className={`text-sm mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                The host has temporarily disabled code execution. You can continue to write code, but running it is currently restricted.
              </p>
            </div>
            <button
              onClick={() => setIsExecutionBlockedModalOpen(false)}
              className="mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest shadow-md transition-colors cursor-pointer w-full"
            >
              Okay, understood
            </button>
          </div>
        </div>
      )}

      </div>
  );
}
