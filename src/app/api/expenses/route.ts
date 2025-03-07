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
    const expenses = await db.collection('expenses')
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .toArray();

    await client.close();

    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const data = await request.json();
    
    await db.collection('expenses').insertOne({
      ...data,
      userId: new ObjectId(userId),
      createdAt: new Date(),
    });

    await client.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add expense' },
      { status: 500 }
    );
  }
} 