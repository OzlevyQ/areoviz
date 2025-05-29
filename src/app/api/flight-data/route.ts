// src/app/api/flight-data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { FlightRecordModel, AnomalyModel, SystemConnectionModel } from '@/models/FlightRecord';
import { mockFlightData, systemConnections } from '@/data/mockFlightData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    const flightPhase = searchParams.get('flightPhase');
    const type = searchParams.get('type') || 'flight'; // 'flight' or 'anomaly'

    if (type === 'anomaly') {
      const severity = searchParams.get('severity');
      const status = searchParams.get('status');
      
      const query: any = {};
      if (severity) query.severity = severity;
      if (status) query.status = status;

      const anomalies = await AnomalyModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        anomalies,
        total: anomalies.length
      });
    }

    // Build query for flight records
    const query: any = {};
    if (flightPhase) {
      query.FlightPhase_FW56211 = parseInt(flightPhase);
    }

    // Get flight records
    const flightRecords = await FlightRecordModel
      .find(query)
      .sort({ DateTime: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // If no records in DB, initialize with mock data
    if (flightRecords.length === 0) {
      console.log('Initializing database with mock data...');
      await FlightRecordModel.insertMany(mockFlightData);
      await SystemConnectionModel.insertMany(systemConnections);
      
      // Return mock data for now
      return NextResponse.json({
        success: true,
        records: mockFlightData.slice(skip, skip + limit),
        total: mockFlightData.length,
        connections: systemConnections
      });
    }

    // Get system connections
    const connections = await SystemConnectionModel.find({}).lean();

    // Get total count for pagination
    const total = await FlightRecordModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      records: flightRecords,
      total,
      connections
    });
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flight data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate the flight record
    if (!body.DateTime || !body.TimeTag) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new flight record
    const newRecord = new FlightRecordModel(body);
    await newRecord.save();

    return NextResponse.json({
      success: true,
      record: newRecord,
      message: 'Flight record created successfully'
    });
  } catch (error) {
    console.error('Error creating flight record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create flight record' },
      { status: 500 }
    );
  }
}
