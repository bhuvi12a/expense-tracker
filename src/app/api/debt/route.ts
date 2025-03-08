import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('expense_tracker');
    const setting = await db.collection('settings').findOne({ 
      userId: new ObjectId(userId),
      type: 'debt' 
    });

    await client.close();
    
    return NextResponse.json({ 
      success: true, 
      debt: setting?.amount || 0
    });
  } catch (error) {
    console.error('Debt fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch debt' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const { debt } = await request.json();
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('expense_tracker');
    await db.collection('settings').updateOne(
      { 
        userId: new ObjectId(userId),
        type: 'debt'
      },
      {
        $set: {
          amount: debt,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Debt update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update debt' },
      { status: 500 }
    );
  }
} 