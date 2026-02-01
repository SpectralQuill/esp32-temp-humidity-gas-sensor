import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import * as dotenv from 'dotenv';

dotenv.config();
const PORT_NAME = process.env.PORT_NAME;
const BAUD_RATE = process.env.BAUD_RATE ? parseInt(process.env.BAUD_RATE) : undefined;

console.log(`Starting Serial Logger for ${PORT_NAME} at ${BAUD_RATE} baud`);
console.log('Press Ctrl+C to exit\n');

// Create the serial port connection
const port = new SerialPort({
  path: PORT_NAME,
  baudRate: BAUD_RATE,
  dataBits: process.env.DATA_BITS ? parseInt(process.env.DATA_BITS) : undefined,
  parity: process.env.PARITY || 'none',
  stopBits: process.env.STOP_BITS ? parseInt(process.env.STOP_BITS) : undefined,
  autoOpen: true,
});

// Create a parser to read lines
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Handle port opening
port.on('open', () => {
  console.log(`✓ Connected to ${PORT_NAME}`);
  console.log('='.repeat(40));
});

// Handle incoming data
parser.on('data', (data: string) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${data.trim()}`);
});

// Handle errors
port.on('error', (error: Error) => {
  console.error(`✗ Serial port error: ${error.message}`);
});

// Handle port closing
port.on('close', () => {
  console.log('\nPort closed');
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nStopping...');
  port.close();
  process.exit(0);
});
