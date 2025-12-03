# Deploy Health Auto Export to Vercel

## Quick Setup (5 minutes)

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import the `health-auto-export` repository
5. Vercel will auto-detect Next.js settings

### Step 2: Add Environment Variable

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production, Preview, Development (select all)
3. Click **Save**

### Step 3: Deploy

1. Click **Deploy**
2. Wait for deployment to complete (usually 1-2 minutes)
3. Your site will be live at: `https://health-auto-export.vercel.app` (or a custom name)

### Step 4: Get Your API Endpoint URL

After deployment, your API endpoint will be:
- `https://health-auto-export.vercel.app/api/sync`

Or if you set a custom domain:
- `https://your-custom-domain.com/api/sync`

## Configure Health Auto Export App

1. Open Health Auto Export app on iPhone
2. Go to **Settings** → **API Export**
3. Enable **API Export**
4. Set **Endpoint URL** to: `https://health-auto-export.vercel.app/api/sync`
5. Set **Format** to: **JSON**
6. Set **Sync Frequency** to: **Daily**
7. Tap **Test Connection** to verify
8. Tap **Sync Now** to send data

## Update Main Website

After deployment, update the link in your main website:

1. Edit `/Users/loganszeto/Projects/loganszeto/lib/projectsData.ts`
2. Update `liveUrl` to your Vercel URL:
   ```typescript
   liveUrl: 'https://health-auto-export.vercel.app'
   ```

## Custom Domain (Optional)

If you want a custom domain:

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `health.loganszeto.com`)
3. Follow DNS setup instructions
4. Update Health Auto Export endpoint URL

## Free Tier Limits

Vercel's free tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (API routes)
- ✅ Custom domains
- ✅ Automatic HTTPS

Perfect for personal projects!

## Testing

After deployment, test the API:
```bash
curl https://health-auto-export.vercel.app/api/sync
```

You should get:
```json
{
  "status": "ok",
  "message": "Health Auto Export API is running",
  "endpoint": "/api/sync"
}
```

If you get that, the API is working! 🎉

