import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationSchema, insertProRataSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculator Routes
  app.get("/api/calculations", async (_req, res) => {
    try {
      const calculations = await storage.getCalculations();
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculations" });
    }
  });

  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const calculation = await storage.getCalculation(req.params.id);
      if (!calculation) {
        return res.status(404).json({ error: "Calculation not found" });
      }
      res.json(calculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculation" });
    }
  });

  app.post("/api/calculations", async (req, res) => {
    try {
      const validatedData = insertCalculationSchema.parse(req.body);
      const calculation = await storage.createCalculation(validatedData);
      res.status(201).json(calculation);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid calculation data" });
      }
    }
  });

  // Pro-Rata Routes
  app.get("/api/pro-rata", async (_req, res) => {
    try {
      const proRataCalculations = await storage.getProRataCalculations();
      res.json(proRataCalculations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pro-rata calculations" });
    }
  });

  app.get("/api/pro-rata/:id", async (req, res) => {
    try {
      const proRata = await storage.getProRataCalculation(req.params.id);
      if (!proRata) {
        return res.status(404).json({ error: "Pro-rata calculation not found" });
      }
      res.json(proRata);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pro-rata calculation" });
    }
  });

  app.post("/api/pro-rata", async (req, res) => {
    try {
      const validatedData = insertProRataSchema.parse(req.body);
      const proRata = await storage.createProRataCalculation(validatedData);
      res.status(201).json(proRata);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid pro-rata data" });
      }
    }
  });

  // Chat Message Routes
  app.get("/api/messages", async (_req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      
      // Simulate AI response for assistant role
      if (validatedData.role === "user") {
        setTimeout(async () => {
          const assistantResponse = {
            role: "assistant" as const,
            content: `I received your message: "${validatedData.content}". This is a simulated response that will be replaced with real AI integration.`,
          };
          await storage.createChatMessage(assistantResponse);
        }, 100);
      }
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid message data" });
      }
    }
  });

  // Document Routes
  app.get("/api/documents", async (req, res) => {
    try {
      const query = req.query.q as string | undefined;
      let documents;
      
      if (query) {
        documents = await storage.searchDocuments(query);
      } else {
        documents = await storage.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
