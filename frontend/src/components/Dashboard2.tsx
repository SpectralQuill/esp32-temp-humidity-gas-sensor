import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import '../style/Dashboard.css';

const API_BASE_URL = 'http://localhost:3000';

interface LatestReadings {
  temperatureC?: {
    createdAt: string;
    readingType: string;
    value: number;
  };
  humidity?: {
    createdAt: string;
    readingType: string;
    value: number;
  };
  gas?: {
    createdAt: string;
    readingType: string;
    value: number;
  };
}

interface ChartDataPoint {
  time: string;
  temperatureC: number | null;
  humidity: number | null;
  gas: number | null;
}

const Dashboard: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [latestValues, setLatestValues] = useState<LatestReadings>({});
  const [timeRange, setTimeRange] = useState<number>(30); // minutes
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Fetch initial data and set up polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate time range
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeRange * 60000);
      
      // Fetch latest readings for current values
      const latestRes = await axios.get(`${API_BASE_URL}/api/readings/latest`);
      latestRes.data.humidity.value *= 100;
      latestRes.data.gas.value *= 100;
      setLatestValues(latestRes.data);
      
      // Fetch historical data for charts
      const [tempRes, humidityRes, gasRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/readings/temperature`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }),
        axios.get(`${API_BASE_URL}/api/readings/humidity`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }),
        axios.get(`${API_BASE_URL}/api/readings/gas`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      ]);

      // Process and multiply humidity and gas values by 100
      const processReadings = (readings: DBSensorReading[], multiplyBy100: boolean) => {
        return readings.map(reading => ({
          ...reading,
          value: multiplyBy100 ? reading.value * 100 : reading.value
        }));
      };

      // Process temperature data and add boundary points
      const processedTempData = addBoundaryPoints(
        tempRes.data,
        'temperature_c',
        startDate,
        endDate
      );

      // Process humidity data and add boundary points
      const processedHumidityData = addBoundaryPoints(
        processReadings(humidityRes.data, true),
        'humidity',
        startDate,
        endDate
      );

      // Process gas data and add boundary points
      const processedGasData = addBoundaryPoints(
        processReadings(gasRes.data, true),
        'gas',
        startDate,
        endDate
      );

      // Merge data for charts with processed values
      const mergedData = mergeSensorData(
        processedTempData,
        processedHumidityData,
        processedGasData
      );
      
      setChartData(mergedData);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add boundary points to each reading type
  const addBoundaryPoints = (
    readings: DBSensorReading[],
    readingType: SensorReadingType,
    startDate: Date,
    endDate: Date
  ): DBSensorReading[] => {
    if (readings.length === 0) return readings;

    // Sort readings by time (oldest first)
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Get earliest and latest values
    const earliestValue = sortedReadings[0].value;
    const latestValue = sortedReadings[sortedReadings.length - 1].value;

    // Create boundary points
    const startPoint: DBSensorReading = {
      createdAt: startDate.toISOString(),
      readingType: readingType,
      value: earliestValue
    };

    const endPoint: DBSensorReading = {
      createdAt: endDate.toISOString(),
      readingType: readingType,
      value: latestValue
    };

    // Return original readings with boundary points
    return [startPoint, ...sortedReadings, endPoint];
  };

  const mergeSensorData = (
    temperatureCData: DBSensorReading[],
    humidityData: DBSensorReading[],
    gasData: DBSensorReading[]
  ): ChartDataPoint[] => {
    const timeMap = new Map<string, ChartDataPoint>();
    
    // Process temperature data
    temperatureCData.forEach(reading => {
      const time = new Date(reading.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      if (!timeMap.has(time)) {
        timeMap.set(time, { time, temperatureC: null, humidity: null, gas: null });
      }
      timeMap.get(time)!.temperatureC = reading.value;
    });
    
    // Process humidity data
    humidityData.forEach(reading => {
      const time = new Date(reading.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      if (!timeMap.has(time)) {
        timeMap.set(time, { time, temperatureC: null, humidity: null, gas: null });
      }
      timeMap.get(time)!.humidity = reading.value;
    });
    
    // Process gas data
    gasData.forEach(reading => {
      const time = new Date(reading.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      if (!timeMap.has(time)) {
        timeMap.set(time, { time, temperatureC: null, humidity: null, gas: null });
      }
      timeMap.get(time)!.gas = reading.value;
    });
    
    // Sort by time
    return Array.from(timeMap.values())
      .sort((a, b) => new Date(`1970-01-01T${a.time}`).getTime() - new Date(`1970-01-01T${b.time}`).getTime());
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

  return (
    <div className="dashboard">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-indicator">
          <div className={`status-dot ${isLoading ? 'loading' : 'active'}`}></div>
          <span>{isLoading ? 'Updating...' : 'Connected'}</span>
        </div>
        <div className="time-range-selector">
          <span>Time Range:</span>
          <select 
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
        <div className="last-update">
          Last update: {lastUpdate}
        </div>
      </div>

      {/* Current Values Cards */}
      <div className="current-values">
        <div className="value-card temperature">
          <h3>🌡️ Temperature</h3>
          <div className="value">
            {latestValues.temperatureC ? 
              `${latestValues.temperatureC.value.toFixed(1)}°C` : 
              '--'
            }
          </div>
          <div className="timestamp">
            {latestValues.temperatureC ? 
              new Date(latestValues.temperatureC.createdAt).toLocaleTimeString() : 
              'No data'
            }
          </div>
        </div>
        
        <div className="value-card humidity">
          <h3>💧 Humidity</h3>
          <div className="value">
            {latestValues.humidity ? 
              `${(latestValues.humidity.value).toFixed(0)}%` : 
              '--'
            }
          </div>
          <div className="timestamp">
            {latestValues.humidity ? 
              new Date(latestValues.humidity.createdAt).toLocaleTimeString() : 
              'No data'
            }
          </div>
        </div>
        
        <div className="value-card gas">
          <h3>🔥 Gas Level</h3>
          <div className="value">
            {latestValues.gas ? 
              `${(latestValues.gas.value).toFixed(0)}%` : 
              '--'
            }
          </div>
          <div className="timestamp">
            {latestValues.gas ? 
              new Date(latestValues.gas.createdAt).toLocaleTimeString() : 
              'No data'
            }
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ 
                  value: '°C', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 10 
                }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)}°C`, 'Temperature'] : ['--', 'Temperature']}
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity Chart */}
        <div className="chart-container">
          <h3>Humidity Trend ({formatTimeRange(timeRange)})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ 
                  value: '%', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 10 
                }}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)}%`, 'Humidity'] : ['--', 'Humidity']}
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gas Chart */}
        <div className="chart-container">
          <h3>Gas Level Trend ({formatTimeRange(timeRange)})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ 
                  value: 'Level', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 10 
                }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)}`, 'Gas Level'] : ['--', 'Gas Level']}
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
                name="Gas Level"
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Combined Chart */}
      <div className="combined-chart">
        <h3>All Sensors - Combined View ({formatTimeRange(timeRange)})</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip 
              formatter={(
                value: number | undefined,
                name: string | undefined
              ) => {
                if (name === 'temperatureC') return value !== undefined ? [`${value.toFixed(1)}°C`, 'Temperature'] : ['--', 'Temperature'];
                if (name === 'humidity') return value !== undefined ? [`${value.toFixed(1)}%`, 'Humidity'] : ['--', 'Humidity'];
                return value !== undefined ? [`${value.toFixed(1)}%`, 'Gas'] : ['--', 'Gas'];
              }}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperatureC"
              stroke="#ff7300"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              name="Temperature (°C)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="humidity"
              stroke="#0088ff"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              name="Humidity (%)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="gas"
              stroke="#00cc88"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              name="Gas Level"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Refresh Button */}
      <div className="refresh-section">
        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="refresh-button"
        >
          {isLoading ? 'Updating...' : '🔄 Refresh Now'}
        </button>
        <p className="refresh-note">
          Auto-refreshing every 5 seconds • Showing last {timeRange} minutes of data
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
