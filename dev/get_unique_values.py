# simple_collector.py
import serial
import time

print("Simple ESP32 Pin 35 Reader")
print("Press Ctrl+C to stop and save\n")

# Change this to your COM port
PORT = 'COM2'

try:
    # Connect to ESP32
    ser = serial.Serial(PORT, 115200, timeout=1)
    time.sleep(2)
    ser.flushInput()
    
    print(f"Connected to {PORT}")
    print("Collecting data...\n")
    
    # Set to store unique values
    unique_values = set()
    
    try:
        while True:
            if ser.in_waiting:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                
                # Skip non-numeric lines
                if line and line.isdigit():
                    value = int(line)
                    
                    if value not in unique_values:
                        unique_values.add(value)
                        print(f"New: {value} (Total unique: {len(unique_values)})")
    
    except KeyboardInterrupt:
        print(f"\n\nStopped! Found {len(unique_values)} unique values")
        
        # Save to CSV
        if unique_values:
            filename = "unique_analog_reads_pin35.csv"
            with open(filename, 'w') as f:
                f.write("RawAnalogValue\n")
                for val in sorted(unique_values):
                    f.write(f"{val}\n")
            
            print(f"Saved to: {filename}")
            print(f"Range: {min(unique_values)} - {max(unique_values)}")

except Exception as e:
    print(f"Error: {e}")

finally:
    try:
        ser.close()
    except:
        pass