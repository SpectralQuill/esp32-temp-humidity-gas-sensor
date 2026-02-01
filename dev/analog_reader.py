# super_simple_serial.py
import serial
import time

print("Trying COM2...")

try:
    # Connect to COM2
    ser = serial.Serial('COM2', 115200, timeout=1)
    print("Connected to COM2!")
    print("Waiting for ESP32 to initialize...")
    
    # Wait for ESP32 boot
    time.sleep(3)
    
    # Send a newline to trigger any startup message
    # ser.write(b'\n')
    
    print("\nReading data (Ctrl+C to stop):")
    print("-" * 40)
    
    # Simple read loop
    while True:
        try:
            # Read one byte at a time
            if ser and ser.is_open and ser.in_waiting > 0:
                try:
                    line = ser.readline().decode('utf-8').rstrip()
                    print("Received:", line)
                except:
                    print(f'stopped', end='')
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f'\nError: {e}')
            break
    time.sleep(1)
            
except serial.SerialException as e:
    print(f"Cannot open COM2: {e}")
    print("\nTry these:")
    print("1. Check Device Manager for COM port number")
    print("2. Make sure Arduino IDE is closed")
    print("3. Unplug/Replug ESP32")
    
finally:
    try:
        ser.close()
    except:
        pass
