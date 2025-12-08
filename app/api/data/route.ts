import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Get all health data (for processing historical metrics)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '365'); // Default to 1 year

    const { db } = await connectToDatabase();
    const collection = db.collection('health-data');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all data within date range (sorted by most recent first)
    const data = await collection
      .find({
        timestamp: { $gte: startDate }
      })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      count: data.length,
      data: data.map(item => ({
        timestamp: item.timestamp,
        metrics: item.metrics,
        createdAt: item.createdAt
      }))
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health data' },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

