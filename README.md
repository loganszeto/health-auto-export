# Health Auto Export Dashboard

A dashboard visualizing Apple Watch health data including sleep, activity, and recovery metrics.

Inspired by [cleverdevil.io's health data project](https://cleverdevil.io/2021/taking-control-of-my-personal-health-data).

## Overview

This project receives health data from the [Health Auto Export](https://www.healthyapps.dev/) app and displays it in a beautiful dashboard with Activity Rings, charts, and historical metrics.

## Features

- 📊 Activity Rings visualization (similar to Apple Watch)
- 📈 Historical health metrics with min/max/average
- 💤 Sleep analysis and patterns
- ❤️ Heart rate trends
- 🏃 Active energy and calories
- 📱 Mobile-responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Health Auto Export App

1. Download [Health Auto Export](https://www.healthyapps.dev/) on your iPhone
2. Set up API Export to send data to your endpoint:
   - Endpoint URL: `https://your-domain.com/api/sync`
   - Format: JSON
   - Configure sync frequency (daily recommended)

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## API Endpoint

The `/api/sync` endpoint receives POST requests from Health Auto Export with the following structure:

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

## Architecture

Based on the cleverdevil.io implementation, this project can be extended to:

- Store data in a database (MongoDB, PostgreSQL) or S3
- Use AWS Glue/Athena for querying (as shown in the reference)
- Implement caching for performance
- Add monthly summaries and historical comparisons

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization

## References

- [Taking Control of my Personal Health Data](https://cleverdevil.io/2021/taking-control-of-my-personal-health-data) - Original implementation
- [Health Auto Export Documentation](https://www.healthyapps.dev/blog/how-to-connect-to-apple-health-server)

## License

MIT
