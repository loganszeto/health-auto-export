export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Health Auto Export Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Visualize your Apple Watch health data including sleep, activity, and recovery metrics.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-gray-300 mb-4">
            This dashboard receives data from the Health Auto Export app. Set up the API endpoint to start syncing your health data.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>1. Configure Health Auto Export app to send data to: <code className="bg-gray-700 px-2 py-1 rounded">/api/sync</code></p>
            <p>2. View your health metrics in the dashboard below</p>
          </div>
        </div>
      </div>
    </main>
  );
}

