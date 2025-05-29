import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({ 
      authorEmail: session.user.email 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
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
    const order = await Order.create({
      ...body,
      authorEmail: session.user.email,
      authorName: session.user.name
    });

    return NextResponse.json({ 
      success: true, 
      order 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
} 