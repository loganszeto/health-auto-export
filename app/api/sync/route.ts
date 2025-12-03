import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { HealthDataPayload } from '@/lib/models/HealthData';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// This endpoint receives data from Health Auto Export app
export async function POST(request: NextRequest) {
  try {
    let payload: HealthDataPayload;
    
    try {
      payload = await request.json();
    } catch (e) {
      const body = await request.text();
      if (!body || body.trim() === '') {
        return NextResponse.json(
          { success: false, error: 'Empty request body' },
          { 
            status: 400,
            headers: corsHeaders
          }
        );
      }
      payload = JSON.parse(body);
    }
    
    if (!payload.data || !payload.data.metrics) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('health-data');

    // Store the health data
    const document = {
      timestamp: new Date(),
      metrics: payload.data.metrics,
      createdAt: new Date(),
    };

    await collection.insertOne(document);
    
    console.log(`Stored health data with ${payload.data.metrics.length} metrics`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Health data received and stored',
      timestamp: new Date().toISOString(),
      metricsCount: payload.data.metrics.length
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error processing health data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process health data' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Health Auto Export API is running',
    endpoint: '/api/sync'
  }, {
    headers: corsHeaders
  });
}

