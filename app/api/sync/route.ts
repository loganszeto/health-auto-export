import { NextRequest, NextResponse } from 'next/server';

// This endpoint receives data from Health Auto Export app
// Based on: https://cleverdevil.io/2021/taking-control-of-my-personal-health-data
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the received data (in production, you'd store this in a database or S3)
    console.log('Received health data:', JSON.stringify(data, null, 2));
    
    // TODO: Store data in database (MongoDB, PostgreSQL, or S3 like cleverdevil.io)
    // For now, we'll just acknowledge receipt
    
    return NextResponse.json({ 
      success: true, 
      message: 'Health data received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing health data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process health data' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Health Auto Export API is running',
    endpoint: '/api/sync'
  });
}

