import "../scripts/set-env";

import { ApiConfig } from "../utils/ApiConfig";
import cors from "cors";
import { Esp32SqliteService } from "./sqliteService";
import express from "express";
import { IpUtils } from "../utils/IpUtils";

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

    console.log("🩺 Received health check request");
    const health = await sqliteService.getHealth();
    const isHealthy = (
        (health.status === "healthy") && (health.databaseStatus === "reachable")
    );
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(health);

});

/* =======================
CREATE SINGLE ROW
======================= */
app.post("/api/reading", async (req, res) => {

    try {

        const {
            createdAt: createdAtIso, temperatureC, humidity, gas
        } = req.body as CreateReadingDto;
        if (
            temperatureC === undefined ||
            humidity === undefined ||
            gas === undefined
        ) return res.status(400).json({
            error: "temperatureC, humidity, and gas are required"
        });
        
        const createdAt = createdAtIso ? new Date(createdAtIso) : null;
        if (createdAt && isNaN(createdAt.getTime()))
            return res.status(400).json({ error: "Invalid createdAt date" });
        
        const reading = await sqliteService.createReading(
            createdAt,
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
GET READINGS
======================= */
app.get("/api/readings", async (req, res) => {

    try {

        const {
            startDate: startDateIso, endDate: endDateIso,
            excludeStartDate, excludeEndDate
        } = req.query as DateRangeDto;
        const startDate = startDateIso ? new Date(startDateIso as string) : null;
        const endDate = endDateIso ? new Date(endDateIso as string) : null;
        if (startDate && isNaN(startDate.getTime()))
            return res.status(400).json({ error: "Invalid startDate" });
        if (endDate && isNaN(endDate.getTime()))
            return res.status(400).json({ error: "Invalid endDate" });
        
        const readings = await sqliteService.getReadings(
            startDate,
            endDate,
            excludeStartDate === "true",
            excludeEndDate === "true"
        );
        
        res.status(200).json(readings);

    } catch (error) {

        console.error("Error getting readings:", error);
        res.status(500).json({ error: "Failed to get readings" });

    }

});

/* =======================
GET MAX CREATED AT DATE
======================= */
app.get("/api/readings/max-created-at", async (_req, res) => {

    try {

        const maxCreatedAt = await sqliteService.getMaxCreatedAt();
        res.status(200).json({ maxCreatedAt });

    } catch (error) {

        console.error("Error getting max createdAt:", error);
        res.status(500).json({ error: "Failed to get max createdAt" });

    }

});

/* =======================
GET MIN CREATED AT DATE
======================= */
app.get("/api/readings/min-created-at", async (_req, res) => {

    try {

        const minCreatedAt = await sqliteService.getMinCreatedAt();
        res.status(200).json({ minCreatedAt });

    } catch (error) {

        console.error("Error getting min createdAt:", error);
        res.status(500).json({ error: "Failed to get min createdAt" });

    }

});

/* =======================
DELETE READINGS
======================= */
app.delete("/api/readings", async (req, res) => {

    try {

        const {
            startDate: startDateIso, endDate: endDateIso,
            excludeStartDate, excludeEndDate
        } = req.query as DateRangeDto;
        if (!startDateIso)
            return res.status(400).json({ error: "startDate is required" });
        if (!endDateIso)
            return res.status(400).json({ error: "endDate is required" });
        const startDate = new Date(startDateIso);
        const endDate = new Date(endDateIso);
        if (isNaN(startDate.getTime()))
            return res.status(400).json({ error: "Invalid startDate" });
        if (isNaN(endDate.getTime()))
            return res.status(400).json({ error: "Invalid endDate" });

        const deleted = await sqliteService.deleteReadings(
            startDate,
            endDate,
            excludeStartDate === "true",
            excludeEndDate === "true"
        );

        res.status(200).json(deleted);

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
        res.status(200).json({ message: "Database reset successful" });

    } catch (error) {

        console.error("Error resetting database:", error);
        res.status(500).json({ error: "Failed to reset database" });

    }

});

/* =======================
START SERVER
======================= */

const formattedHost = (
    IpUtils.isAllZeroesAddress(API_HOST) ? IpUtils.getLocalIpAddress() : API_HOST
);
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
  GET    /api/readings/max-created-at
  GET    /api/readings/min-created-at

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
