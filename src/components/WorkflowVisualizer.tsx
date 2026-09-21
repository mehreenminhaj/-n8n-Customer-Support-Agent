import React from 'react';
import { Workflow, Play, CheckCircle2, AlertCircle, Clock, Zap, ArrowRight } from 'lucide-react';
import { Workflow as WorkflowType } from '../types.ts';

interface Props {
  workflows: WorkflowType[];
  onTriggerTest: (wf: WorkflowType) => void;
  isExecuting: boolean;
}

export const WorkflowVisualizer: React.FC<Props> = ({ workflows, onTriggerTest, isExecuting }) => {
  if (!workflows.length) {
    return (
      <div id="workflows-empty" className="p-8 text-center text-slate-500">
        No active n8n workflows registered.
      </div>
    );
  }

  const activeWorkflow = workflows[0];

  return (
    <div id="n8n-workflow-canvas" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Workflow className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-slate-100 text-base">{activeWorkflow.name}</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
              {activeWorkflow.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{activeWorkflow.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block">Webhook Inbound:</span>
            <code className="text-[11px] font-mono text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {activeWorkflow.webhookUrl}
            </code>
          </div>
          <button
            id="btn-run-workflow-test"
            onClick={() => onTriggerTest(activeWorkflow)}
            disabled={isExecuting}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
            {isExecuting ? 'Running Nodes...' : 'Simulate Inbound Ticket'}
          </button>
        </div>
      </div>

      {/* Node Pipeline Representation */}
      <div className="mt-5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Active Pipeline Nodes ({activeWorkflow.nodesConfig?.length || 0})</span>
          <span className="text-slate-500 lowercase">execution flow &rarr;</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {activeWorkflow.nodesConfig?.map((node, idx) => {
            const isRunning = isExecuting;
            return (
              <div
                key={node.id || idx}
                id={`node-card-${node.id}`}
                className={`relative rounded-lg p-3 border transition-all ${
                  isRunning
                    ? 'border-amber-500/50 bg-slate-800/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    #{idx + 1}
                  </span>
                  {node.type === 'webhook' && <span className="w-2 h-2 rounded-full bg-blue-400" title="Webhook" />}
                  {node.type === 'postgres_query' && <span className="w-2 h-2 rounded-full bg-emerald-400" title="PostgreSQL" />}
                  {node.type === 'llm_classifier' && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" title="Gemini LLM" />}
                  {node.type === 'router' && <span className="w-2 h-2 rounded-full bg-purple-400" title="Router" />}
                  {node.type === 'api_tool' && <span className="w-2 h-2 rounded-full bg-amber-400" title="API Tool" />}
                  {node.type === 'email_sender' && <span className="w-2 h-2 rounded-full bg-rose-400" title="Dispatcher" />}
                </div>

                <div className="text-xs font-semibold text-slate-200 line-clamp-1">{node.name}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">{node.type.replace('_', ' ')}</div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Latency</span>
                  <span className="text-slate-300 font-mono">~30-180ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
