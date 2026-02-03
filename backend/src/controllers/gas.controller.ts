import { Request, Response } from "express";
import { GasService } from "../services/gas.service";
import { validationResult } from "express-validator";

export class GasController {
    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { value } = req.body;
            const reading = await GasService.create(value);
            res.status(201).json(reading);
        } catch (error) {
            console.error("Error creating gas reading:", error);
            res.status(500).json({ error: "Failed to create gas reading" });
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

            const readings = await GasService.getAll(params);
            res.json(readings);
        } catch (error) {
            console.error("Error fetching gas readings:", error);
            res.status(500).json({ error: "Failed to fetch gas readings" });
        }
    }

    static async getLatest(req: Request, res: Response) {
        try {
            const reading = await GasService.getLatest();
            if (!reading) {
                return res.status(404).json({ error: "No gas readings found" });
            }
            res.json(reading);
        } catch (error) {
            console.error("Error fetching latest gas:", error);
            res.status(500).json({ error: "Failed to fetch latest gas" });
        }
    }

    static async deleteOld(req: Request, res: Response) {
        try {
            const { days = "30" } = req.query;
            const daysToKeep = parseInt(days as string);

            const result = await GasService.deleteOldReadings(daysToKeep);
            res.json({
                message: `Deleted ${result.count} old gas readings`,
                count: result.count,
            });
        } catch (error) {
            console.error("Error deleting old gas readings:", error);
            res.status(500).json({ error: "Failed to delete old readings" });
        }
    }
}
