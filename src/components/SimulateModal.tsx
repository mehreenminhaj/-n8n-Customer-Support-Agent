import React, { useState } from 'react';
import { Play, Sparkles, Database, Send, Zap, Bot } from 'lucide-react';

interface Props {
  onSimulate: (data: {
    customerName: string;
    customerEmail: string;
    userMessage: string;
    selectedCategory?: string;
    selectedPriority?: string;
  }) => Promise<void>;
  isExecuting: boolean;
  onClose: () => void;
}

const PRESET_SCENARIOS = [
  {
    title: 'Cloud SQL / PostgreSQL Pool Exhaustion',
    customerName: 'Devon Lee',
    customerEmail: 'devon@datacorp.dev',
    category: 'Database & Cloud SQL',
    priority: 'high',
    message: 'Our n8n PostgreSQL node is failing during high-concurrency batch imports with "connection timeout" and error 503. Can you check our current pool metrics and suggest the right max connection setting?',
  },
  {
    title: 'API Rate Limits & Quota Alert',
    customerName: 'Elena Rostova',
    customerEmail: 'elena@growthscale.io',
    category: 'API & Webhooks',
    priority: 'urgent',
    message: 'We received an automated 429 error on our webhook dispatcher. Can you check our current API usage and quota tier in our account?',
  },
  {
    title: 'Billing Proration & Downgrade Request',
    customerName: 'Thomas Wright',
    customerEmail: 'thomas@craftlabs.co',
    category: 'Billing',
    priority: 'medium',
    message: 'Hi, we upgraded to Enterprise last week for testing, but want to switch back to Pro. Can you check if we are eligible for a prorated credit under the 14-day policy?',
  },
];

export const SimulateModal: React.FC<Props> = ({ onSimulate, isExecuting, onClose }) => {
  const [customerName, setCustomerName] = useState(PRESET_SCENARIOS[0].customerName);
  const [customerEmail, setCustomerEmail] = useState(PRESET_SCENARIOS[0].customerEmail);
  const [selectedCategory, setSelectedCategory] = useState(PRESET_SCENARIOS[0].category);
  const [selectedPriority, setSelectedPriority] = useState(PRESET_SCENARIOS[0].priority);
  const [userMessage, setUserMessage] = useState(PRESET_SCENARIOS[0].message);

  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setCustomerName(preset.customerName);
    setCustomerEmail(preset.customerEmail);
    setSelectedCategory(preset.category);
    setSelectedPriority(preset.priority);
    setUserMessage(preset.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMessage || !customerEmail || isExecuting) return;
    await onSimulate({
      customerName,
      customerEmail,
      userMessage,
      selectedCategory,
      selectedPriority,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-slate-100 text-sm">
              Trigger n8n Customer Support Agent Workflow
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xs">
            ✕
          </button>
        </div>

        {/* Presets */}
        <div className="mt-3">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
            Quick Test Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left text-xs p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-slate-300 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-200">{p.title}</div>
                <div className="text-[10px] text-slate-500">{p.category}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Customer Email</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="Database & Cloud SQL">Database & Cloud SQL</option>
                <option value="API & Webhooks">API & Webhooks</option>
                <option value="Billing">Billing</option>
                <option value="Integration">Integration</option>
                <option value="Account">Account</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Inbound Customer Message / Prompt</label>
            <textarea
              rows={4}
              required
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type or paste the inbound user question..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Execution Pipeline:</span>
            <span>1. Webhook trigger ingest &rarr; 2. PostgreSQL customer query &rarr; 3. Gemini LLM intent categorization &rarr; 4. Internal API diagnostics &rarr; 5. PostgreSQL ticket record & audit execution</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExecuting}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isExecuting ? 'Processing in n8n Engine...' : 'Dispatch to n8n Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
