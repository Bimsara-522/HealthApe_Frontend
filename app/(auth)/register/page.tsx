"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "@/lib/api/api";

type signUpForm = {
    fullName: string;
    email: string;
    password: string;
}

export default function RegisterPage() {

    const {register, handleSubmit} = useForm<signUpForm>();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const handleSignUp = async (data: signUpForm) => {
    try {
        const res = await api.post('/auth/signup', data);

        setMessage(res.data?.message || 'Account created. Please verify your email.');
        setShowSuccess(true);

        setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        }, 1500);
    } catch (error: any) {
        setErrorMessage(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
        );
        setShowError(true);
    }
    };

  return (
    <main className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleSubmit(handleSignUp)}>
            <div className="flex bg-[#0F52BA] rounded-lg p-8 max-w-4xl w-full">

                {/* Left side – Image */}
                <div className="w-1/2 flex items-center justify-center">
                <Image
                    src="/signup img.jpg"
                    alt="Signup illustration"
                    className="max-w-full h-auto rounded-md"
                    width={600}
                    height={600}
                />
                </div>

                {/* Right side – Signup form */}
                <div className="w-1/2 flex items-center justify-center">
                    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
                        {/* Tabs */}
                        <div className="flex justify-between mb-6 text-sm font-medium text-gray-500">
                            <p className="text-blue-600 border-b-2 border-blue-600 pb-1">
                                Sign Up
                            </p>
                            <p className="pb-1">Sign In</p>
                        </div>
                    
                        {/* Full Name */}
                        <div className="mb-4">
                            <label className="block text-sm text-blue-600 mb-1">Full Name</label>
                            <input
                                {...register('fullName', { required: true })}
                                type="text"
                                placeholder="John Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm text-blue-600 mb-1">Email</label>
                            <input
                                {...register('email', { required: true })}
                                type="email"
                                placeholder="johndoe@gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block text-sm text-blue-600 mb-1">Password</label>
                            <input
                                {...register('password', { required: true })}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Button */}
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-full font-medium shadow-md hover:bg-blue-600 cursor-pointer">
                        Sign Up
                        </button>

                        <p className="text-center text-sm text-blue-600 mt-4">
                            <Link href="/login">
                                I already have an account?
                            </Link>
                        </p>
                    </div> 
                </div>
            </div>
            {/* {message && <p className="mt-4 text-center text-red-600">{message}</p>} */}
        </form>
            {showError && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[520px] max-w-[92vw]">
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white shadow-xl px-4 py-3">
                    {/* icon */}
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600">
                        !
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Sign up failed!</p>
                        <p className="text-sm text-gray-600">{errorMessage}</p>
                    </div>

                    <button
                        onClick={() => setShowError(false)}
                        className="ml-2 rounded-md px-2 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                        OK
                    </button>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[520px] max-w-[92vw] animate-slideDown">
                    <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-white shadow-xl px-4 py-3">

                    {/* Success Icon */}
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-600 font-bold">
                        ✓
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                        {message}
                        </p>
                        <p className="text-sm text-gray-600">
                        Redirecting to Login...
                        </p>
                    </div>

                    {/* <button
                        onClick={() => setShowSuccess(false)}
                        className="ml-2 rounded-md px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition"
                    >
                        OK
                    </button> */}

                    </div>
                </div>
                )}
    </main>
  );
}
