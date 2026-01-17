'use client';

import HealthDashboard from './components/health/HealthDashboard';

export default function Home() {
  return (
    <main className="min-h-screen px-6 sm:px-8 lg:px-12 pt-32 pb-20">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-[#c8c8c8] text-5xl sm:text-6xl mb-4 font-normal">Health Dashboard</h1>
        <p className="text-[#969696] text-base mb-12">
          My Apple Watch health data.
        </p>

        <HealthDashboard />
      </div>
    </main>
  );
}

