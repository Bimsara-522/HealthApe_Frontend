"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api/api";
import axios from "axios";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resending, setResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  const handleVerifyCode = async () => {
    try {
      setVerifying(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.post("/auth/verify-reset-code", { email, code });

      setCodeVerified(true);
      setSuccessMessage(res.data?.message || "Reset code verified.");
    } catch (error: unknown) {
      setCodeVerified(false);
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Invalid or expired reset code."
        );
      } else {
        setErrorMessage("Unexpected error.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setResetting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });

      setSuccessMessage(res.data?.message || "Password reset successfully.");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to reset password."
        );
      } else {
        setErrorMessage("Unexpected error.");
      }
    } finally {
      setResetting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.post("/auth/forgot-password", { email });

      setSuccessMessage(
        res.data?.message ||
          "If an account exists for this email, a reset code has been sent."
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? "Failed to resend code."
        );
      } else {
        setErrorMessage("Unexpected error.");
      }
    } finally {
      setResending(false);
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
              Set a New Password
            </h1>
            <p className="text-blue-100 text-base xl:text-lg mb-8">
              Verify your reset code, choose a strong new password, and get back
              into your account.
            </p>

            <Image
              src="/signup img.png"
              alt="Reset password illustration"
              className="rounded-2xl object-cover drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              width={700}
              height={700}
              priority
            />

          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 md:px-10 lg:px-14 xl:px-16 bg-white">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <p className="text-sm font-semibold text-[#0F52BA] uppercase tracking-wider mb-2">
                HealthApe
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Reset Password
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Verify your code and create a new password.
              </p>
            </div>

            <div className="hidden lg:block mb-8">
              <p className="text-sm font-semibold text-[#0F52BA] uppercase tracking-wider mb-2">
                HealthApe
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Reset Password
              </h2>
              <p className="text-gray-500 mt-2">
                Enter the code sent to your email and choose a new password.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  Reset Code
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="flex-1 px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifying || !email || code.length !== 6}
                    className="px-4 py-3 rounded-xl border border-blue-200 text-[#0F52BA] font-medium hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {verifying ? "Checking..." : "Verify"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0F52BA] mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:border-[#0F52BA] transition"
                  required
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={resetting || !codeVerified}
                className="w-full bg-[#0F52BA] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#0A3D91] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetting ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending || !email}
              className="mt-4 w-full border border-blue-200 text-[#0F52BA] py-3 rounded-xl font-medium hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>

            <p className="text-center text-sm text-gray-600 pt-5">
              Back to{" "}
              <Link
                href="/login"
                className="text-[#0F52BA] font-semibold hover:text-[#0A3D91]"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}