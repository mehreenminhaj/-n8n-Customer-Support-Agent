import React, { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.tsx';
import { AuthBanner } from './components/AuthBanner.tsx';
import { WorkflowVisualizer } from './components/WorkflowVisualizer.tsx';
import { TicketDetailView } from './components/TicketDetailView.tsx';
import { ExecutionLogsView } from './components/ExecutionLogsView.tsx';
import { DatabaseManagerView } from './components/DatabaseManagerView.tsx';
import { SimulateModal } from './components/SimulateModal.tsx';
import { Ticket, Workflow, WorkflowExecution, Customer, KnowledgeDoc } from './types.ts';
import {
  Bot,
  Layers,
  Inbox,
  Database,
  Workflow as WorkflowIcon,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const { user, idToken, loading: authLoading } = useAuth();

  const [activeView, setActiveView] = useState<'tickets' | 'workflows' | 'executions' | 'database'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const fetchData = async () => {
    if (!idToken) return;
    setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${idToken}` };
      const [tRes, wRes, eRes, cRes, kRes] = await Promise.all([
        fetch('/api/tickets', { headers }),
        fetch('/api/workflows', { headers }),
        fetch('/api/executions', { headers }),
        fetch('/api/customers', { headers }),
        fetch('/api/knowledge', { headers }),
      ]);

      if (tRes.ok) {
        const data = await tRes.json();
        setTickets(data);
        if (data.length > 0 && selectedTicketId === null) {
          setSelectedTicketId(data[0].id);
        }
      }
      if (wRes.ok) setWorkflows(await wRes.json());
      if (eRes.ok) setExecutions(await eRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (kRes.ok) setKnowledgeDocs(await kRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (idToken) {
      fetchData();
    }
  }, [idToken]);

  // Handle follow up message on ticket
  const handleSendMessage = async (ticketId: number, message: string) => {
    if (!idToken) return;
    setIsExecuting(true);
    try {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      if (!currentTicket) return;

      const res = await fetch('/api/n8n/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ticketId,
          customerName: currentTicket.customerName,
          customerEmail: currentTicket.customerEmail,
          userMessage: message,
          selectedCategory: currentTicket.category,
          selectedPriority: currentTicket.priority,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle update status
  const handleUpdateStatus = async (ticketId: number, status: 'open' | 'pending_agent' | 'solved' | 'escalated') => {
    if (!idToken) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle simulation trigger
  const handleSimulate = async (data: {
    customerName: string;
    customerEmail: string;
    userMessage: string;
    selectedCategory?: string;
    selectedPriority?: string;
  }) => {
    if (!idToken) return;
    setIsExecuting(true);
    try {
      const res = await fetch('/api/n8n/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        await fetchData();
        if (result.ticket?.id) {
          setSelectedTicketId(result.ticket.id);
          setActiveView('tickets');
        }
      }
    } catch (err) {
      console.error('Failed to simulate workflow:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Add Customer
  const handleAddCustomer = async (c: { name: string; email: string; company: string; plan: string }) => {
    if (!idToken) return;
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(c),
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  // Add Doc
  const handleAddDoc = async (d: { title: string; category: string; content: string; apiEndpoint: string }) => {
    if (!idToken) return;
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(d),
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to create doc:', err);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const filteredTickets = tickets.filter((t) => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Notification / Auth Banner */}
      <AuthBanner />

      {/* Main App Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">n8n Support Agent</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  n8n + LLM + APIs + Postgres
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous workflow routing, Gemini 2.5 Flash classification, API tool execution, and Cloud SQL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View switcher tabs */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex gap-1 text-xs">
              <button
                id="tab-tickets"
                onClick={() => setActiveView('tickets')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'tickets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Tickets ({tickets.length})
              </button>

              <button
                id="tab-workflows"
                onClick={() => setActiveView('workflows')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'workflows' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <WorkflowIcon className="w-3.5 h-3.5" />
                n8n Pipeline
              </button>

              <button
                id="tab-executions"
                onClick={() => setActiveView('executions')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'executions' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Node Audits ({executions.length})
              </button>

              <button
                id="tab-database"
                onClick={() => setActiveView('database')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeView === 'database' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                PostgreSQL Data
              </button>
            </div>

            <button
              id="btn-trigger-ticket"
              onClick={() => setIsSimulateOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Inbound Ticket
            </button>
          </div>
        </div>
      </header>

      {/* Main Application Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* Active Architecture Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WorkflowIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Workflow Orchestrator</div>
              <div className="text-xs font-semibold text-slate-200">n8n Node Pipeline Active</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">LLM Reasoning Engine</div>
              <div className="text-xs font-semibold text-slate-200">Gemini 2.5 Flash Agent</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Cloud SQL Database</div>
              <div className="text-xs font-semibold text-slate-200">PostgreSQL 16 (asia-southeast1)</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Integrated Internal Tools</div>
              <div className="text-xs font-semibold text-slate-200">DB & Billing Diagnostic APIs</div>
            </div>
          </div>
        </div>

        {/* View Routing */}
        {activeView === 'tickets' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Ticket List Sidebar */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[650px] overflow-hidden shadow-sm">
              <div className="p-3 border-b border-slate-800 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search tickets, customers, emails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto text-[11px] py-0.5">
                  {['all', 'Database & Cloud SQL', 'API & Webhooks', 'Billing'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-slate-700 text-slate-100 font-semibold'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {cat === 'all' ? 'All Tickets' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                {isLoadingData && (
                  <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    Fetching from Cloud SQL PostgreSQL...
                  </div>
                )}

                {!isLoadingData && filteredTickets.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No tickets found. Trigger a new inbound ticket above!
                  </div>
                )}

                {filteredTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`p-3.5 transition-colors cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-200 truncate">{ticket.customerName}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-slate-300 font-medium line-clamp-1 mb-1">{ticket.title}</div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {ticket.category}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            ticket.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-400'
                              : ticket.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`text-[10px] ml-auto font-medium ${
                            ticket.status === 'solved' ? 'text-emerald-400' : 'text-sky-400'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ticket Detail Panel */}
            <div className="lg:col-span-8 h-[650px]">
              <TicketDetailView
                ticket={selectedTicket}
                onSendMessage={handleSendMessage}
                onUpdateStatus={handleUpdateStatus}
                isSending={isExecuting}
              />
            </div>
          </div>
        )}

        {activeView === 'workflows' && (
          <div className="space-y-4">
            <WorkflowVisualizer
              workflows={workflows}
              onTriggerTest={() => setIsSimulateOpen(true)}
              isExecuting={isExecuting}
            />
          </div>
        )}

        {activeView === 'executions' && (
          <div>
            <ExecutionLogsView executions={executions} />
          </div>
        )}

        {activeView === 'database' && (
          <div>
            <DatabaseManagerView
              customers={customers}
              knowledgeDocs={knowledgeDocs}
              onAddCustomer={handleAddCustomer}
              onAddDoc={handleAddDoc}
            />
          </div>
        )}
      </main>

      {/* Simulate Modal */}
      {isSimulateOpen && (
        <SimulateModal
          onSimulate={handleSimulate}
          isExecuting={isExecuting}
          onClose={() => setIsSimulateOpen(false)}
        />
      )}
    </div>
  );
}
