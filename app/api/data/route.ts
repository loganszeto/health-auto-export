import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Simple in-memory cache for recent responses
const CACHE_TTL_MS = 60_000; // 60 seconds

let cachedResponse: {
  timestamp: number;
  days: number;
  payload: {
    success: boolean;
    count: number;
    data: Array<{
      timestamp: Date;
      metrics: any;
      createdAt: Date;
    }>;
  };
} | null = null;

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

    // Serve from cache when available and fresh
    const now = Date.now();
    if (
      cachedResponse &&
      cachedResponse.days === days &&
      now - cachedResponse.timestamp < CACHE_TTL_MS
    ) {
      return NextResponse.json(cachedResponse.payload, {
        headers: corsHeaders,
      });
    }

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

    const payload = {
      success: true,
      count: data.length,
      data: data.map(item => ({
        timestamp: item.timestamp,
        metrics: item.metrics,
        createdAt: item.createdAt
      }))
    };

    // Store in cache
    cachedResponse = {
      timestamp: now,
      days,
      payload,
    };

    return NextResponse.json(
      payload,
      {
        headers: corsHeaders,
      }
    );
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

