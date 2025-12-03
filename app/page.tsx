'use client';

import HealthDashboard from './components/health/HealthDashboard';

export default function Home() {
  // Get the current URL to show the endpoint
  const apiUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/sync`
    : 'https://your-vercel-url.vercel.app/api/sync';

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-10">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-[#e6c384] text-4xl sm:text-5xl mb-6">Health Auto Export Dashboard</h1>
        <p className="text-gray-400 text-base sm:text-lg mb-8">
          Visualize your Apple Watch health data including sleep, activity, and recovery metrics.
        </p>
        
        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8 mb-8">
          <h2 className="text-[#e6c384] text-2xl mb-4">Setup Instructions</h2>
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <p className="mb-2">1. Configure Health Auto Export app to send data to:</p>
              <code className="bg-[#16161d] border border-[#363646] px-3 py-2 rounded text-[#e6c384] block break-all">
                {apiUrl}
              </code>
              <p className="text-[#7c7c7c] text-xs mt-1">Copy this URL and use it in the Health Auto Export app</p>
            </div>
            <p>2. View your health metrics in the dashboard below</p>
          </div>
        </div>

        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
          <h2 className="text-[#e6c384] text-2xl mb-6">Health Dashboard</h2>
          <HealthDashboard />
        </div>
      </div>
    </main>
  );
}

