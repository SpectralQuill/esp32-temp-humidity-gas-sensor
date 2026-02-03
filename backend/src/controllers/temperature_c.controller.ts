import { Request, Response } from "express";
import { TemperatureCService } from "../services/temperature_c.service";
import { validationResult } from "express-validator";

export class TemperatureController {
    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { value } = req.body;
            const reading = await TemperatureCService.create(value);
            res.status(201).json(reading);
        } catch (error) {
            console.error("Error creating temperature reading:", error);
            res.status(500).json({
                error: "Failed to create temperature reading",
            });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const { limit, offset, startDate, endDate } = req.query;

            const params = {
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined,
                startDate: startDate
                    ? new Date(startDate as string)
                    : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            };

            const readings = await TemperatureCService.getAll(params);
            res.json(readings);
        } catch (error) {
            console.error("Error fetching temperature readings:", error);
            res.status(500).json({
                error: "Failed to fetch temperature readings",
            });
        }
    }

    static async getLatest(req: Request, res: Response) {
        try {
            const reading = await TemperatureCService.getLatest();
            if (!reading) {
                return res
                    .status(404)
                    .json({ error: "No temperature readings found" });
            }
            res.json(reading);
        } catch (error) {
            console.error("Error fetching latest temperature:", error);
            res.status(500).json({
                error: "Failed to fetch latest temperature",
            });
        }
    }

    static async deleteOld(req: Request, res: Response) {
        try {
            const { days = "30" } = req.query;
            const daysToKeep = parseInt(days as string);

            const result =
                await TemperatureCService.deleteOldReadings(daysToKeep);
            res.json({
                message: `Deleted ${result.count} old temperature readings`,
                count: result.count,
            });
        } catch (error) {
            console.error("Error deleting old temperature readings:", error);
            res.status(500).json({ error: "Failed to delete old readings" });
        }
    }
}
