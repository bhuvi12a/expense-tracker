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
      type: 'otherIncome' 
    });

    await client.close();
    
    return NextResponse.json({ 
      success: true, 
      otherIncome: setting?.amount || 0
    });
  } catch (error) {
    console.error('Other income fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch other income' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const { otherIncome } = await request.json();
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
        type: 'otherIncome'
      },
      {
        $set: {
          amount: otherIncome,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Other income update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update other income' },
      { status: 500 }
    );
  }
} 