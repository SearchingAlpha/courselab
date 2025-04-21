// app/api/waitlist/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingUser = await prisma.waitlist.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: true, message: 'You\'re already on our waitlist!' },
        { status: 200 }
      );
    }
    
    // Add email to waitlist
    await prisma.waitlist.create({
      data: { email }
    });
    
    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist!' },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Waitlist submission error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}