import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class HumidityService {
    static async create(value: number): Promise<HumidityReading> {
        return prisma.humidityReading.create({
            data: { value },
        });
    }

    static async getAll(
        params: PaginationParams = {},
    ): Promise<HumidityReading[]> {
        const { limit = 100, offset = 0, startDate, endDate } = params;

        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        return prisma.humidityReading.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
        });
    }

    static async getLatest(): Promise<HumidityReading | null> {
        return prisma.humidityReading.findFirst({
            orderBy: { createdAt: "desc" },
        });
    }

    static async deleteOldReadings(daysToKeep: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return prisma.humidityReading.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });
    }
}
