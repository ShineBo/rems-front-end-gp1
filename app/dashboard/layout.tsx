// src/app/dashboard/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Profile', href: '/dashboard/profile', current: pathname === '/dashboard/profile' },
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      <div className="min-h-full">
        <div className="bg-blue-600 pb-32">
          <nav className="bg-blue-600 border-b border-blue-300 border-opacity-25 lg:border-none">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
              <div className="relative h-16 flex items-center justify-between lg:border-b lg:border-blue-400 lg:border-opacity-25">
                <div className="px-2 flex items-center lg:px-0">
                  <div className="flex-shrink-0">
                    <Link href="/" className="text-xl font-bold text-white">REMS</Link>
                  </div>
                  <div className="hidden lg:block lg:ml-10">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={
                            item.current
                              ? 'bg-blue-700 text-white rounded-md py-2 px-3 text-sm font-medium'
                              : 'text-white hover:bg-blue-500 hover:bg-opacity-75 rounded-md py-2 px-3 text-sm font-medium'
                          }
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-2 flex justify-end lg:ml-6 lg:justify-end">
                  <div className="flex items-center">
                    {/* Profile dropdown */}
                    <div className="ml-3 relative flex items-center">
                      <div className="flex items-center">
                        <span className="text-white mr-2">{user.name}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex lg:hidden">
                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="bg-blue-600 p-2 rounded-md inline-flex items-center justify-center text-blue-200 hover:text-white hover:bg-blue-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
                    aria-controls="mobile-menu"
                    aria-expanded="false"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <span className="sr-only">Open main menu</span>
                    {mobileMenuOpen ? (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg
                        className="block h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden" id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={
                        item.current
                          ? 'bg-blue-700 text-white block rounded-md py-2 px-3 text-base font-medium'
                          : 'text-white hover:bg-blue-500 hover:bg-opacity-75 block rounded-md py-2 px-3 text-base font-medium'
                      }
                      aria-current={item.current ? 'page' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
          <header className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-white">
                {pathname === '/dashboard' ? 'Dashboard' : 
                 pathname === '/dashboard/profile' ? 'Profile' : 'REMS'}
              </h1>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}