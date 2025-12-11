import serial
import asyncio
import websockets
import re

SERIAL_PORT = 'COM4'  # Adjust for your system
BAUD_RATE = 115200

async def serial_to_websocket(websocket):
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    #print(f"Connected to serial port: {SERIAL_PORT}")

    try:
        while True:
            # Read from serial and send to WebSocket
            if ser.in_waiting > 0:
                 data = ser.readline().decode('utf-8').strip()
                 if not data:
                     continue
                 s = data.strip()
                 # Split on any whitespace (handles multiple spaces/tabs)
                 parts = [p for p in re.split(r'\s+', s) if p != '']
                 if len(parts) >= 3:
                     # Validate tokens like '1G' or '-1G' or plain numbers
                     ok = True
                     for p in parts[:3]:
                         tok = p.strip()
                         if tok.endswith('G') or tok.endswith('g'):
                             tok = tok[:-1]
                         try:
                             int(tok)
                         except Exception:
                             try:
                                 float(tok)
                             except Exception:
                                 ok = False
                                 break
                     if ok:
                         # Forward the original whitespace-formatted string unchanged
                         sent = s
                         print("Received gravity tokens -> forwarding:", repr(sent))
                         await websocket.send(sent)
                         print(f"Sent to P5.js: {sent}")
                     else:
                         print(f"Ignored serial line (invalid tokens): {data}")
                 else:
                     print(f"Ignored serial line (not 3 whitespace-separated values): {data}")

            # Receive from WebSocket and send to serial
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.1)
                ser.write(message.encode('utf-8'))
                print(f"Received from P5.js and sent to serial: {message}")
            except asyncio.TimeoutError:
                pass # No message received from WebSocket

            await asyncio.sleep(0.01) # Small delay to prevent busy-waiting

    except websockets.exceptions.ConnectionClosedOK:
        print("P5.js client disconnected.")
    finally:
        ser.close()
        print("Serial port closed.")

async def main():
    print(f"connecting to WebSocket server")
    async with websockets.serve(serial_to_websocket, "localhost", 8080):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())