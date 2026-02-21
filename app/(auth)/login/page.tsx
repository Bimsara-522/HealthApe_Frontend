"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from 'react-hook-form';
import api from "@/lib/api";
import { useState } from "react";
import Link from "next/link";

type signInForm = {
    email: string;
    password: string;
}

export default function LoginPage() {
    const {register, handleSubmit} = useForm<signInForm>();
    const [message, setMessage] = useState('');
    const router = useRouter();
    const handleLogin = async (data: signInForm) => {
        try{
            await api.post('/auth/login', data);
            setMessage('Login successful!');
            setTimeout(() => router.push('/dashboard'), 1500);
        }catch(error: unknown){
            setMessage('Login failed. Please check your credentials and try again.');
        }
    }; 
    return (
        <main className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit(handleLogin)} className="min-h-screen flex items-center justify-center">
                <div className="flex bg-[#0F52BA] rounded-lg p-8 max-w-4xl w-full">
                    <div className="w-1/2 flex items-center justify-center">
                        <Image src="/signup img.jpg" alt="Signup illustration" className="max-w-full h-auto rounded-md" width={600} height={600} />
                    </div>
                    <div className="w-1/2 flex items-center justify-center">
                        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between mb-6 text-sm font-medium text-gray-500">
                                <p className="pb-1">Sign Up</p>
                                <p className="text-blue-600 border-b-2 border-blue-600 pb-1">Sign In</p>
                            </div>
                            {/* ...rest of the form... */}
                        </div>
                    </div>
                </div>
            </form>
        </main>
    );
}
