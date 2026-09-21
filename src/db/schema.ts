// src/db/schema.ts
import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customers / Contact Records
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Owner Firebase UID
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company'),
  plan: text('plan').default('Pro').notNull(), // Free, Starter, Pro, Enterprise
  sentiment: text('sentiment').default('Neutral').notNull(), // Happy, Neutral, Frustrated
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Support Tickets
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Owner Firebase UID
  customerId: integer('customer_id').references(() => customers.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // Billing, API Bug, Integration, Account, Feature Request
  priority: text('priority').default('medium').notNull(), // low, medium, high, urgent
  status: text('status').default('open').notNull(), // open, pending_agent, solved, escalated
  channel: text('channel').default('n8n_webhook').notNull(), // n8n_webhook, email, api, chat
  conversation: jsonb('conversation').$type<Array<{
    role: 'customer' | 'assistant' | 'agent' | 'system';
    content: string;
    timestamp: string;
    node?: string;
  }>>().default([]),
  aiSummary: text('ai_summary'),
  suggestedAction: text('suggested_action'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// n8n Automated Workflows Definition & Status
export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  triggerType: text('trigger_type').notNull(), // Webhook, Cron, Database Event, API Poll
  status: text('status').default('active').notNull(), // active, paused, testing
  webhookUrl: text('webhook_url').notNull(),
  nodesConfig: jsonb('nodes_config').$type<Array<{
    id: string;
    name: string;
    type: 'webhook' | 'llm_classifier' | 'api_tool' | 'postgres_query' | 'email_sender' | 'slack_notifier' | 'router';
    params: Record<string, any>;
    status?: 'idle' | 'running' | 'success' | 'failed';
  }>>().notNull(),
  executionCount: integer('execution_count').default(0).notNull(),
  lastRunAt: timestamp('last_run_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// n8n Workflow Execution Logs (Step-by-step nodes)
export const workflowExecutions = pgTable('workflow_executions', {
  id: serial('id').primaryKey(),
  workflowId: integer('workflow_id').references(() => workflows.id),
  ticketId: integer('ticket_id').references(() => tickets.id),
  userId: text('user_id').notNull(),
  triggerPayload: jsonb('trigger_payload').$type<Record<string, any>>(),
  status: text('status').notNull(), // success, running, failed
  nodeRuns: jsonb('node_runs').$type<Array<{
    nodeId: string;
    nodeName: string;
    nodeType: string;
    status: 'success' | 'running' | 'failed';
    durationMs: number;
    input: any;
    output: any;
  }>>().default([]),
  durationMs: integer('duration_ms').default(0).notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Knowledge Base / Support Docs for LLM RAG & Tooling
export const knowledgeDocs = pgTable('knowledge_docs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  apiEndpoint: text('api_endpoint'),
  tags: jsonb('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relationships
export const customersRelations = relations(customers, ({ many }) => ({
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowsRelations = relations(workflows, ({ many }) => ({
  executions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowExecutions.workflowId],
    references: [workflows.id],
  }),
  ticket: one(tickets, {
    fields: [workflowExecutions.ticketId],
    references: [tickets.id],
  }),
}));
