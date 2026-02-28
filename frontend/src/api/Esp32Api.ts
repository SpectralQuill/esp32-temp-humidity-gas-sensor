import axios, { AxiosInstance } from "axios";
import { BooleanUtils } from "../utils/BooleanUtils";
import { formatISO } from "date-fns";
import {
    IPV4_REGEX,
    PORT_REGEX
} from "../constants/ip";

export class Esp32Api {

    private readonly client: AxiosInstance;

    public constructor(
        private readonly host: string,
        private readonly port: string
    ) {

        if (!IPV4_REGEX.test(host))
            throw new Error(`Parameter host must be a valid IPv4 address`);
        if (!PORT_REGEX.test(port))
            throw new Error(`Parameter port must be an integer between 0 to 65535.`)
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: { "Content-Type": "application/json" }
        });

    }

    private get baseUrl(): string {

        const { host, port } = this;
        return `http://${host}:${port}`;

    }

    public async checkConnection(): Promise<boolean> {

        try {

            const { status, databaseStatus } = await this.getHealth();
            const isHealthy = (status === "healthy") && (databaseStatus === "reachable");
            if (!isHealthy) throw new Error();
            return isHealthy;

        } catch (error) {

            console.error(`❌ Failed to connect to API`);
            return false;

        }

    }
    
    /* =========================
    HEALTH
    ========================= */
    
    public async getHealth(): Promise<ApiHealth> {

        const { data } = await this.client.get<ApiHealth>("/health");
        return data;

    }
    
    /* =========================
    GET READINGS
    ========================= */
    
    public async getReadings(
        startDate: Date | null,
        endDate: Date | null,
        excludeStartDate: boolean | null = false,
        excludeEndDate: boolean | null = false
    ): Promise<SensorReading[]> {

        const params: DateRangeDto = this.setDateRangeParams(
            {}, startDate, endDate, excludeStartDate, excludeEndDate
        );
        try {

            const { data } = await this.client.get<SensorReading[]>(
                "/api/readings", { params }
            );
            data.forEach(reading => reading.createdAt = new Date(reading.createdAt));
            return data;

        } catch(error) {

            console.error(`❌ Failed to fetch readings`)
            return [];

        }
        

    }
    
    /* =========================
    DELETE READINGS
    ========================= */
    
    public async deleteReadings(
        startDate: Date,
        endDate: Date,
        excludeStartDate: boolean | null,
        excludeEndDate: boolean | null
    ): Promise<SensorReading[]> {

        const params: DateRangeDto = this.setDateRangeParams(
            {}, startDate, endDate, excludeStartDate, excludeEndDate
        );
        const { data } = await this.client.delete(
            "/api/readings", { params }
        );
        return data;

    }
    
    /* =========================
    RESET DATABASE
    ========================= */
    
    public async resetDatabase(): Promise<MessageResponse> {

        const { data } = await this.client.delete("/api/reset");
        return data;

    }

    /* =========================
    HELPERS
    ========================= */
    private setDateRangeParams<T extends DateRangeDto>(
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
