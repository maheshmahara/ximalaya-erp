import { useState, useRef, useCallback } from 'react';

export interface SerialScaleState {
  isConnected: boolean;
  liveWeight: number | null;
  unit: string;
  isStable: boolean;
  statusText: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useSerialScale(baudRate: number = 9600): SerialScaleState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveWeight, setLiveWeight] = useState<number | null>(null);
  const [unit, setUnit] = useState<string>('kg');
  const [isStable, setIsStable] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('Serial Scale Disconnected');

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef<boolean>(false);

  const parseWeightFrame = (frame: string) => {
    // Matches common industrial indicators:
    // Format 1: ST,GS,+0065.50kg (ST=Stable, US=Unstable, GS=Gross, NT=Net)
    // Format 2: +  65.50 kg
    const clean = frame.trim();
    if (!clean) return;

    const isStableReading = clean.includes('ST') || !clean.includes('US');
    const numericMatch = clean.match(/([+\-]?\d+(?:\.\d+)?)/);

    if (numericMatch) {
      const val = parseFloat(numericMatch[1]);
      if (!isNaN(val)) {
        setLiveWeight(val);
        setIsStable(isStableReading);
      }
    }
  };

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !(navigator as any).serial) {
      alert('Web Serial API is not supported on this browser. Use Chrome, Edge, or Chromium.');
      return;
    }

    try {
      setStatusText('Requesting Serial Port...');
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate, dataBits: 8, stopBits: 1, parity: 'none' });

      portRef.current = port;
      keepReadingRef.current = true;
      setIsConnected(true);
      setStatusText('Connected (Streaming RS-232)');

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = '';
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/[\r\n]+/);
          buffer = lines.pop() || '';
          for (const line of lines) {
            parseWeightFrame(line);
          }
        }
      }
    } catch (err: any) {
      console.warn('Serial connection failed:', err);
      setStatusText('Connection Closed / Cancelled');
      setIsConnected(false);
    }
  }, [baudRate]);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    if (readerRef.current) {
      await readerRef.current.cancel().catch(() => {});
      readerRef.current = null;
    }
    if (portRef.current) {
      await portRef.current.close().catch(() => {});
      portRef.current = null;
    }
    setIsConnected(false);
    setLiveWeight(null);
    setStatusText('Serial Scale Disconnected');
  }, []);

  return {
    isConnected,
    liveWeight,
    unit,
    isStable,
    statusText,
    connect,
    disconnect,
  };
}
