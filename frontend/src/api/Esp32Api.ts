import axios, { AxiosInstance } from "axios";
import { BooleanUtils } from "../utils/BooleanUtils";
import { formatISO } from "date-fns";

const { VITE_API_HOST, VITE_API_PORT } = import.meta.env;
if (!VITE_API_HOST || !VITE_API_PORT)
    throw new Error(
        "VITE_API_HOST and VITE_API_PORT must be defined in Vite environment variables"
    );

export class Esp32Api {

    private static readonly baseUrl: string = `http://${VITE_API_HOST}:${VITE_API_PORT}`;

    private static readonly client: AxiosInstance = axios.create({
        baseURL: Esp32Api.baseUrl,
        headers: { "Content-Type": "application/json" }
    });
    
    /* =========================
    HEALTH
    ========================= */
    
    public static async getHealth(): Promise<ApiHealth> {

        const { data } = await Esp32Api.client.get<ApiHealth>("/health");
        return data;

    }
    
    /* =========================
    GET READINGS
    ========================= */
    
    public static async getReadings(
        startDate: Date | null,
        endDate: Date | null,
        excludeStartDate: boolean | null = false,
        excludeEndDate: boolean | null = false
    ): Promise<SensorReading[]> {

        const params: DateRangeDto = Esp32Api.setDateRangeParams(
            {}, startDate, endDate, excludeStartDate, excludeEndDate
        );
        const response = await Esp32Api.client.get<SensorReading[]>(
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
        excludeStartDate: boolean | null,
        excludeEndDate: boolean | null
    ): Promise<SensorReading[]> {

        const params: DateRangeDto = Esp32Api.setDateRangeParams(
            {}, startDate, endDate, excludeStartDate, excludeEndDate
        );
        const { data } = await Esp32Api.client.delete(
            "/api/readings", { params }
        );
        return data;

    }
    
    /* =========================
    RESET DATABASE
    ========================= */
    
    public static async resetDatabase(): Promise<MessageResponse> {

        const { data } = await Esp32Api.client.delete("/api/reset");
        return data;

    }

    /* =========================
    HELPERS
    ========================= */
    private static setDateRangeParams<T extends DateRangeDto>(
        params: T,
        startDate: Date | null,
        endDate: Date | null,
        excludeStartDate: boolean | null,
        excludeEndDate: boolean | null
    ): T {

        if (startDate) params.startDate = formatISO(startDate);
        if (endDate) params.endDate = formatISO(endDate);
        if (excludeStartDate !== undefined)
            params.excludeStartDate = BooleanUtils.convertToBooleanString(
                excludeStartDate
            );
        if (excludeEndDate !== undefined)
            params.excludeEndDate = BooleanUtils.convertToBooleanString(
                excludeEndDate
            );
        return params;

    }

}
