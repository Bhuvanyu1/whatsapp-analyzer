import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
import { dbManager } from "./database/connection.js";

// Temporarily disable route imports to isolate path-to-regexp issue
// TODO: Re-enable once issue is resolved

// Import WhatsApp routes (disabled)
// import {
//   validateFile,
//   importFile,
//   getImportHistory,
//   exportData,
//   uploadMiddleware
// } from "./routes/whatsapp.js";

// Import contact routes (disabled)
// import {
//   getContacts,
//   getContact,
//   updateContact,
//   searchNetwork,
//   getNetworkAnalytics,
//   recordSearchFeedback
// } from "./routes/contacts.js";

export function createServer() {
  const app = express();

  // Initialize database connection (disabled for development)
  // TODO: Re-enable once better-sqlite3 native bindings are fixed
  // try {
  //   dbManager.connect();
  //   console.log('✅ Database initialized successfully');
  // } catch (error) {
  //   console.error('❌ Database initialization failed:', error);
  //   process.exit(1);
  // }
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

  app.get("/api/health", (_req, res) => {
    const dbHealth = dbManager.isHealthy();
    const stats = dbManager.getStats();
    
    res.json({
      status: dbHealth ? 'healthy' : 'unhealthy',
      database: dbHealth,
      timestamp: new Date().toISOString(),
      stats
    });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Temporarily disable complex routes to isolate the issue
  // TODO: Re-enable once path-to-regexp issue is resolved

  // Basic test routes
  app.get("/api/test", (_req, res) => {
    res.json({ message: "Server is working", timestamp: new Date().toISOString() });
  });

  // WhatsApp import routes (disabled)
  // app.post("/api/whatsapp/validate", uploadMiddleware, validateFile);
  // app.post("/api/whatsapp/import", uploadMiddleware, importFile);
  // app.get("/api/whatsapp/history", getImportHistory);
  // app.get("/api/whatsapp/export", exportData);

  // Contact management routes (disabled)
  // app.get("/api/contacts", getContacts);
  // app.get("/api/contacts/:id", getContact);
  // app.put("/api/contacts/:id", updateContact);

  // Search and analytics routes (disabled)
  // app.post("/api/search", searchNetwork);
  // app.get("/api/analytics", getNetworkAnalytics);
  // app.post("/api/search/:searchId/feedback", recordSearchFeedback);

  // Network statistics endpoint (mock data for development)
  app.get("/api/network/stats", (_req, res) => {
    try {
      // Return mock data while database is disabled
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

  // Error handling middleware
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    dbManager.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    dbManager.close();
    process.exit(0);
  });

  return app;
}
