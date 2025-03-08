import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import { Resend } from 'resend';

const uri = process.env.MONGODB_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: Request) {
  try {
    if (!uri || !RESEND_API_KEY) {
      console.error('Missing env variables:', { uri: !!uri, RESEND_API_KEY: !!RESEND_API_KEY });
      throw new Error('Required environment variables are not defined');
    }

    const { email } = await request.json();
    console.log('Attempting to send email to:', email);
    
    const resend = new Resend(RESEND_API_KEY);

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db('expense_tracker');
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update database first
    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry
        }
      }
    );

    // Send email with complete URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    try {
      const emailResponse = await resend.emails.send({
        from: 'Expense Tracker <onboarding@resend.dev>',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
          <a href="${resetUrl}">Reset Password</a>
        `
      });
      
      console.log('Email sent successfully:', emailResponse);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      throw emailError;
    }

    await client.close();
    return NextResponse.json({ success: true, message: 'Password reset email sent' });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send reset email' },
      { status: 500 }
    );
  }
}