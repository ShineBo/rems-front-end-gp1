// /app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">REMS System</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-6">
                {user.role === 'buyer' ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Buyer Dashboard</h2>
                    <p>Welcome to the buyer interface. Here you'll be able to:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Browse available properties</li>
                      <li>Contact dealers</li>
                      <li>Manage your favorites</li>
                      <li>Track your inquiries</li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Dealer Dashboard</h2>
                    <p>Welcome to the dealer interface. Here you'll be able to:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Manage your property listings</li>
                      <li>View and respond to inquiries</li>
                      <li>Track performance metrics</li>
                      <li>Update your business profile</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}