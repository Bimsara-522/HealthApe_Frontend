"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "@/lib/api/client";
import axios from "axios";

type SignUpForm = {
  fullName: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<SignUpForm>();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (data: SignUpForm) => {
    try {
      setLoading(true);
      setShowError(false);

      const res = await api.post("/auth/signup", data);

      setMessage(res.data?.message || "Account created successfully!");
      setShowSuccess(true);

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 1200);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message ?? "Registration failed.");
      } else {
        setErrorMessage("Unexpected error.");
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EAF3FF] via-white to-[#DCEBFF] px-3 py-3 sm:px-4 sm:py-4 flex items-center justify-center">
      <div className="w-full max-w-7xl min-h-[100dvh] sm:min-h-[95vh] rounded-none sm:rounded-3xl overflow-hidden shadow-none sm:shadow-2xl border-0 sm:border sm:border-blue-100 bg-white grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side */}
        <div className="relative hidden lg:flex items-center justify-center bg-[#0F52BA] p-10 xl:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F52BA] via-[#1565D8] to-[#0A3D91]" />

          <div className="relative z-10 flex flex-col items-center text-center text-white max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
              Join HealthApe
            </h1>
            <p className="text-blue-100 text-base xl:text-lg mb-8">
              Create your account to manage your healthcare journey with ease,
              security, and confidence.
            </p>

            <Image
              src="/signup img.jpg"
              alt="Register illustration"
              className="rounded-2xl shadow-2xl object-cover w-full max-w-md h-auto"
              width={700}
              height={700}
              priority
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:px-14 xl:px-16 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden mb-8 text-center">
              <p className="text-sm font-semibold text-[#0F52BA] uppercase tracking-wider mb-2">
                HealthApe
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Create Account
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Start your healthcare journey with confidence.
              </p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block mb-8">
              <p className="text-sm font-semibold text-[#0F52BA] uppercase tracking-wider mb-2">
                HealthApe
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2">
                Enter your details to get started.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 mb-8 text-sm font-medium border-b border-gray-200">
              <p className="pb-3 text-[#0F52BA] border-b-2 border-[#0F52BA]">
                Sign Up
              </p>
              <Link
                href="/login"
                className="pb-3 text-gray-400 hover:text-[#0F52BA] transition"
              >
                Sign In
              </Link>
            </div>

            <form onSubmit={handleSubmit(handleSignUp)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  Full Name
                </label>
                <input
                  {...register("fullName", { required: true })}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  Email
                </label>
                <input
                  {...register("email", { required: true })}
                  type="email"
                  placeholder="johndoe@gmail.com"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  Password
                </label>
                <input
                  {...register("password", { required: true })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                />
              </div>

              <p className="text-sm text-gray-500 leading-6">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#0F52BA] font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#0F52BA] font-medium">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F52BA] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#0A3D91] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>

              <p className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#0F52BA] font-semibold hover:text-[#0A3D91]"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {showError && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] sm:w-[520px] max-w-[520px]">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-white shadow-xl px-4 py-4">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600 font-bold">
              !
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Sign up failed</p>
              <p className="text-sm text-gray-600">{errorMessage}</p>
            </div>

            <button
              onClick={() => setShowError(false)}
              className="ml-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#0F52BA] hover:bg-blue-50 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] sm:w-[520px] max-w-[520px]">
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-white shadow-xl px-4 py-4">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-600 font-bold">
              ✓
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{message}</p>
              <p className="text-sm text-gray-600">
                Redirecting to verification...
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}