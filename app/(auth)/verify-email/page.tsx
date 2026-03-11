"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.post("/auth/verify-email", { email, code });

      setSuccessMessage(res.data?.message || "Email verified successfully.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.post("/auth/resend-verification-code", { email });

      setSuccessMessage(res.data?.message || "Verification code sent.");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to resend code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the 6-digit code sent to your email.
        </p>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-blue-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-blue-600 mb-1">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em]"
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-full font-medium shadow-md hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email}
          className="mt-4 w-full border border-blue-200 text-blue-600 py-2 rounded-full font-medium hover:bg-blue-50 disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </main>
  );
}