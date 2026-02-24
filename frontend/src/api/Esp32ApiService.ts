import axios, { AxiosInstance } from "axios";
import { formatISO } from "date-fns";

const { VITE_API_HOST, VITE_API_PORT } = import.meta.env;
if (!VITE_API_HOST || !VITE_API_PORT)
    throw new Error(
        "VITE_API_HOST and VITE_API_PORT must be defined in Vite environment variables"
    );

export class Esp32ApiService {

    private static readonly baseUrl: string = `http://${VITE_API_HOST}:${VITE_API_PORT}`;

    private static readonly client: AxiosInstance = axios.create({
        baseURL: Esp32ApiService.baseUrl,
        headers: { "Content-Type": "application/json" }
    });
    
    /* =========================
    HEALTH
    ========================= */
    
    public static async getHealth(): Promise<Esp32ApiHealth> {

        const { data } = await Esp32ApiService.client.get<Esp32ApiHealth>("/health");
        return data;

    }
    
    /* =========================
    CREATE READING
    ========================= */
    
    public static async createReading(
        createdAt: Date | null,
        temperatureC: number,
        humidity: number,
        gas: number
    ): Promise<SensorReading> {

        const payload: CreateReadingDto = {
            temperatureC,
            humidity,
            gas
        };
        if (createdAt) payload.createdAt = formatISO(createdAt);
        const { data } = await Esp32ApiService.client.post<SensorReading>(
            "/api/reading", payload
        );
        return data;

    }
    
    /* =========================
    GET READINGS
    ========================= */
    
    public static async getReadings(
        startDate?: Date | null,
        endDate?: Date | null,
        excludeStartDate?: boolean,
        excludeEndDate?: boolean
    ): Promise<SensorReading[]> {

        const params: GetReadingsDto = {};
        if (startDate) params.startDate = formatISO(startDate);
        if (endDate) params.endDate = formatISO(endDate);
        if (excludeStartDate !== undefined)
            params.excludeStartDate = excludeStartDate ? "true" : "false";
        if (excludeEndDate !== undefined)
            params.excludeEndDate = excludeEndDate ? "true" : "false";
        const response = await Esp32ApiService.client.get<SensorReading[]>(
            "/api/readings", { params }
        );
        return response.data;

    }
    
    /* =========================
    DELETE READINGS
    ========================= */
    
    public static async deleteReadings(
        startDate: Date,
        endDate: Date,
        excludeStartDate?: boolean,
        excludeEndDate?: boolean
    ): Promise<SensorReading[]> {

        const params: DeleteReadingsDto = {
            startDate: formatISO(startDate),
            endDate: formatISO(endDate)
        };
        if (excludeStartDate !== undefined)
            params.excludeStartDate = excludeStartDate ? "true" : "false";
        if (excludeEndDate !== undefined)
            params.excludeEndDate = excludeEndDate ? "true" : "false";

        const { data } = await Esp32ApiService.client.delete(
            "/api/readings", { params }
        );
        return data;

    }
    
    /* =========================
    RESET DATABASE
    ========================= */
    
    public static async resetDatabase(): Promise<MessageResponse> {

        const { data } = await Esp32ApiService.client.delete("/api/reset");
        return data;

    }

}
