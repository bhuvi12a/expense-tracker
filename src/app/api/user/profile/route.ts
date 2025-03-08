import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;

export async function PUT(request: Request) {
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

    const { username, currentPassword, newPassword } = await request.json();

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('expense_tracker');
    const users = db.collection('users');
    
    // Check if username already exists for other users
    const existingUser = await users.findOne({
      _id: { $ne: new ObjectId(userId) },
      username: username
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username already taken' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await users.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // If changing password, verify current password
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update username and password
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            username,
            password: hashedPassword,
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Update username only
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            username,
            updatedAt: new Date()
          }
        }
      );
    }

    await client.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: { username }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 