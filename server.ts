import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import path from "path";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO system_settings (key, value) VALUES ('maintenance_mode', '0');
  INSERT OR IGNORE INTO system_settings (key, value) VALUES ('maintenance_message', 'Voltamos em breve! Estamos realizando melhorias.');
`);

app.use(express.json());

// Helper to get maintenance status
const getMaintenanceStatus = () => {
  const row = db.prepare("SELECT value FROM system_settings WHERE key = 'maintenance_mode'").get() as { value: string };
  const msgRow = db.prepare("SELECT value FROM system_settings WHERE key = 'maintenance_message'").get() as { value: string };
  return {
    isActive: row.value === '1',
    message: msgRow.value
  };
};

// Maintenance Middleware
const maintenanceMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { isActive } = getMaintenanceStatus();
  
  // Allow these paths even in maintenance
  const allowedPaths = ['/api/system/status', '/api/admin/maintenance', '/api/auth/login'];
  
  // SÓ bloqueia se for uma rota de API e não estiver na lista de permitidos
  if (isActive && req.path.startsWith('/api/') && !allowedPaths.includes(req.path)) {
    return res.status(503).json({ 
      error: "Service Unavailable", 
      message: getMaintenanceStatus().message,
      maintenanceActive: true 
    });
  }
  next();
};

app.use(maintenanceMiddleware);

// API Routes
app.get("/api/system/status", (req, res) => {
  res.json(getMaintenanceStatus());
});

app.post("/api/admin/maintenance", (req, res) => {
  const { active, message } = req.body;
  
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.prepare("UPDATE system_settings SET value = ? WHERE key = 'maintenance_mode'").run(active ? '1' : '0');
  if (message) {
    db.prepare("UPDATE system_settings SET value = ? WHERE key = 'maintenance_message'").run(message);
  }

  const status = getMaintenanceStatus();

  // Notify all connected clients via WebSocket
  if (active) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'maintenance_active', message: status.message }));
      }
    });
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'maintenance_inactive' }));
      }
    });
  }

  res.json({ success: true, ...status });
});

// WebSocket Logic
wss.on("connection", (ws) => {
  console.log("Client connected");
  
  // Send current status on connection
  const status = getMaintenanceStatus();
  if (status.isActive) {
    ws.send(JSON.stringify({ type: 'maintenance_active', message: status.message }));
  }

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      // Handle chat messages or other logic here
      if (message.type === 'chat') {
        // Broadcast chat message if not in maintenance
        const { isActive } = getMaintenanceStatus();
        if (!isActive) {
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
        }
      }
    } catch (e) {
      console.error("WS error", e);
    }
  });
});

// Vite Integration
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

init();
