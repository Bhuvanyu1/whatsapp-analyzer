import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";

export function createServer() {
  const app = express();

  // Initialize database connection (disabled for development)
  // TODO: Re-enable once better-sqlite3 native bindings are fixed
  console.log('⚠️ Database temporarily disabled for development');

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Basic test endpoint
  app.get("/api/test", (_req, res) => {
    res.json({ 
      message: "Server is working", 
      timestamp: new Date().toISOString(),
      status: "ok"
    });
  });

  // Legacy demo route  
  app.get("/api/demo", handleDemo);

  // Network statistics endpoint (mock data for development)
  app.get("/api/network/stats", (_req, res) => {
    try {
      res.json({
        success: true,
        data: {
          totalContacts: 0,
          totalMessages: 0,
          expertiseAreas: 0,
          totalGroups: 0,
          totalKeywords: 0,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Network stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve network statistics'
      });
    }
  });

  // Mock search endpoint
  app.post("/api/search", (_req, res) => {
    res.json({
      success: true,
      data: {
        query: "test",
        results: [],
        totalFound: 0,
        searchId: 1
      }
    });
  });

  // Basic error handling
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.path
    });
  });

  return app;
}
