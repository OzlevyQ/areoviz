import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!sessionId && !userId) {
      return NextResponse.json(
        { success: false, error: 'sessionId or userId is required' },
        { status: 400 }
      );
    }
    
    const query: any = {};
    if (sessionId) query.sessionId = sessionId;
    if (userId) query.userId = userId;
    
    const messages = await ChatMessage
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: messages.reverse(), // Return in chronological order
      count: messages.length 
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Generate sessionId if not provided
    if (!body.sessionId) {
      body.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const message = await ChatMessage.create(body);
    
    return NextResponse.json({ 
      success: true, 
      data: message 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create chat message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }
    
    const result = await ChatMessage.deleteMany({ sessionId });
    
    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting chat messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat messages' },
      { status: 500 }
    );
  }
} 