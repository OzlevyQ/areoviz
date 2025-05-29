import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import { FlightRecordModel } from '@/models/FlightRecord';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await FlightRecordModel.find({ 
      authorEmail: session.user.email 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      records 
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const record = await FlightRecordModel.create({
      ...body,
      authorEmail: session.user.email,
      authorName: session.user.name
    });

    return NextResponse.json({ 
      success: true, 
      record 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create record" },
      { status: 500 }
    );
  }
} 