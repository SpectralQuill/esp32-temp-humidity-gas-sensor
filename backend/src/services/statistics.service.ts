import { TemperatureCService } from './temperature_c.service';
import { HumidityService } from './humidity.service';
import { GasService } from './gas.service';

enum SensorReadingType {
    temperatureC = 0,
    humidity = 1,
    gas = 2
}

export class StatisticsService {
    static async getAll(params: PaginationParams = {}): Promise<AllReadings[]> {
        const
            temperaturesC = await TemperatureCService.getAll(params),
            humidities = await HumidityService.getAll(params),
            gases = await GasService.getAll(params),
            readingsByTime = new Map<string, AllReadings>()
        ;
        [temperaturesC, humidities, gases].forEach(
            (readingsArray, SensorReadingTypeIndex) =>
                readingsArray.forEach(reading => {
                    const timeKey = reading.createdAt.toISOString();
                    if (!readingsByTime.has(timeKey))
                        readingsByTime.set(timeKey, { timestamp: reading.createdAt });
                    const entry = readingsByTime.get(timeKey)!;
                    switch (SensorReadingTypeIndex) {
                        case SensorReadingType.temperatureC:
                            entry.temperatureC = reading;
                            break;
                        case SensorReadingType.humidity:
                            entry.humidity = reading;
                            break;
                        case SensorReadingType.gas:
                            entry.gas = reading;
                            break;
                    }
                })
        );
        return Array.from(readingsByTime.values()).sort(
            (a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
        );
    }
    
    static async getAllLatest(): Promise<AllReadings> {
        const [temperatureC, humidity, gas] = await Promise.all([
            TemperatureCService.getLatest(),
            HumidityService.getLatest(),
            GasService.getLatest(),
        ]);
        
        const latestTimestamp = [temperatureC, humidity, gas]
        .filter(Boolean)
        .reduce((latest, reading) => {
            if (!reading || !reading.createdAt) return latest;
            return reading.createdAt > latest ? reading.createdAt : latest;
        }, new Date(0));
        
        return {
            temperatureC: temperatureC || undefined,
            humidity: humidity || undefined,
            gas: gas || undefined,
            timestamp: latestTimestamp.getTime() > 0 ? latestTimestamp : undefined,
        };
    }
}
