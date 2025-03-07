import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

export async function POST(request: Request) {
  try {
    if (!uri) {
      throw new Error('MongoDB URI is not defined');
    }

    const { username, email, password } = await request.json();

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('expense_tracker');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await users.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    });

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
} 