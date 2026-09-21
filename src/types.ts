export interface Customer {
  id: number;
  userId: string;
  name: string;
  email: string;
  company?: string | null;
  plan: string;
  sentiment: string;
  tags?: string[] | null;
  createdAt: string;
}

export interface TicketMessage {
  role: 'customer' | 'assistant' | 'agent' | 'system';
  content: string;
  timestamp: string;
  node?: string;
}

export interface Ticket {
  id: number;
  userId: string;
  customerId?: number | null;
  customerName: string;
  customerEmail: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending_agent' | 'solved' | 'escalated';
  channel: string;
  conversation: TicketMessage[];
  aiSummary?: string | null;
  suggestedAction?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'webhook' | 'llm_classifier' | 'api_tool' | 'postgres_query' | 'email_sender' | 'slack_notifier' | 'router';
  params: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'failed';
}

export interface Workflow {
  id: number;
  userId: string;
  name: string;
  description: string;
  triggerType: string;
  status: 'active' | 'paused' | 'testing';
  webhookUrl: string;
  nodesConfig: WorkflowNode[];
  executionCount: number;
  lastRunAt?: string | null;
  createdAt: string;
}

export interface NodeRun {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'success' | 'running' | 'failed';
  durationMs: number;
  input: any;
  output: any;
}

export interface WorkflowExecution {
  id: number;
  workflowId?: number | null;
  ticketId?: number | null;
  userId: string;
  triggerPayload?: Record<string, any> | null;
  status: 'success' | 'running' | 'failed';
  nodeRuns: NodeRun[];
  durationMs: number;
  errorMessage?: string | null;
  createdAt: string;
}

export interface KnowledgeDoc {
  id: number;
  userId: string;
  title: string;
  category: string;
  content: string;
  apiEndpoint?: string | null;
  tags?: string[] | null;
  createdAt: string;
}
