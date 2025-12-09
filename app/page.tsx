'use client';

import HealthDashboard from './components/health/HealthDashboard';

export default function Home() {
  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 pt-10">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-[#e6c384] text-4xl sm:text-5xl mb-6">Health Dashboard</h1>
        <p className="text-gray-400 text-base sm:text-lg mb-8">
          My Apple Watch health data.
        </p>

        <div className="bg-[#1f1f28] border border-[#363646] rounded-lg p-8">
          <h2 className="text-[#e6c384] text-2xl mb-6">Dashboard</h2>
          <HealthDashboard />
        </div>
      </div>
    </main>
  );
}

