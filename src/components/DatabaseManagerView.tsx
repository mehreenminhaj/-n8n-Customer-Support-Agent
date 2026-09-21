import React, { useState } from 'react';
import { Database, Plus, Search, BookOpen, ExternalLink, Tag } from 'lucide-react';
import { Customer, KnowledgeDoc } from '../types.ts';

interface Props {
  customers: Customer[];
  knowledgeDocs: KnowledgeDoc[];
  onAddCustomer: (c: { name: string; email: string; company: string; plan: string }) => Promise<void>;
  onAddDoc: (d: { title: string; category: string; content: string; apiEndpoint: string }) => Promise<void>;
}

export const DatabaseManagerView: React.FC<Props> = ({
  customers,
  knowledgeDocs,
  onAddCustomer,
  onAddDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'knowledge'>('customers');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Form states
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custPlan, setCustPlan] = useState('Pro');

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Technical & API');
  const [docContent, setDocContent] = useState('');
  const [docEndpoint, setDocEndpoint] = useState('');

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return;
    await onAddCustomer({
      name: custName,
      email: custEmail,
      company: custCompany,
      plan: custPlan,
    });
    setCustName('');
    setCustEmail('');
    setCustCompany('');
    setShowCustomerModal(false);
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;
    await onAddDoc({
      title: docTitle,
      category: docCategory,
      content: docContent,
      apiEndpoint: docEndpoint,
    });
    setDocTitle('');
    setDocContent('');
    setDocEndpoint('');
    setShowDocModal(false);
  };

  return (
    <div id="database-manager-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-100 text-base">Cloud SQL (PostgreSQL) Live Data Store</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data queried and updated in real-time by the n8n Customer Support Agent nodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex gap-1">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'customers' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'knowledge' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Knowledge RAG Docs ({knowledgeDocs.length})
            </button>
          </div>

          {activeTab === 'customers' ? (
            <button
              onClick={() => setShowCustomerModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Customer
            </button>
          ) : (
            <button
              onClick={() => setShowDocModal(true)}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Doc
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'customers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-[11px] text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Sentiment</th>
                  <th className="py-2.5 px-3">Tags</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">#{c.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{c.company || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        c.sentiment === 'Happy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : c.sentiment === 'Frustrated'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {c.sentiment}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags?.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {knowledgeDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {doc.category}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h4 className="font-semibold text-slate-200 text-sm">{doc.title}</h4>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">{doc.content}</p>
                </div>

                {doc.apiEndpoint && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500">API Endpoint:</span>
                    <span className="text-amber-300 truncate max-w-[150px]">{doc.apiEndpoint}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-xl">
            <h4 className="font-semibold text-slate-100 text-sm mb-3">Add Customer to PostgreSQL</h4>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="alex@acme.inc"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Company</label>
                <input
                  type="text"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Subscription Plan</label>
                <select
                  value={custPlan}
                  onChange={(e) => setCustPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="Free">Free</option>
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg font-semibold"
                >
                  Save to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doc Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-xl">
            <h4 className="font-semibold text-slate-100 text-sm mb-3">Add Knowledge Doc to PostgreSQL</h4>
            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Doc Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Webhook Retry Configuration"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Content (LLM Knowledge)</label>
                <textarea
                  rows={3}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Specify policy, technical diagnostic guidelines, or resolution steps..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Associated Internal API Endpoint (Optional)</label>
                <input
                  type="text"
                  value={docEndpoint}
                  onChange={(e) => setDocEndpoint(e.target.value)}
                  placeholder="https://api.internal.corp/v1/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg font-semibold"
                >
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
