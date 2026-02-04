import { Request, Response } from 'express';
import { serialService } from '../services/serial.service';

export class SerialController {
  static async getStatus(req: Request, res: Response) {
    try {
      const status = serialService.getStatus();
      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting serial status:', error);
      res.status(500).json({ error: 'Failed to get serial status' });
    }
  }

  static async initialize(req: Request, res: Response) {
    try {
      await serialService.initialize();
      const status = serialService.getStatus();
      
      res.json({
        success: true,
        message: 'Serial port initialized successfully',
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error initializing serial port:', error);
      res.status(500).json({ 
        error: 'Failed to initialize serial port',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async writeData(req: Request, res: Response) {
    try {
      const { data } = req.body;
      
      if (!data || typeof data !== 'string') {
        return res.status(400).json({ 
          error: 'Data is required and must be a string' 
        });
      }

      await serialService.writeData(data);
      
      res.json({
        success: true,
        message: 'Data written to serial port',
        data: { sent: data },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error writing to serial port:', error);
      res.status(500).json({ 
        error: 'Failed to write to serial port',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async close(req: Request, res: Response) {
    try {
      await serialService.close();
      
      res.json({
        success: true,
        message: 'Serial port closed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error closing serial port:', error);
      res.status(500).json({ 
        error: 'Failed to close serial port',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async sendCommand(req: Request, res: Response) {
    try {
      const { command, params = [] } = req.body;
      
      if (!command) {
        return res.status(400).json({ 
          error: 'Command is required' 
        });
      }

      // Build command string based on ESP32 protocol
      let commandString = '';
      
      switch (command.toUpperCase()) {
        case 'GET_STATUS':
          commandString = 'STATUS';
          break;
        case 'GET_SENSORS':
          commandString = 'SENSORS';
          break;
        case 'SET_INTERVAL':
          if (params[0]) {
            commandString = `INTERVAL ${params[0]}`;
          } else {
            return res.status(400).json({ error: 'Interval value required' });
          }
          break;
        case 'RESET':
          commandString = 'RESET';
          break;
        case 'CALIBRATE':
          commandString = 'CALIBRATE';
          break;
        default:
          // Custom command
          commandString = command;
          if (params.length > 0) {
            commandString += ' ' + params.join(' ');
          }
      }

      await serialService.writeData(`CMD:${commandString}`);
      
      res.json({
        success: true,
        message: 'Command sent to ESP32',
        data: { command: commandString },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error sending command:', error);
      res.status(500).json({ 
        error: 'Failed to send command',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
