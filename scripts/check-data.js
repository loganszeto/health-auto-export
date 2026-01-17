/**
 * Script to check what data is actually in MongoDB
 * Run with: node scripts/check-data.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Error: MONGODB_URI not found');
  process.exit(1);
}

async function checkData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db('health-sync');
    const collection = db.collection('health-data');
    
    // Get most recent document
    const doc = await collection.findOne({}, { sort: { timestamp: -1 } });
    
    if (!doc) {
      console.log('No data found.');
      return;
    }
    
    console.log('=== Most Recent Export ===\n');
    console.log(`Timestamp: ${doc.timestamp}`);
    console.log(`Metrics count: ${doc.metrics?.length || 0}\n`);
    
    if (doc.metrics && doc.metrics.length > 0) {
      console.log('=== Metric Names ===\n');
      doc.metrics.forEach((metric, i) => {
        console.log(`${i + 1}. "${metric.name}" (${metric.units})`);
        console.log(`   Data points: ${metric.data?.length || 0}`);
        if (metric.data && metric.data.length > 0) {
          // Show data for 2026-01-16 specifically
          const jan16 = metric.data.filter(d => d.date && d.date.includes('2026-01-16'));
          if (jan16.length > 0) {
            console.log(`   Jan 16 values: ${jan16.map(d => d.qty).join(', ')}`);
          }
          // Show first and last
          const first = metric.data[0];
          const last = metric.data[metric.data.length - 1];
          console.log(`   First: ${first.date} = ${first.qty}`);
          if (metric.data.length > 1) {
            console.log(`   Last: ${last.date} = ${last.qty}`);
          }
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkData();
