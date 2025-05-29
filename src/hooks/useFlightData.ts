import { useState, useEffect } from 'react';
import { FlightRecord } from '@/types/aviation';

export function useFlightData(limit: number = 100) {
  const [data, setData] = useState<FlightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/flight-records?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flight records');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform MongoDB documents to FlightRecord format
          const records = result.data.map((doc: any) => ({
            id: doc._id,
            flightNumber: doc.flightNumber,
            timestamp: new Date(doc.timestamp),
            aircraft: doc.aircraft,
            altitude: doc.altitude,
            speed: doc.speed,
            heading: doc.heading,
            latitude: doc.latitude,
            longitude: doc.longitude,
            status: doc.status,
            verticalSpeed: doc.verticalSpeed,
            groundSpeed: doc.groundSpeed,
            systems: doc.systems
          }));
          
          setData(records);
        }
      } catch (err) {
        console.error('Error fetching flight data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, [limit]);

  const addFlightRecord = async (record: Omit<FlightRecord, 'id'>) => {
    try {
      const response = await fetch('/api/flight-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create flight record');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const newRecord = {
          id: result.data._id,
          ...record,
          timestamp: new Date(record.timestamp),
        };
        
        setData(prev => [newRecord, ...prev].slice(0, limit));
      }
    } catch (err) {
      console.error('Error adding flight record:', err);
      throw err;
    }
  };

  return { data, loading, error, addFlightRecord };
} 