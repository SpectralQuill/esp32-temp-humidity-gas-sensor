import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class GasService {
    static async create(value: number): Promise<GasReading> {
        return prisma.gasReading.create({
            data: { value },
        });
    }

    static async getAll(params: PaginationParams = {}): Promise<GasReading[]> {
        const { limit = 100, offset = 0, startDate, endDate } = params;

        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        return prisma.gasReading.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { createdAt: "desc" },
        });
    }

    static async getLatest(): Promise<GasReading | null> {
        return prisma.gasReading.findFirst({
            orderBy: { createdAt: "desc" },
        });
    }

    static async deleteOldReadings(daysToKeep: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return prisma.gasReading.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
            },
        });
    }
}
