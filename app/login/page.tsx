// /app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"buyer" | "dealer">("buyer");
  const { buyerLogin, dealerLogin, error, loading, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push("/dashboard");
    }

    // Check if type is specified in URL
    const type = searchParams.get("type");
    if (type === "buyer" || type === "dealer") {
      setUserType(type);
    }

    const success = searchParams.get("success");
    if (success === "1") {
      setSuccessMessage("Account created successfully! Please log in!");
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === "buyer") {
      await buyerLogin(email, password);
    } else {
      await dealerLogin(email, password);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full mx-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-8">
            <div className="mt-6">
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 border rounded-md ${
                    userType === "buyer"
                      ? "bg-blue-600 text-white border-transparent"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => setUserType("buyer")}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 border rounded-md ${
                    userType === "dealer"
                      ? "bg-blue-600 text-white border-transparent"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => setUserType("dealer")}
                >
                  Dealer
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="block text-sm font-medium text-blue-700"
                    >
                      {showPassword ? "Hide Password" : "Show Password"}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={`/register?type=${userType}`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
