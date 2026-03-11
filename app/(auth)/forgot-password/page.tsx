"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await api.post("/auth/forgot-password", { email });

      setSuccessMessage(
        res.data?.message || "If an account exists for this email, a reset code has been sent."
      );

      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1200);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to send reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we’ll send you a reset code.
        </p>

        <form onSubmit={handleSendCode} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-blue-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="johndoe@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      </div>
    </main>
  );
}