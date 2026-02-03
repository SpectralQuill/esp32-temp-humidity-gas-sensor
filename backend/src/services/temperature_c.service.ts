import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TemperatureCService {
    static async create(value: number): Promise<TemperatureCReading> {
        return prisma.temperatureCReading.create({
            data: { value },
        });
    }

    static async getAll(
        params: PaginationParams = {},
    ): Promise<TemperatureCReading[]> {
        const { limit = 100, offset = 0, startDate, endDate } = params;

        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        return prisma.temperatureCReading.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
        });
    }

    static async getLatest(): Promise<TemperatureCReading | null> {
        return prisma.temperatureCReading.findFirst({
            orderBy: { createdAt: "desc" },
        });
    }

    static async deleteOldReadings(daysToKeep: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return prisma.temperatureCReading.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });
    }
}
