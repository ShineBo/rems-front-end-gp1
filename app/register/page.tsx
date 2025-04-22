// /app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [userType, setUserType] = useState<"buyer" | "dealer">("buyer");
  const [formData, setFormData] = useState({
    buyerName: "",
    businessName: "",
    licenseNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    profilePhoto: null as string | null,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const { registerBuyer, registerDealer, error, loading, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
  }, [user, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check if passwords match when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        setPasswordsMatch(value === formData.confirmPassword);
      } else {
        setPasswordsMatch(formData.password === value);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePhoto: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) return;
  
    if (userType === "buyer") {
      await registerBuyer({
        buyerName: formData.buyerName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        profilePhoto: formData.profilePhoto,
      });
    } else {
      await registerDealer({
        businessName: formData.businessName,
        licenseNumber: formData.licenseNumber,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        profilePhoto: formData.profilePhoto,
      });
    }
  
    // If registration is successful, redirect to login
    if (!error) {
      router.push(`/login?type=${userType}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {userType === "buyer" ? (
                <div>
                  <label
                    htmlFor="buyerName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="buyerName"
                      name="buyerName"
                      type="text"
                      required
                      value={formData.buyerName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="businessName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Business Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="licenseNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      License Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        required
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                      />
                    </div>
                  </div>
                </>
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
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
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
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="block text-sm font-medium text-blue-700"
                  >{showPassword ? "Hide Password" : "Show Password"}</button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800 ${
                      !passwordsMatch && formData.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {!passwordsMatch && formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="profilePhoto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profile Photo (optional)
                </label>
                <div className="mt-1">
                  <input
                    id="profilePhoto"
                    name="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-800"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !passwordsMatch}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href={`/login?type=${userType}`}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}