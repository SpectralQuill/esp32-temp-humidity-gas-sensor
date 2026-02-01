import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const PORT_NAME = 'COM2';
const BAUD_RATE = 115200;

console.log(`Starting Serial Logger for ${PORT_NAME} at ${BAUD_RATE} baud`);
console.log('Press Ctrl+C to exit\n');

// Create the serial port connection
const port = new SerialPort({
  path: PORT_NAME,
  baudRate: BAUD_RATE,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
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
