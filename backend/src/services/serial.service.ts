import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { TemperatureCService } from './temperature_c.service';
import { HumidityService } from './humidity.service';
import { GasService } from './gas.service';

interface SerialConfig {
  portName: string;
  baudRate: number;
  dataBits?: number;
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
  stopBits?: number;
}

interface ParsedReading {
  temperature?: number;
  humidity?: number;
  gas?: number;
  timestamp: Date;
}

export class SerialService {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private isConnected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor(private config: SerialConfig) {}

  async initialize(): Promise<void> {
    if (this.isConnected) {
      console.log('Serial port already connected');
      return;
    }

    try {
      console.log(`Initializing serial port: ${this.config.portName}`);
      
      this.port = new SerialPort({
        path: process.env.PORT_NAME || "COM2",
        baudRate: parseInt(process.env.BAUD_RATE ?? "115200"),
        dataBits: parseInt(process.env.DATA_BITS ?? "8") as (5 | 6 | 7 | 8 | undefined),
        parity: process.env.PARITY as ('none' | 'even' | 'odd' | 'mark' | 'space' | undefined),
        stopBits: parseInt(process.env.STOP_BITS ?? "1") as (1 | 2 | undefined),
        autoOpen: true
    });

      this.setupEventHandlers();
      
      await this.waitForOpen();
      
      console.log(`✓ Serial port connected: ${this.config.portName}`);
      this.isConnected = true;
      
      // Clear any reconnect interval
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
      
    } catch (error) {
      console.error('Failed to initialize serial port:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.port) return;

    this.port.on('error', (error) => {
      console.error('Serial port error:', error.message);
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.port.on('close', () => {
      console.log('Serial port closed');
      this.isConnected = false;
      this.scheduleReconnect();
    });

    if (this.parser) {
      this.parser.on('data', this.handleIncomingData.bind(this));
    }
  }

  private async waitForOpen(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Port not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Serial port open timeout'));
      }, 5000);

      this.port.once('open', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;

    console.log('Scheduling reconnect in 5 seconds...');
    
    this.reconnectInterval = setInterval(async () => {
      console.log('Attempting to reconnect...');
      try {
        await this.initialize();
      } catch (error) {
        console.error('Reconnect failed:', error);
      }
    }, 5000);
  }

  private async handleIncomingData(data: string): Promise<void> {
    const timestamp = new Date();
    
    try {
      // Parse the incoming data
      const reading = this.parseData(data.trim(), timestamp);
      
      // Log the raw data
      this.logData(data.trim(), timestamp);
      
      // Save to database
      await this.saveReading(reading);
      
    } catch (error) {
      console.error('Error processing serial data:', error);
    }
  }

  private parseData(data: string, timestamp: Date): ParsedReading {
    const reading: ParsedReading = { timestamp };
    
    try {
      // Example format from your ESP32: \{temp_c:25.5,humidity:65.0,gas:42.0\}
      
      // Remove backslashes and parse JSON
      const cleanData = data.replace(/\\/g, '');
      const parsed = JSON.parse(cleanData);
      
      reading.temperature = parseFloat(parsed.temperature_c);
      reading.humidity = parseFloat(parsed.humidity);
      reading.gas = parseFloat(parsed.gas);
      
    } catch (error) {
      // Try alternative parsing for different formats
      const matches = data.match(/\{([^}]+)\}/);
      if (matches) {
        const content = matches[1];
        const pairs = content.split(',').map(pair => pair.trim().split(':'));
        
        pairs.forEach(([key, value]) => {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            if (key.includes('temp')) reading.temperature = numValue;
            else if (key.includes('humidity')) reading.humidity = numValue;
            else if (key.includes('gas')) reading.gas = numValue;
          }
        });
      }
    }
    
    return reading;
  }

  private logData(data: string, timestamp: Date): void {
    const timeStr = timestamp.toISOString().split('T')[1].split('.')[0];
    console.log(`[${timeStr}] ${data}`);
  }

  private async saveReading(reading: ParsedReading): Promise<void> {
    const promises = [];
    
    if (reading.temperature !== undefined) {
      promises.push(TemperatureCService.create(reading.temperature));
    }
    
    if (reading.humidity !== undefined) {
      promises.push(HumidityService.create(reading.humidity));
    }
    
    if (reading.gas !== undefined) {
      promises.push(GasService.create(reading.gas));
    }
    
    try {
      await Promise.all(promises);
      console.log(`Saved readings at ${reading.timestamp.toISOString()}`);
    } catch (error) {
      console.error('Failed to save readings:', error);
    }
  }

  async writeData(data: string): Promise<void> {
    if (!this.isConnected || !this.port) {
      throw new Error('Serial port not connected');
    }
    
    return new Promise((resolve, reject) => {
      this.port!.write(data + '\n', (error) => {
        if (error) {
          reject(error);
        } else {
          this.port!.drain(() => resolve());
        }
      });
    });
  }

  async close(): Promise<void> {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    if (this.port && this.isConnected) {
      return new Promise((resolve) => {
        this.port!.close((error) => {
          if (error) console.error('Error closing port:', error);
          this.isConnected = false;
          resolve();
        });
      });
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      portName: this.config.portName,
      baudRate: this.config.baudRate,
    };
  }
}

// Singleton instance
export const serialService = new SerialService({
  portName: process.env.SERIAL_PORT || '/dev/ttyUSB0',
  baudRate: parseInt(process.env.SERIAL_BAUD_RATE || '115200'),
  dataBits: parseInt(process.env.SERIAL_DATA_BITS || '8') as 5 | 6 | 7 | 8,
  parity: (process.env.SERIAL_PARITY || 'none') as 'none' | 'even' | 'odd' | 'mark' | 'space',
  stopBits: parseInt(process.env.SERIAL_STOP_BITS || '1') as 1 | 2,
});
