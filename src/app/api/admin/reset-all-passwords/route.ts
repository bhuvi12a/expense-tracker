import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { Resend } from 'resend';
import crypto from 'crypto';

const uri = process.env.MONGODB_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY;

export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const adminKey = request.headers.get('admin-key');
    if (adminKey !== ADMIN_KEY) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('expense_tracker');
    const users = await db.collection('users').find({}).toArray();
    const resend = new Resend(RESEND_API_KEY);

    for (const user of users) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            resetToken,
            resetTokenExpiry: new Date(Date.now() + 3600000)
          }
        }
      );

      await resend.emails.send({
        from: 'Expense Tracker <onboarding@resend.dev>',
        to: user.email,
        subject: 'Password Reset Required',
        html: `
          <h1>Password Reset Required</h1>
          <p>Your password needs to be reset. Click the link below to set a new password.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}">
            Reset Password
          </a>
        `
      });
    }

    await client.close();
    return NextResponse.json({ 
      success: true, 
      message: `Reset emails sent to ${users.length} users` 
    });

  } catch (error) {
    console.error('Mass password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process mass password reset' },
      { status: 500 }
    );
  }
} 