"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { toast } from "react-hot-toast";

export default function Profile() {
  const { user, loading, updateUserInfo } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    licenseNumber: "",
    profilePhoto: null as string | null,
  });
  const [initialData, setInitialData] = useState({} as any);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  useEffect(() => {
    // First check if auth is done loading
    if (!loading) {
      // If not logged in, redirect
      if (!user) {
        router.push("/login");
        return;
      }

      // If we have a user, fetch their details
      if (user) {
        fetchUserDetails();
      }
    }
  }, [user, loading, router]);

  const fetchUserDetails = async () => {
    setPageLoading(true);
    try {
      const endpoint = user.role === "buyer" ? `/buyer/${user.id}` : `/dealer/${user.id}`;
      const response = await api.get(endpoint);
      const userData = response.data;
  
      // Improved and simpler handling of profile photo data
      let photoData = null;
      
      // If there's a profile photo in the response
      if (userData.profilePhoto) {
        // If it's already a string (URL or Base64), use it directly
        if (typeof userData.profilePhoto === "string") {
          photoData = userData.profilePhoto;
        } 
        // If it's a Buffer or Array data
        else if (userData.profilePhoto.data) {
          try {
            // Convert to Base64
            let base64String;
            
            // If it's an array of numbers
            if (Array.isArray(userData.profilePhoto.data)) {
              const uint8Array = new Uint8Array(userData.profilePhoto.data);
              const blob = new Blob([uint8Array], { type: 'image/jpeg' });
              base64String = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            } 
            // If it's already encoded somehow
            else if (typeof userData.profilePhoto.data === 'string') {
              // Check if it's already a base64 string
              if (userData.profilePhoto.data.startsWith('data:image')) {
                base64String = userData.profilePhoto.data;
              } else {
                // Try to convert to base64
                base64String = `data:image/jpeg;base64,${btoa(userData.profilePhoto.data)}`;
              }
            }
            
            photoData = base64String;
          } catch (err) {
            console.error("Error processing profile photo:", err);
            // Fallback to null if conversion fails
            photoData = null;
          }
        }
      }
  
      // Initialize profile data with fetched user data
      const updatedProfileData = {
        name: user.role === "buyer" ? userData.buyerName : userData.businessName,
        email: userData.email,
        phoneNumber: userData.phoneNumber || "",
        businessName: user.role === "dealer" ? userData.businessName : "",
        licenseNumber: user.role === "dealer" ? userData.licenseNumber : "",
        profilePhoto: photoData,
      };
  
      setProfileData(updatedProfileData);
      setInitialData(updatedProfileData);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load profile information");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileData({
        ...profileData,
        profilePhoto: URL.createObjectURL(e.target.files[0]),
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const payload: any = {};
  
      // Handle name update
      if (user.role === "buyer") {
        if (profileData.name !== initialData.name) {
          payload.buyerName = profileData.name;
        }
      } else {
        if (profileData.name !== initialData.name) {
          payload.businessName = profileData.name;
        }
        if (profileData.licenseNumber !== initialData.licenseNumber) {
          payload.licenseNumber = profileData.licenseNumber;
        }
      }
  
      // Handle phone number - ONLY include it if it has changed
      // This avoids triggering the "already in use" check on the backend
      if (profileData.phoneNumber !== initialData.phoneNumber) {
        if (profileData.phoneNumber && /^\d+$/.test(profileData.phoneNumber)) {
          payload.phoneNumber = profileData.phoneNumber;
        } else {
          toast.error("Phone number must contain only numbers");
          setIsSubmitting(false);
          return;
        }
      }
  
      // Handle profile photo
      if (profileImageFile) {
        // Convert the file to base64 for API submission
        const base64String = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Split to get just the base64 part without the MIME prefix
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(profileImageFile);
        });
        
        payload.profilePhoto = base64String;
      }
  
      // Only proceed if there's something meaningful to update
      if (Object.keys(payload).length === 0) {
        toast("No changes to update");
        setIsSubmitting(false);
        setIsEditing(false);
        return;
      }
  
      const endpoint = user.role === "buyer" ? `/buyer/${user.id}` : `/dealer/${user.id}`;
      await api.patch(endpoint, payload);
  
      if (profileData.name !== initialData.name) {
        updateUserInfo({ ...user, name: profileData.name });
      }
  
      toast.success("Profile updated successfully");
      setIsEditing(false);
      
      // Clean up any object URLs to prevent memory leaks
      if (profileImageFile && profileData.profilePhoto?.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profilePhoto);
      }
      
      // Reset the file state
      setProfileImageFile(null);
      
      // Refetch user details to get the updated profile
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (profileData.profilePhoto?.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profilePhoto);
      }
    };
  }, []);

  // Show loading while auth or page data is loading
  if (loading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Personal Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your personal details and profile settings.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="border-t border-gray-200">
                {isEditing ? (
                  <form
                    onSubmit={handleSubmit}
                    className="divide-y divide-gray-200"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            {user.role === "buyer"
                              ? "Full Name"
                              : "Business Name"}
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={profileData.email}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Email cannot be changed.
                          </p>
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>

                        {user.role === "dealer" && (
                          <div className="col-span-6 sm:col-span-3">
                            <label
                              htmlFor="licenseNumber"
                              className="block text-sm font-medium text-gray-700"
                            >
                              License Number
                            </label>
                            <input
                              type="text"
                              name="licenseNumber"
                              id="licenseNumber"
                              value={profileData.licenseNumber}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        )}

                        <div className="col-span-6">
                          <label className="block text-sm font-medium text-gray-700">
                            Profile Photo
                          </label>
                          <div className="mt-1 flex items-center">
                            {profileData.profilePhoto ? (
                              <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                <img
                                  src={profileData.profilePhoto}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                />
                              </span>
                            ) : (
                              <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                <svg
                                  className="h-full w-full text-gray-300"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </span>
                            )}
                            <input
                              type="file"
                              name="profilePhoto"
                              id="profilePhoto"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={() => {
                          // Cleanup any created object URLs
                          if (profileImageFile && profileData.profilePhoto?.startsWith('blob:')) {
                            URL.revokeObjectURL(profileData.profilePhoto);
                          }
                          setProfileImageFile(null);
                          setProfileData(initialData);
                          setIsEditing(false);
                        }}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        {user.role === "buyer" ? "Full name" : "Business name"}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profileData.name || "Not provided"}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Account type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                        {user.role}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profileData.email}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Phone number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profileData.phoneNumber || "Not provided"}
                      </dd>
                    </div>
                    {user.role === "dealer" && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          License number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {profileData.licenseNumber || "Not provided"}
                        </dd>
                      </div>
                    )}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Account ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.id}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Profile photo
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profileData.profilePhoto ? (
                          <img
                            src={profileData.profilePhoto}
                            alt="Profile"
                            className="h-20 w-20 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500">
                            No profile photo
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}