import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import {
  getOrCreateUser,
  seedInitialDataIfEmpty,
  getTickets,
  getTicketById,
  getWorkflows,
  getExecutions,
  getCustomers,
  getKnowledgeDocs,
  executeN8nAgentWorkflow,
} from "./src/db/support.ts";
import { db } from "./src/db/index.ts";
import { tickets, customers, knowledgeDocs, workflows } from "./src/db/schema.ts";
import { eq, and } from "drizzle-orm";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "n8n Customer Support Agent Backend",
      db: "Cloud SQL PostgreSQL",
      llm: "Gemini 2.5 Flash",
    });
  });

  // User Sync & Seed Endpoint
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, displayName, photoURL } = req.body;
      const uid = req.user!.uid;
      const user = await getOrCreateUser(uid, email || req.user!.email || 'user@example.com', displayName, photoURL);
      await seedInitialDataIfEmpty(uid);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Tickets Endpoints
  app.get("/api/tickets", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const ticketList = await getTickets(uid);
      res.json(ticketList);
    } catch (error: any) {
      console.error("Failed to fetch tickets:", error);
      res.status(500).json({ error: error.message || "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const ticketId = parseInt(req.params.id, 10);
      const ticket = await getTicketById(ticketId, uid);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error: any) {
      console.error("Failed to fetch ticket:", error);
      res.status(500).json({ error: error.message || "Failed to fetch ticket" });
    }
  });

  app.patch("/api/tickets/:id/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const ticketId = parseInt(req.params.id, 10);
      const { status } = req.body;

      const updated = await db.update(tickets)
        .set({
          status,
          resolvedAt: status === 'solved' ? new Date() : null,
          updatedAt: new Date()
        })
        .where(and(eq(tickets.id, ticketId), eq(tickets.userId, uid)))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      console.error("Failed to update ticket status:", error);
      res.status(500).json({ error: error.message || "Failed to update ticket status" });
    }
  });

  // Execute n8n Workflow (LLM + APIs + PostgreSQL)
  app.post("/api/n8n/execute", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const {
        customerName,
        customerEmail,
        userMessage,
        ticketId,
        selectedCategory,
        selectedPriority,
      } = req.body;

      if (!userMessage || !customerEmail || !customerName) {
        return res.status(400).json({ error: "Missing required fields: customerName, customerEmail, userMessage" });
      }

      const result = await executeN8nAgentWorkflow({
        userId: uid,
        customerName,
        customerEmail,
        userMessage,
        ticketId,
        selectedCategory,
        selectedPriority,
      });

      res.json(result);
    } catch (error: any) {
      console.error("Error executing n8n agent workflow:", error);
      res.status(500).json({ error: error.message || "Error running workflow" });
    }
  });

  // Workflows Endpoint
  app.get("/api/workflows", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const workflowList = await getWorkflows(uid);
      res.json(workflowList);
    } catch (error: any) {
      console.error("Failed to fetch workflows:", error);
      res.status(500).json({ error: error.message || "Failed to fetch workflows" });
    }
  });

  // Executions History Endpoint
  app.get("/api/executions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const executionList = await getExecutions(uid);
      res.json(executionList);
    } catch (error: any) {
      console.error("Failed to fetch executions:", error);
      res.status(500).json({ error: error.message || "Failed to fetch executions" });
    }
  });

  // Customers CRM Endpoint
  app.get("/api/customers", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const customerList = await getCustomers(uid);
      res.json(customerList);
    } catch (error: any) {
      console.error("Failed to fetch customers:", error);
      res.status(500).json({ error: error.message || "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { name, email, company, plan, tags } = req.body;
      const inserted = await db.insert(customers).values({
        userId: uid,
        name,
        email,
        company,
        plan: plan || 'Pro',
        sentiment: 'Neutral',
        tags: tags || [],
      }).returning();
      res.json(inserted[0]);
    } catch (error: any) {
      console.error("Failed to create customer:", error);
      res.status(500).json({ error: error.message || "Failed to create customer" });
    }
  });

  // Knowledge Base & Documentation Endpoints
  app.get("/api/knowledge", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const docs = await getKnowledgeDocs(uid);
      res.json(docs);
    } catch (error: any) {
      console.error("Failed to fetch knowledge docs:", error);
      res.status(500).json({ error: error.message || "Failed to fetch knowledge docs" });
    }
  });

  app.post("/api/knowledge", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { title, category, content, apiEndpoint, tags } = req.body;
      const inserted = await db.insert(knowledgeDocs).values({
        userId: uid,
        title,
        category,
        content,
        apiEndpoint,
        tags: tags || [],
      }).returning();
      res.json(inserted[0]);
    } catch (error: any) {
      console.error("Failed to add knowledge doc:", error);
      res.status(500).json({ error: error.message || "Failed to add knowledge doc" });
    }
  });

  // Mock External Internal APIs (Demonstrating API integration with n8n node tools)
  app.get("/api/tools/database/pool-stats", (req, res) => {
    res.json({
      status: "healthy",
      service: "Cloud SQL PostgreSQL 16 (Developer Edition)",
      region: "asia-southeast1",
      activeConnections: 3,
      maxConnections: 10,
      statementTimeout: "30000ms",
      queryLatencyP95: "12.4ms",
      lastBackupStatus: "completed",
    });
  });

  app.get("/api/tools/billing/quota-check", (req, res) => {
    res.json({
      status: "active",
      quotaTier: "Enterprise",
      allowedRequestsPerMinute: 250000,
      currentUsagePerMinute: 14210,
      overageEnabled: true,
      lastInvoiceStatus: "paid",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`n8n Support Agent backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
