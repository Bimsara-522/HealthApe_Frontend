"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  
    const router = useRouter();
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); //stops reloading the page
        // TODO: call login API
        // const response = await fetch("/api/login");
        // const loginSuccess = response.ok;
        const loginSuccess = true; // replace with a real API call
        if (loginSuccess) {
            router.push("/dashboard");
        }
    }; 
    
  return (
    <form onSubmit={handleLogin}>
        <main className="min-h-screen flex items-center justify-center">
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
                            <p className="pb-1">Sign Up</p>
                            <p className="text-blue-600 border-b-2 border-blue-600 pb-1">
                                Sign In
                            </p>
                        </div>
                    
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-sm text-blue-600 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="johndoe@gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="block text-sm text-blue-600 mb-1">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <label>
                            <input type="checkbox"/> Remember Me
                        </label>

                        {/* Button */}
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-full font-medium shadow-md hover:bg-blue-600 cursor-pointer">
                        Sign In
                        </button>

                        <p className="text-center text-sm text-blue-600 mt-4">
                            <Link href="/auth/forgot-password">
                                Forgot your password?
                            </Link>
                        </p>
                    </div> 
                </div>
            </div>
        </main>
    </form>
  );
}
