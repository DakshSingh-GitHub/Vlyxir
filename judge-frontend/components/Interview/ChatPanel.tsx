import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../app/lib/auth/context';
import { ChatMessage } from '../../app/lib/types/interview';

interface ChatPanelProps {
  messages: ChatMessage[];
  participants: { uuid: string; status: 'online' | 'offline'; isAdmitted?: boolean; name?: string; avatarUrl?: string; }[];
  onSendMessage: (text: string) => void;
  userId: string;
  hostUuid: string;
  isHost: boolean;
}

export default function ChatPanel({
  messages,
  participants,
  onSendMessage,
  userId,
  hostUuid,
  isHost
}: ChatPanelProps) {
  const { isDark } = useAppContext();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-transparent" : "bg-white"}`}>
      {/* Top 50% - Participants */}
      <div className={`flex-1 flex flex-col border-b ${isDark ? "border-slate-900/60" : "border-slate-200"}`}>
        <div className={`px-4 py-3 flex items-center gap-2 border-b ${isDark ? "border-slate-900/60 bg-slate-950/20" : "border-slate-100 bg-slate-50"}`}>
          <Users className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Participants
          </h3>
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
            {participants.length} / 2
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {participants.map((p) => {
            const isHostParticipant = p.uuid === hostUuid;
            const isMe = p.uuid === userId;
            
            const resolvedName = p.name || (isHostParticipant ? 'Host' : 'Candidate');
            const label = isHostParticipant ? 'Host' : 'Applicant';
            const displayNameToShow = `${resolvedName} (${label})${isMe ? ' (You)' : ''}`;
            const initials = resolvedName.charAt(0).toUpperCase();

            return (
              <div key={p.uuid} className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "border-slate-800 bg-slate-900/30" : "border-slate-100 bg-slate-50"}`}>
                <div className="relative shrink-0">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={resolvedName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700/50"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isHostParticipant ? "bg-indigo-500/20 text-indigo-505" : "bg-emerald-500/20 text-emerald-500"}`}>
                      {initials}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${isDark ? "border-slate-955" : "border-white"} ${p.status === 'online' ? "bg-emerald-500" : "bg-slate-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`} title={displayNameToShow}>
                      {displayNameToShow}
                    </p>
                  </div>
                  <p className={`text-[10px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {p.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 50% - Chat */}
      <div className="flex-[1.5] flex flex-col min-h-0">
        <div className={`px-4 py-3 flex items-center gap-2 border-b ${isDark ? "border-slate-900/60 bg-slate-950/20" : "border-slate-100 bg-slate-50"}`}>
          <MessageSquare className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-650"}`} />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Live Chat
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className={`text-center text-[10px] font-medium py-2 rounded-xl mb-4 ${isDark ? "text-slate-500 bg-slate-900/40" : "text-slate-400 bg-slate-50"}`}>
            Messages before joining are not shown
          </div>
          {messages.map((msg) => {
            const isMe = msg.sender_uuid === userId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  isMe 
                    ? isDark 
                        ? "bg-indigo-650 text-white rounded-br-sm" 
                        : "bg-indigo-500 text-white rounded-br-sm"
                    : isDark
                        ? "bg-slate-900 text-slate-200 rounded-bl-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
                <span className={`text-[10px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {msg.timestamp}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={`p-4 border-t ${isDark ? "border-slate-900/60 bg-slate-950/10" : "border-slate-100 bg-white"}`}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className={`w-full pl-4 pr-12 py-3 rounded-xl outline-none text-sm border transition-colors ${
                isDark 
                    ? "bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50" 
                    : "bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                inputText.trim()
                    ? isDark
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    : isDark
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
