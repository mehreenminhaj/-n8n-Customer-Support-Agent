import React from 'react';
import { WorkflowExecution } from '../types.ts';
import { Terminal, CheckCircle2, Clock, AlertTriangle, Cpu, Layers } from 'lucide-react';

interface Props {
  executions: WorkflowExecution[];
}

export const ExecutionLogsView: React.FC<Props> = ({ executions }) => {
  if (!executions.length) {
    return (
      <div id="executions-empty" className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
        No workflow execution logs recorded yet. Run a workflow or ticket to see step-by-step logs.
      </div>
    );
  }

  return (
    <div id="execution-logs-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          n8n Workflow Execution Logs (Cloud SQL Audited)
        </h3>
        <span className="text-xs text-slate-400 font-mono">Total Runs: {executions.length}</span>
      </div>

      <div className="space-y-3">
        {executions.map((exec) => (
          <div
            key={exec.id}
            id={`exec-log-card-${exec.id}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">RUN #{exec.id}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  exec.status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {exec.status.toUpperCase()}
                </span>
                {exec.ticketId && (
                  <span className="text-xs text-slate-400">
                    Linked to Ticket <strong className="text-slate-200">#{exec.ticketId}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {exec.durationMs}ms
                </span>
                <span>{new Date(exec.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Node steps breakdown */}
            <div className="mt-3 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Executed Pipeline Nodes</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {exec.nodeRuns?.map((node, i) => (
                  <div
                    key={i}
                    className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-200 truncate">{node.nodeName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-1">
                      <span>{node.nodeType}</span>
                      <span className="text-amber-300">{node.durationMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
