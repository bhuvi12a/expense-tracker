import { NextResponse, type RouteHandler } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;

export const PUT: RouteHandler = async (
  request,
  { params }
) => {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('expense_tracker');
    const data = await request.json();

    // Remove _id from data before updating
    const { _id, ...updateData } = data;
    
    const result = await db.collection('expenses').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: {
        description: updateData.description,
        amount: Number(updateData.amount),
        date: updateData.date
      }}
    );

    await client.close();
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update expense' },
      { status: 500 }
    );
  }
};

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const result = await db.collection('expenses').deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(userId)
    });

    await client.close();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete expense' },
      { status: 500 }
    );
  }
} 