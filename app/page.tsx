// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative-center px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Real Estate Management System
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect buyers and dealers in a streamlined real estate marketplace. Find your dream home or list your properties with ease.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login?type=buyer"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Login as Buyer
              </Link>
              <Link
                href="/login?type=dealer"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Login as Dealer
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-center gap-x-6">
              <Link
                href="/register?type=buyer"
                className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500"
              >
                Register as Buyer <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/register?type=dealer"
                className="text-sm font-semibold leading-6 text-green-600 hover:text-green-500"
              >
                Register as Dealer <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}