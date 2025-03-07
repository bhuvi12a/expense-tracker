import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    // Get user ID from the request URL
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
      type: 'salary' 
    });

    await client.close();
    
    return NextResponse.json({ 
      success: true, 
      salary: setting?.amount || 0 // Default salary is 0
    });
  } catch (error) {
    console.error('Salary fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch salary' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const { salary } = await request.json();
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
        type: 'salary'
      },
      {
        $set: {
          amount: salary,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Salary update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update salary' },
      { status: 500 }
    );
  }
} 