import { addMinutes, format as formatDate } from "date-fns";
import { AxisTick } from "recharts/types/util/types";
import { API_BASE_URL } from "../constants/apiBaseUrl";
import axios, { AxiosResponse } from "axios";

export class SensorApi {

    private static convertReadingsResult(
        result: PromiseSettledResult<AxiosResponse<any, any, {}>>
    ): SensorReading[] {

        if (result.status !== 'fulfilled' || result.value.data.length === 0) return [];
        return result.value.data.map(
            ({createdAt, readingType, value}: SensorReading) => ({
                createdAt: new Date(createdAt),
                readingType, value
            })
        );

    }

    // private static mergeSensorData(
    //     temperatures: SensorReading[],
    //     humidities: SensorReading[],
    //     gases: SensorReading[],
    //     startDate: Date,
    //     endDate: Date,
    //     minuteInterval: number = 1
    // ): SensorChartData {

    //     startDate = new Date(startDate);
    //     const startMinute = Math.ceil(startDate.getMinutes() / minuteInterval) * minuteInterval;
    //     startDate.setMinutes(startMinute, 0, 0);
    //     endDate = new Date(endDate);
    //     const endMinute = Math.floor(endDate.getMinutes() / minuteInterval) * minuteInterval;
    //     endDate.setMinutes(endMinute, 0, 0);

    //     const dataMap = new Map<string, SensorChartDataPoint>();
    //     const addPoint = (timeKey: string, updates: Partial<SensorChartDataPoint>) => {
    //         if (dataMap.has(timeKey)) {
    //             const existing = dataMap.get(timeKey)!;
    //             Object.assign(existing, updates);
    //         } else {
    //             dataMap.set(timeKey, {
    //                 time: timeKey,
    //                 temperatureC: null,
    //                 humidity: null,
    //                 gas: null,
    //                 ...updates
    //             });
    //         }
    //     };
    //     temperatures.forEach(reading => {
    //         const timeKey = SensorApi.formatTime(reading.createdAt);
    //         addPoint(timeKey, { temperatureC: reading.value });
    //     });
    //     humidities.forEach(reading => {
    //         const timeKey = SensorApi.formatTime(reading.createdAt);
    //         addPoint(timeKey, { humidity: reading.value });
    //     });
    //     gases.forEach(reading => {
    //         const timeKey = SensorApi.formatTime(reading.createdAt);
    //         addPoint(timeKey, { gas: reading.value });
    //     });

    //     const [startTemp, endTemp] = SensorApi.getStartAndEndValues(temperatures);
    //     const [startHumidity, endHumidity] = SensorApi.getStartAndEndValues(humidities);
    //     const [startGas, endGas] = SensorApi.getStartAndEndValues(gases);
    //     const startPoint: SensorChartDataPoint = {
    //         time: SensorApi.formatTime(startDate),
    //         temperatureC: startTemp,
    //         humidity: startHumidity,
    //         gas: startGas
    //     };
    //     const endPoint: SensorChartDataPoint = {
    //         time: SensorApi.formatTime(endDate),
    //         temperatureC: endTemp,
    //         humidity: endHumidity,
    //         gas: endGas
    //     };

    //     if ([startTemp, startHumidity, startGas].some(value => value !== null)) {
    //         addPoint(startPoint.time, {
    //             temperatureC: startTemp,
    //             humidity: startHumidity,
    //             gas: startGas
    //         });
    //     }
    //     if ([endTemp, endHumidity, endGas].some(value => value !== null)) {
    //         addPoint(endPoint.time, {
    //             temperatureC: endTemp,
    //             humidity: endHumidity,
    //             gas: endGas
    //         });
    //     }

    //     while (startDate <= endDate) {
    //         const timeKey = SensorApi.formatTime(startDate);
    //         if(!dataMap.has(timeKey)) addPoint(timeKey, {
    //             time: timeKey,
    //             temperatureC: null,
    //             humidity: null,
    //             gas: null
    //         });
    //         startDate = addMinutes(startDate, minuteInterval);
    //     }

    //     return Array.from(dataMap.values()).sort((a, b) => a.time > b.time ? 1 : -1);
    // }

    public static bucketMsToMin(ms: number, bucketMin: number, offsetMin: number) {

        const bucketMs = bucketMin * 60000;
        const offsetMs = offsetMin * 60000;
        return Math.floor((ms - offsetMs) / bucketMs) * bucketMs + offsetMs;

    }

    public static async checkDatabaseConnection(): Promise<boolean> {
        try {
            const healthData = await SensorApi.getHealth();
            
            if (healthData.status === "healthy") {
                console.log("✅ Database connection is healthy");
                console.log(`📊 Service: ${healthData.service}`);
                console.log(`🕐 Uptime: ${Math.floor(healthData.uptime)} seconds`);
                return true;
            } else {
                console.error("❌ API returned unhealthy status");
                return false;
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || error.code === 'ECONNREFUSED') {
                console.error("❌ Cannot connect to API server. Is it running?");
            } else if (error.message?.includes('Health check failed')) {
                console.error(`❌ Health check failed: ${error.message}`);
            } else {
                console.error("❌ Failed to connect to database API:", error.message || error);
            }
            return false;
        }
    }

    public static formatTime(timestamp: Date): string {

        return formatDate(timestamp, "yyyy-MM-dd HH:mm:ss.SSS");

    }
    
    /**
     * Get latest readings for all sensor types
     */
    public static async getLatestReadings(): Promise<LatestSensorReadings> {

        const response = await axios.get(`${API_BASE_URL}/api/readings/latest`);
        const data = response.data;
        const result: LatestSensorReadings = {};
        
        if (data.temperatureC) {
            result.temperatureC = {
                createdAt: new Date(data.temperatureC.createdAt),
                readingType: "temperatureC",
                value: data.temperatureC.value
            };
        }
        
        if (data.humidity) {
            result.humidity = {
                createdAt: new Date(data.humidity.createdAt),
                readingType: "humidity",
                value: data.humidity.value
            };
        }
        
        if (data.gas) {
            result.gas = {
                createdAt: new Date(data.gas.createdAt),
                readingType: "gas",
                value: data.gas.value
            };
        }
        
        return result;

    }
    
    /**
     * Get health status of the API
     */
    public static async getHealth(): Promise<{
        status: string;
        service: string;
        timestamp: string;
        database: string;
        uptime: number;
    }> {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            
            if (!response.ok) {
                throw new Error(`Health check failed: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching health status:", error);
            throw error;
        }
    }
    
    /**
     * Alternative method using axios if you have it installed
     * This matches your original React code pattern
     */
    public static async getSensorChartData(
        startDate: Date,
        endDate: Date,
        minuteInterval: number
    ): Promise<[SensorChartData, AxisTick[]]> {

        const [temperatures, humidities, gases] = await SensorApi.getReadings(
            startDate, endDate
        );
        const offsetMin: number = startDate.getMinutes();
        const uniqueDataMap = new Map<string, SensorChartDataPoint>();
        const chartDataMap = new Map<string, SensorChartDataPoint>();
        const addPoint = (
            dataMap: Map<string, SensorChartDataPoint>,
            date: Date,
            updates: Partial<SensorChartDataPoint>
        ) => {
            const timestamp: number = date.getTime();
            const timestampString = String(timestamp);
            if (dataMap.has(String(timestampString))) {
                const existing = dataMap.get(timestampString)!;
                if (updates.temperatureC === null) delete updates['temperatureC'];
                if (updates.humidity === null) delete updates['humidity'];
                if (updates.gas === null) delete updates['gas'];
                Object.assign(existing, updates);
            } else {
                dataMap.set(timestampString, {
                    timestamp, temperatureC: null, humidity: null, gas: null, ...updates
                });
            }
        };
        
        startDate.setTime(SensorApi.bucketMsToMin(
            startDate.getTime(), minuteInterval, offsetMin
        ));
        endDate.setTime(SensorApi.bucketMsToMin(
            endDate.getTime(), minuteInterval, offsetMin
        ));
        [temperatures, humidities, gases].forEach(readings => {
            if (readings.length === 0) return;
            const firstReading = readings[0];
            addPoint(uniqueDataMap, startDate, { [firstReading.readingType]: firstReading.value });
            readings.forEach(reading => addPoint(
                uniqueDataMap, reading.createdAt, { [reading.readingType]: reading.value }
            ));
        });

        const uniqueTimestampKeys: number[] = [...uniqueDataMap.keys()].map(key => +key).sort();

        // hunt down every timestamp to fill
        const xTicks: number[] = [];
        let timestampIndex: number = 0;
        while (startDate <= endDate) {
            const timestamp: number = startDate.getTime();
            if(uniqueTimestampKeys[timestampIndex + 1] >= timestamp) timestampIndex++;
            const chartPoint: SensorChartDataPoint = uniqueDataMap.get(
                String(uniqueTimestampKeys[timestampIndex])
            )!;
            addPoint(chartDataMap, new Date(timestamp), {
                temperatureC: chartPoint?.temperatureC ?? null,
                humidity: chartPoint?.humidity ?? null,
                gas: chartPoint?.gas ?? null
            });
            startDate = addMinutes(startDate, minuteInterval);
            xTicks.push(timestamp);
        }
        const chartData = Array.from(chartDataMap.values());
        return [chartData, xTicks];

    }

    public static async getReadings(startDate: Date, endDate: Date): Promise<[
        SensorReading[], SensorReading[], SensorReading[]
    ]> {

        const [temperaturesCResult, humiditiesResult, gasesResult] = await Promise.allSettled([
            axios.get(`${API_BASE_URL}/api/readings/temperature`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            }),
            axios.get(`${API_BASE_URL}/api/readings/humidity`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            }),
            axios.get(`${API_BASE_URL}/api/readings/gas`, {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            }),
        ]);
        let temperatures: SensorReading[] = SensorApi.convertReadingsResult(temperaturesCResult);
        let humidities: SensorReading[] = SensorApi.convertReadingsResult(humiditiesResult);
        let gases: SensorReading[] = SensorApi.convertReadingsResult(gasesResult);
        const hasEmptyResult = (
            temperatures.length === 0 || humidities.length === 0 || gases.length === 0
        );
        if (hasEmptyResult) {
            const latestReadings = await this.getLatestReadings();
            if (temperatures.length === 0 && latestReadings.temperatureC !== undefined){
                temperatures = [latestReadings.temperatureC];
                temperatures[0].createdAt = startDate;
            }
            if (humidities.length === 0 && latestReadings.humidity !== undefined){
                humidities = [latestReadings.humidity];
                humidities[0].createdAt = startDate;
            }
            if (gases.length === 0 && latestReadings.gas !== undefined){
                gases = [latestReadings.gas];
                gases[0].createdAt = startDate;
            }
        }
        return [temperatures, humidities, gases];

    }

}
