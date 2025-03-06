import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function PUT(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const { salary } = await request.json();
    
    const db = client.db('expense_tracker');
    await db.collection('settings').updateOne(
      { type: 'salary' },
      { $set: { amount: salary } },
      { upsert: true }
    );

    await client.close();
    
    return NextResponse.json({ success: true, salary });
  } catch (error) {
    console.error('Salary update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update salary' },
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
    const setting = await db.collection('settings').findOne({ type: 'salary' });

    await client.close();
    
    return NextResponse.json({ 
      success: true, 
      salary: setting?.amount || 20000 // Default salary if not set
    });
  } catch (error) {
    console.error('Salary fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch salary' },
      { status: 500 }
    );
  }
} 