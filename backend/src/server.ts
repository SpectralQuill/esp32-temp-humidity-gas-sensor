import { ApiConfig } from "../utils/ApiConfig";
import cors from "cors";
import dotenv from "dotenv";
import { Esp32SqliteService } from "./sqliteService";
import express from "express";
import { IpUtils } from "../utils/IpUtils";

dotenv.config();

const app = express();
const sqliteService = new Esp32SqliteService();
await sqliteService.initialize();

let apiConfig: ApiConfig;

try {

    apiConfig = new ApiConfig(
        process.env.API_HOST,
        process.env.API_PORT
    );

} catch (error) {

    console.error(
        "Invalid API configuration. Please check API_HOST and API_PORT in .env."
    );
    process.exit(1);

}

const API_HOST = apiConfig.getHost();
const API_PORT = apiConfig.getPort();

// Middleware
app.use(cors());
app.use(express.json());

/* =======================
HEALTH CHECK
======================= */
app.get("/health", async (_req, res) => {

    const health = await sqliteService.getHealth();
    const isHealthy = (health.status === "healthy" && health.databaseStatus === "reachable");
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(health);

});

/* =======================
CREATE SINGLE ROW
======================= */
app.post("/api/reading", async (req, res) => {

    try {
        const { createdAt, temperatureC, humidity, gas } = req.body;
        
        if (
            temperatureC === undefined ||
            humidity === undefined ||
            gas === undefined
        ) {
            return res.status(400).json({
                error: "temperatureC, humidity, and gas are required"
            });
        }
        
        const date = createdAt ? new Date(createdAt) : null;
        if (createdAt && isNaN(date!.getTime())) {
            return res.status(400).json({ error: "Invalid createdAt date" });
        }
        
        const reading = await sqliteService.createReading(
            date,
            Number(temperatureC),
            Number(humidity),
            Number(gas)
        );
        
        res.status(201).json(reading);

    } catch (error) {

        console.error("Error creating reading:", error);
        res.status(500).json({ error: "Failed to create reading" });

    }

});

/* =======================
GET READINGS BY DATE RANGE
======================= */
app.get("/api/readings", async (req, res) => {

    try {

        const { startDate, endDate, excludeStart, excludeEnd } = req.query;
        
        const start = startDate ? new Date(startDate as string) : null;
        const end = endDate ? new Date(endDate as string) : null;
        
        if (startDate && isNaN(start!.getTime()))
            return res.status(400).json({ error: "Invalid startDate" });
        
        if (endDate && isNaN(end!.getTime()))
            return res.status(400).json({ error: "Invalid endDate" });
        
        const readings = await sqliteService.getReadings(
            start,
            end,
            excludeStart === "true",
            excludeEnd === "true"
        );
        
        res.json(readings);

    } catch (error) {

        console.error("Error getting readings:", error);
        res.status(500).json({ error: "Failed to get readings" });

    }

});

/* =======================
DELETE READINGS
======================= */
app.delete("/api/readings", async (req, res) => {

    try {

        const { startDate, endDate } = req.query;
        
        if (!endDate)
            return res.status(400).json({ error: "endDate is required" });
        
        const start = startDate ? new Date(startDate as string) : new Date(0);
        const end = new Date(endDate as string);
        
        if (isNaN(end.getTime()))
            return res.status(400).json({ error: "Invalid endDate" });
        
        const deleted = await sqliteService.deleteReadings(start, end);
        
        res.json({
            message: `Deleted ${deleted.length} readings`,
            deleted
        });

    } catch (error) {

        console.error("Error deleting readings:", error);
        res.status(500).json({ error: "Failed to delete readings" });

    }

});

/* =======================
RESET DATABASE
======================= */
app.delete("/api/reset", async (_req, res) => {

    try {

        await sqliteService.resetDatabase();
        res.json({ message: "Database reset successful" });

    } catch (error) {

        console.error("Error resetting database:", error);
        res.status(500).json({ error: "Failed to reset database" });

    }

});

/* =======================
START SERVER
======================= */

const formattedHost = IpUtils.isAllZeroesAddress(API_HOST) ? IpUtils.getLocalIpAddress() : API_HOST;
if (!formattedHost) {

    console.error("Unable to determine local IP address for API_HOST:", API_HOST);
    process.exit(1);

}

app.listen(API_PORT, API_HOST, () => {
    console.log(`
🚀 ESP32 Sensor API Server
===========================
📍 Host: ${formattedHost}
📍 Port: ${API_PORT}
💾 Database: ${process.env.DATABASE_PATH}
🔗 Health: http://${formattedHost}:${API_PORT}/health
        
📝 API METHODS:
  POST   /api/reading
  GET    /api/readings
  DELETE /api/readings
  DELETE /api/reset
  `);
});
    
/* =======================
GRACEFUL SHUTDOWN
======================= */

const shutdown = async () => {
    console.log("Shutting down gracefully...");
    await sqliteService.close();
    process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
