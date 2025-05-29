import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Anomaly from '@/models/Anomaly';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity');
    const flightNumber = searchParams.get('flightNumber');
    
    const query: any = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (flightNumber) query.flightNumber = flightNumber;
    
    const anomalies = await Anomaly
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: anomalies,
      count: anomalies.length 
    });
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const anomaly = await Anomaly.create(body);
    
    return NextResponse.json({ 
      success: true, 
      data: anomaly 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating anomaly:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create anomaly' },
      { status: 500 }
    );
  }
} 