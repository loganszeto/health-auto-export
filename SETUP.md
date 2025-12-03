# Health Auto Export Setup Guide

## Quick Setup Instructions

### 1. Install Health Auto Export App

Download the [Health Auto Export](https://www.healthyapps.dev/) app on your iPhone from the App Store.

### 2. Configure API Export

1. Open the Health Auto Export app on your iPhone
2. Go to **Settings** → **API Export**
3. Enable **API Export**
4. Configure the following:
   - **Endpoint URL**: 
     - For local testing: `http://localhost:3000/api/sync`
     - For production: `https://your-deployed-url.com/api/sync`
   - **Format**: JSON
   - **Sync Frequency**: Daily (recommended)
   - **Time Range**: Last 24 hours (or your preference)

### 3. Start the Development Server

```bash
cd /Users/loganszeto/Projects/health-auto-export
npm install
npm run dev
```

The server will run on `http://localhost:3000`

### 4. Test the Connection

1. Make sure your iPhone and computer are on the same network
2. For local testing, you'll need to use your computer's local IP address instead of `localhost`
   - Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Use: `http://YOUR_IP:3000/api/sync`
3. Trigger a manual sync from the Health Auto Export app
4. Check the server logs to see if data is received

### 5. Deploy for Production

When ready to deploy:

1. Deploy to Vercel, Netlify, or your preferred hosting
2. Update the endpoint URL in Health Auto Export app to your production URL
3. The app will automatically sync data daily

## API Endpoint

The `/api/sync` endpoint accepts POST requests with health data in JSON format from Health Auto Export.

Example request structure:
```json
{
  "data": {
    "metrics": [
      {
        "name": "active_energy",
        "units": "kcal",
        "data": [
          {
            "date": "2025-01-01 00:00:00 -0800",
            "qty": 370.75
          }
        ]
      }
    ]
  }
}
```

## References

- [Health Auto Export Documentation](https://www.healthyapps.dev/blog/how-to-connect-to-apple-health-server)
- [Inspired by cleverdevil.io's implementation](https://cleverdevil.io/2021/taking-control-of-my-personal-health-data)

