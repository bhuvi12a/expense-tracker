import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function POST(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('expense_tracker');
    const collection = db.collection('expenses');

    const data = await request.json();
    await collection.insertOne({
      ...data,
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

export async function GET() {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('expense_tracker');
    const expenses = await db.collection('expenses')
      .find()
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