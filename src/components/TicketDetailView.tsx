import React, { useState } from 'react';
import { Ticket, TicketMessage } from '../types.ts';
import { Bot, Send, Sparkles, User, AlertCircle, CheckCircle, Database, Cpu, Terminal, RefreshCw } from 'lucide-react';

interface Props {
  ticket: Ticket | null;
  onSendMessage: (ticketId: number, message: string) => Promise<void>;
  onUpdateStatus: (ticketId: number, status: 'open' | 'pending_agent' | 'solved' | 'escalated') => Promise<void>;
  isSending: boolean;
}

export const TicketDetailView: React.FC<Props> = ({
  ticket,
  onSendMessage,
  onUpdateStatus,
  isSending,
}) => {
  const [replyText, setReplyText] = useState('');

  if (!ticket) {
    return (
      <div id="ticket-empty-selection" className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
        <Bot className="w-12 h-12 text-slate-600 mb-3" />
        <h4 className="text-slate-300 font-medium">No Ticket Selected</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select an active customer support ticket from the list or simulate an inbound customer message through n8n.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;
    const msg = replyText;
    setReplyText('');
    await onSendMessage(ticket.id, msg);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'solved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'escalated':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div id="ticket-detail-panel" className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">TICKET-{ticket.id}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getStatusBadge(ticket.status)}`}>
              {ticket.status.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">via <span className="font-mono text-slate-300">{ticket.channel}</span></span>
          </div>
          <h2 className="text-base font-semibold text-slate-100 mt-1">{ticket.title}</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            Customer: <strong className="text-slate-200">{ticket.customerName}</strong> ({ticket.customerEmail})
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {ticket.status !== 'solved' ? (
            <button
              id="btn-mark-solved"
              onClick={() => onUpdateStatus(ticket.id, 'solved')}
              className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Mark Solved
            </button>
          ) : (
            <button
              id="btn-reopen-ticket"
              onClick={() => onUpdateStatus(ticket.id, 'open')}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reopen
            </button>
          )}

          <button
            id="btn-escalate-ticket"
            onClick={() => onUpdateStatus(ticket.id, 'escalated')}
            className="inline-flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Escalate
          </button>
        </div>
      </div>

      {/* AI Intelligence Card */}
      {(ticket.aiSummary || ticket.suggestedAction) && (
        <div className="bg-indigo-950/40 border-b border-indigo-500/20 p-3.5 px-4 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              {ticket.aiSummary && (
                <div>
                  <span className="text-indigo-300 font-semibold">Gemini Intelligence: </span>
                  <span className="text-slate-300">{ticket.aiSummary}</span>
                </div>
              )}
              {ticket.suggestedAction && (
                <div className="text-slate-400 pt-0.5">
                  <span className="text-emerald-400 font-medium">Recommended n8n Action: </span>
                  <span>{ticket.suggestedAction}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[320px]">
        {ticket.conversation?.map((msg, i) => {
          const isCustomer = msg.role === 'customer';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div key={i} className="flex items-center gap-2 justify-center my-2">
                <div className="h-px bg-slate-800 flex-1" />
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800/80 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-amber-400" />
                  <span>{msg.content}</span>
                </div>
                <div className="h-px bg-slate-800 flex-1" />
              </div>
            );
          }

          return (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${isCustomer ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isCustomer
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isCustomer ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-xl p-3 text-xs leading-relaxed ${
                  isCustomer
                    ? 'bg-slate-800 text-slate-200 border border-slate-700/60'
                    : 'bg-indigo-950/80 text-indigo-100 border border-indigo-500/30 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isCustomer ? ticket.customerName : 'n8n AI Support Agent'}
                  </span>
                  <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-3 text-xs text-indigo-200 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Executing n8n workflow & Gemini LLM reasoning node...</span>
            </div>
          </div>
        )}
      </div>

      {/* Reply Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex gap-2">
          <input
            id="input-ticket-reply"
            type="text"
            placeholder="Send customer follow-up message (triggers n8n LLM + PostgreSQL pipeline)..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            id="btn-send-reply"
            type="submit"
            disabled={isSending || !replyText.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
