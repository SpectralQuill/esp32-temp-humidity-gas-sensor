import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine,
} from "recharts";
import "../style/Dashboard.scss";

const API_BASE_URL = "http://localhost:3000";

interface SensorReading {
    createdAt: string;
    readingType: string;
    value: number;
}

interface LatestReadings {
    temperatureC?: SensorReading;
    humidity?: SensorReading;
    gas?: SensorReading;
}

interface ChartDataPoint {
    time: string;
    temperatureC: number | null;
    humidity: number | null;
    gas: number | null;
}

// Temperature reference lines (in °C)
const TEMPERATURE_LEVELS = {
    EXTREME_COLD: 5,
    DANGER_COLD: 10,
    COMFORT_LOW: 18,
    COMFORT_HIGH: 24,
    DANGER_HOT: 32,
    EXTREME_HOT: 38,
};

// Humidity reference lines (in % - multiplied by 100)
const HUMIDITY_LEVELS = {
    TOO_DRY: 30,
    COMFORT_LOW: 40,
    COMFORT_HIGH: 60,
    TOO_HUMID: 70,
    DANGER_HUMID: 80,
};

// Gas reference lines (assuming air quality index 0-500)
const GAS_LEVELS = {
    GOOD: 10,
    MODERATE: 20,
    UNHEALTHY_SENSITIVE: 30,
    UNHEALTHY: 40,
    VERY_UNHEALTHY: 60,
};

const Dashboard: React.FC = () => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [latestValues, setLatestValues] = useState<LatestReadings>({});
    const [timeRange, setTimeRange] = useState<number>(30); // minutes
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    // Fetch initial data and set up polling
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [timeRange]);

    useEffect(() => {
        const newStatus = getCurrentStatus();
    }, [latestValues]);

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // Calculate time range
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - timeRange * 60000);

            // Fetch latest readings for current values
            const latestRes = await axios.get(
                `${API_BASE_URL}/api/readings/latest`,
            );
            latestRes.data.humidity.value *= 100;
            latestRes.data.gas.value *= 100;
            setLatestValues(latestRes.data);

            // Fetch historical data for charts
            const [tempRes, humidityRes, gasRes] = await Promise.all([
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

            // Process and multiply humidity and gas values by 100
            const processReadings = (
                readings: DBSensorReading[],
                multiplyBy100: boolean,
            ) => {
                return readings.map((reading) => ({
                    ...reading,
                    value: multiplyBy100 ? reading.value * 100 : reading.value,
                }));
            };

            // Process temperature data and add boundary points
            const processedTempData = addBoundaryPoints(
                tempRes.data,
                "temperatureC",
                startDate,
                endDate,
            );

            // Process humidity data and add boundary points
            const processedHumidityData = addBoundaryPoints(
                processReadings(humidityRes.data, true),
                "humidity",
                startDate,
                endDate,
            );

            // Process gas data and add boundary points
            const processedGasData = addBoundaryPoints(
                processReadings(gasRes.data, true),
                "gas",
                startDate,
                endDate,
            );

            // Merge data for charts with processed values
            const mergedData = mergeSensorData(
                processedTempData,
                processedHumidityData,
                processedGasData,
            );

            setChartData(mergedData);
            setLastUpdate(new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addBoundaryPoints = (
        readings: DBSensorReading[],
        readingType: SensorReadingType,
        startDate: Date,
        endDate: Date,
    ): DBSensorReading[] => {
        if (readings.length === 0) return readings;

        // Sort readings by time (oldest first)
        const sortedReadings = [...readings].sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
        );

        // Get earliest and latest values
        const earliestValue = sortedReadings[0].value;
        const latestValue = sortedReadings[sortedReadings.length - 1].value;

        // Create boundary points
        const startPoint: DBSensorReading = {
            createdAt: startDate.toISOString(),
            readingType: readingType,
            value: earliestValue,
        };

        const endPoint: DBSensorReading = {
            createdAt: endDate.toISOString(),
            readingType: readingType,
            value: latestValue,
        };

        // Return original readings with boundary points
        return [startPoint, ...sortedReadings, endPoint];
    };

    const mergeSensorData = (
        temperatureCData: SensorReading[],
        humidityData: SensorReading[],
        gasData: SensorReading[],
    ): ChartDataPoint[] => {
        const allReadings: Array<{
            timestamp: Date;
            temperatureC: number | null;
            humidity: number | null;
            gas: number | null;
            timeString: string;
        }> = [];

        // Helper function to add readings
        const addReading = (
            timestamp: Date,
            type: "temperatureC" | "humidity" | "gas",
            value: number,
        ) => {
            const existing = allReadings.find(
                (r) => r.timestamp.getTime() === timestamp.getTime(),
            );

            const timeString = `${timestamp.getHours().toString().padStart(2, "0")}:${timestamp.getMinutes().toString().padStart(2, "0")}:${timestamp.getSeconds().toString().padStart(2, "0")}`;

            if (existing) {
                existing[type] = value;
            } else {
                allReadings.push({
                    timestamp,
                    timeString,
                    temperatureC: type === "temperatureC" ? value : null,
                    humidity: type === "humidity" ? value : null,
                    gas: type === "gas" ? value : null,
                });
            }
        };

        // Process all data
        temperatureCData.forEach((reading) => {
            addReading(
                new Date(reading.createdAt),
                "temperatureC",
                reading.value,
            );
        });

        humidityData.forEach((reading) => {
            addReading(new Date(reading.createdAt), "humidity", reading.value);
        });

        gasData.forEach((reading) => {
            addReading(new Date(reading.createdAt), "gas", reading.value);
        });

        // Sort by timestamp (oldest first)
        allReadings.sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );

        // Convert to ChartDataPoint format
        return allReadings.map((reading) => ({
            time: reading.timeString,
            temperatureC: reading.temperatureC,
            humidity: reading.humidity,
            gas: reading.gas,
        }));
    };

    const formatTimeRange = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes} min`;
        } else if (minutes < 1440) {
            return `${Math.floor(minutes / 60)} hr`;
        } else {
            return `${Math.floor(minutes / 1440)} days`;
        }
    };

    const getCurrentStatus = () => {
        const status = {
            temperature: "Normal",
            humidity: "Normal",
            gas: "Good",
            overall: "Healthy",
        };

        // Track if any sensor is in warning or danger
        let hasWarning = false;
        let hasDanger = false;

        if (latestValues.temperatureC) {
            const temp = latestValues.temperatureC.value;
            if (
                temp < TEMPERATURE_LEVELS.EXTREME_COLD ||
                temp > TEMPERATURE_LEVELS.EXTREME_HOT
            ) {
                status.temperature =
                    temp < TEMPERATURE_LEVELS.EXTREME_COLD
                        ? "Extreme Cold"
                        : "Extreme Heat";
                hasDanger = true;
            } else if (
                temp < TEMPERATURE_LEVELS.DANGER_COLD ||
                temp > TEMPERATURE_LEVELS.DANGER_HOT
            ) {
                status.temperature =
                    temp < TEMPERATURE_LEVELS.DANGER_COLD
                        ? "Too Cold"
                        : "Too Hot";
                hasDanger = true;
            } else if (
                temp < TEMPERATURE_LEVELS.COMFORT_LOW ||
                temp > TEMPERATURE_LEVELS.COMFORT_HIGH
            ) {
                status.temperature =
                    temp < TEMPERATURE_LEVELS.COMFORT_LOW ? "Cool" : "Warm";
                hasWarning = true;
            }
        }

        if (latestValues.humidity) {
            const humidity = latestValues.humidity.value;
            if (humidity > HUMIDITY_LEVELS.DANGER_HUMID) {
                status.humidity = "Danger";
                hasDanger = true;
            } else if (
                humidity > HUMIDITY_LEVELS.TOO_HUMID ||
                humidity < HUMIDITY_LEVELS.TOO_DRY
            ) {
                status.humidity =
                    humidity > HUMIDITY_LEVELS.TOO_HUMID ? "Humid" : "Dry";
                hasWarning = true;
            }
        }

        if (latestValues.gas) {
            const gas = latestValues.gas.value / 100; // Divide by 100 to get actual percentage
            if (gas > GAS_LEVELS.VERY_UNHEALTHY) {
                status.gas = "Hazardous";
                hasDanger = true;
            } else if (gas > GAS_LEVELS.UNHEALTHY) {
                status.gas = "Very Unhealthy";
                hasDanger = true;
            } else if (gas > GAS_LEVELS.UNHEALTHY_SENSITIVE) {
                status.gas = "Unhealthy";
                hasWarning = true;
            } else if (gas > GAS_LEVELS.MODERATE) {
                status.gas = "Poor";
                hasWarning = true;
            }
        }

        // Determine overall status
        if (hasDanger) {
            status.overall = "Unhealthy";
        } else if (hasWarning) {
            status.overall = "Warning";
        } else {
            status.overall = "Healthy";
        }

        return status;
    };

    const currentStatus = getCurrentStatus();

    return (
        <div className="dashboard">
            {/* Status Bar with Health Status */}
            <div className="status-bar">
                <div className="status-indicator">
                    <div
                        className={`status-dot ${isLoading ? "loading" : "active"}`}
                    ></div>
                    <span>{isLoading ? "Updating..." : "Connected"}</span>
                </div>
                <div className="health-status">
                    <div
                        className={`health-badge ${currentStatus.overall.toLowerCase()}`}
                    >
                        {currentStatus.overall}
                    </div>
                </div>
                <div className="time-range-selector">
                    <span>Time Range:</span>
                    <select
                        id="timeRange"
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        disabled={isLoading}
                    >
                        <option value={5}>5 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={180}>3 hours</option>
                        <option value={360}>6 hours</option>
                        <option value={720}>12 hours</option>
                        <option value={1440}>24 hours</option>
                    </select>
                </div>
                <div className="last-update">Last update: {lastUpdate}</div>
            </div>

            {/* Current Values Cards with Status */}
            <div className="current-values">
                <div
                    className={`value-card temperature ${currentStatus.temperature.toLowerCase().replace(" ", "-")}`}
                >
                    <h3>🌡️ Temperature</h3>
                    <div className="value">
                        {latestValues.temperatureC
                            ? `${latestValues.temperatureC.value.toFixed(1)}°C`
                            : "--"}
                    </div>
                    <div className="status-label">
                        {currentStatus.temperature}
                    </div>
                    <div className="timestamp">
                        {latestValues.temperatureC
                            ? new Date(
                                  latestValues.temperatureC.createdAt,
                              ).toLocaleTimeString()
                            : "No data"}
                    </div>
                </div>

                <div
                    className={`value-card humidity ${currentStatus.humidity.toLowerCase().replace(" ", "-")}`}
                >
                    <h3>💧 Humidity</h3>
                    <div className="value">
                        {latestValues.humidity
                            ? `${latestValues.humidity.value.toFixed(0)}%`
                            : "--"}
                    </div>
                    <div className="status-label">{currentStatus.humidity}</div>
                    <div className="timestamp">
                        {latestValues.humidity
                            ? new Date(
                                  latestValues.humidity.createdAt,
                              ).toLocaleTimeString()
                            : "No data"}
                    </div>
                </div>

                <div
                    className={`value-card gas ${currentStatus.gas.toLowerCase().replace(" ", "-")}`}
                >
                    <h3>🔥 Gas</h3>
                    <div className="value">
                        {latestValues.gas
                            ? `${latestValues.gas.value.toFixed(0)}%`
                            : "--"}
                    </div>
                    <div className="status-label">{currentStatus.gas}</div>
                    <div className="timestamp">
                        {latestValues.gas
                            ? new Date(
                                  latestValues.gas.createdAt,
                              ).toLocaleTimeString()
                            : "No data"}
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Temperature Chart */}
                <div className="chart-container">
                    <h3>Temperature Trend ({formatTimeRange(timeRange)})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                label={{
                                    value: "°C",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 10,
                                }}
                                tick={{ fontSize: 12 }}
                                domain={[
                                    (dataMin: number) =>
                                        Math.min(0, dataMin - 2), // Minimum of 0 or dataMin - 2
                                    (dataMax: number) =>
                                        Math.max(39, dataMax + 2), // Maximum of 39 or dataMax + 2
                                ]}
                            />

                            {/* Reference Lines for Temperature */}
                            <ReferenceLine
                                y={TEMPERATURE_LEVELS.EXTREME_COLD}
                                stroke="#8b0000"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Extreme Cold",
                                    position: "insideBottomLeft",
                                    fill: "#8b0000",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={TEMPERATURE_LEVELS.DANGER_COLD}
                                stroke="#ff4444"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                            />
                            <ReferenceLine
                                y={TEMPERATURE_LEVELS.COMFORT_LOW}
                                stroke="#4caf50"
                                strokeWidth={1}
                            />
                            <ReferenceLine
                                y={TEMPERATURE_LEVELS.COMFORT_HIGH}
                                stroke="#4caf50"
                                strokeWidth={1}
                            />
                            <ReferenceLine
                                y={TEMPERATURE_LEVELS.DANGER_HOT}
                                stroke="#ff4444"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                            />
                            <ReferenceLine
                                y={TEMPERATURE_LEVELS.EXTREME_HOT}
                                stroke="#8b0000"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Extreme Heat",
                                    position: "insideTopLeft",
                                    fill: "#8b0000",
                                    fontSize: 10,
                                }}
                            />

                            <Tooltip
                                formatter={(value: number | undefined) =>
                                    value !== undefined
                                        ? [
                                              `${value.toFixed(1)}°C`,
                                              "Temperature",
                                          ]
                                        : ["--", "Temperature"]
                                }
                                labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="temperatureC"
                                stroke="#ff7300"
                                fill="#ff7300"
                                fillOpacity={0.3}
                                strokeWidth={2}
                                name="Temperature"
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                                connectNulls={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="chart-legend">
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#4caf50" }}
                            ></div>
                            <span>Comfort Zone (18-24°C)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#ff4444" }}
                            ></div>
                            <span>Danger Zone (&lt;10°C or &gt;32°C)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#8b0000" }}
                            ></div>
                            <span>Extreme Danger (&lt;5°C or &gt;38°C)</span>
                        </div>
                    </div>
                </div>

                {/* Humidity Chart */}
                <div className="chart-container">
                    <h3>Humidity Trend ({formatTimeRange(timeRange)})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                label={{
                                    value: "%",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 10,
                                }}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(0)}
                                domain={[0, 100]}
                            />

                            {/* Reference Lines for Humidity */}
                            <ReferenceLine
                                y={HUMIDITY_LEVELS.TOO_DRY}
                                stroke="#ff9800"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                                label={{
                                    value: "Too Dry",
                                    position: "insideBottomLeft",
                                    fill: "#ff9800",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={HUMIDITY_LEVELS.COMFORT_LOW}
                                stroke="#4caf50"
                                strokeWidth={1}
                            />
                            <ReferenceLine
                                y={HUMIDITY_LEVELS.COMFORT_HIGH}
                                stroke="#4caf50"
                                strokeWidth={1}
                            />
                            <ReferenceLine
                                y={HUMIDITY_LEVELS.TOO_HUMID}
                                stroke="#ff9800"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                                label={{
                                    value: "Too Humid",
                                    position: "insideTopLeft",
                                    fill: "#ff9800",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={HUMIDITY_LEVELS.DANGER_HUMID}
                                stroke="#ff4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Danger",
                                    position: "insideTopRight",
                                    fill: "#ff4444",
                                    fontSize: 10,
                                }}
                            />

                            <Tooltip
                                formatter={(value: number | undefined) =>
                                    value !== undefined
                                        ? [`${value.toFixed(0)}%`, "Humidity"]
                                        : ["--", "Humidity"]
                                }
                                labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="humidity"
                                stroke="#0088ff"
                                fill="#0088ff"
                                fillOpacity={0.3}
                                strokeWidth={2}
                                name="Humidity"
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                                connectNulls={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="chart-legend">
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#4caf50" }}
                            ></div>
                            <span>Comfort Zone (40-60%)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#ff9800" }}
                            ></div>
                            <span>Uncomfortable (&lt;30% or &gt;70%)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#ff4444" }}
                            ></div>
                            <span>Danger Zone (&gt;80%)</span>
                        </div>
                    </div>
                </div>

                {/* Gas Chart */}
                <div className="chart-container">
                    <h3>Gas Trend ({formatTimeRange(timeRange)})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                label={{
                                    value: "%",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 10,
                                }}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.toFixed(0)}
                                domain={[0, 100]}
                            />

                            {/* Reference Lines for Gas/Gas */}
                            <ReferenceLine
                                y={GAS_LEVELS.GOOD}
                                stroke="#4caf50"
                                strokeWidth={1}
                                label={{
                                    value: "Good",
                                    position: "insideBottomLeft",
                                    fill: "#4caf50",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={GAS_LEVELS.MODERATE}
                                stroke="#ff9800"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                                label={{
                                    value: "Moderate",
                                    position: "insideLeft",
                                    fill: "#ff9800",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={GAS_LEVELS.UNHEALTHY_SENSITIVE}
                                stroke="#ff5722"
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                                label={{
                                    value: "Unhealthy (Sensitive)",
                                    position: "insideLeft",
                                    fill: "#ff5722",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={GAS_LEVELS.UNHEALTHY}
                                stroke="#ff4444"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Unhealthy",
                                    position: "insideTopLeft",
                                    fill: "#ff4444",
                                    fontSize: 10,
                                }}
                            />
                            <ReferenceLine
                                y={GAS_LEVELS.VERY_UNHEALTHY}
                                stroke="#8b0000"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Very Unhealthy",
                                    position: "insideTopRight",
                                    fill: "#8b0000",
                                    fontSize: 10,
                                }}
                            />

                            <Tooltip
                                formatter={(value: number | undefined) =>
                                    value !== undefined
                                        ? [`${value.toFixed(0)}%`, "Gas"]
                                        : ["--", "Gas"]
                                }
                                labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="gas"
                                stroke="#00cc88"
                                fill="#00cc88"
                                fillOpacity={0.3}
                                strokeWidth={2}
                                name="Gas"
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                                connectNulls={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="chart-legend">
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#4caf50" }}
                            ></div>
                            <span>Good (0-50%)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#ff9800" }}
                            ></div>
                            <span>Moderate (51-100)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#ff5722" }}
                            ></div>
                            <span>Unhealthy (101-150)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#ff4444" }}
                            ></div>
                            <span>Very Unhealthy (151-200)</span>
                        </div>
                        <div className="legend-item">
                            <div
                                className="legend-color"
                                style={{ backgroundColor: "#8b0000" }}
                            ></div>
                            <span>Hazardous (&gt;200)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="refresh-section">
                <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="refresh-button"
                >
                    {isLoading ? "Updating..." : "🔄 Refresh Now"}
                </button>
                <p className="refresh-note">
                    Auto-refreshing every 5 seconds • Showing last {timeRange}{" "}
                    minutes of data
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
