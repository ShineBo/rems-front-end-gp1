// /app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import BuyerDashboard from '@/app/components/BuyerDashboard';
import DealerDashboard from '@/app/components/DealerDashboard';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only redirect if loading is complete AND we're sure there's no user
    if (!loading) {
      setIsInitialized(true);
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading while auth is initializing
  if (loading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // Don't render if no user (while redirecting)
  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">REMS System</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {user.role === 'buyer' ? (
              <BuyerDashboard />
            ) : (
              <DealerDashboard dealerID={user.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}