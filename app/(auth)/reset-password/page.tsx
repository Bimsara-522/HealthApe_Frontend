"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
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
    } catch (error: any) {
      setCodeVerified(false);
      setErrorMessage(
        error.response?.data?.message || "Invalid or expired reset code."
      );
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
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to reset password."
      );
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
        res.data?.message || "If an account exists for this email, a reset code has been sent."
      );
    } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
            setErrorMessage(error.response?.data?.message ?? "Failed to resend code."
      );
    } 
    }finally {
        setResending(false);    
     }
  ;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the code sent to your email and choose a new password.
        </p>

        <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
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
            <label className="block text-sm text-blue-600 mb-1">Reset Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                placeholder="123456"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em]"
                required
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifying || !email || code.length !== 6}
                className="px-4 py-2 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-60"
              >
                {verifying ? "Checking..." : "Verify"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-blue-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-blue-600 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
            disabled={resetting || !codeVerified}
            className="w-full bg-blue-500 text-white py-2 rounded-full font-medium shadow-md hover:bg-blue-600 disabled:opacity-60"
          >
            {resetting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={resending || !email}
          className="mt-4 w-full border border-blue-200 text-blue-600 py-2 rounded-full font-medium hover:bg-blue-50 disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </main>
  );
}