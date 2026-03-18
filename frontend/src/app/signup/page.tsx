"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Type } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/api/auth/signup", { name, email, password, phone_number });
            Cookies.set("token", res.data.token, { expires: 7 });
            router.push("/dashboard");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Signup failed");
            } else {
                setError("Signup failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-900/10 blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md bg-gray-900/50 border-white/10 text-white backdrop-blur-xl shrink-0">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                                <Type className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">TypeMotion</span>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-md text-sm text-center">{error}</div>}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                className="bg-black/50 border-white/10 text-white"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number" className="text-gray-300">Phone Number</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder="+1 234 567 890"
                                required
                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                                value={phone_number}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="bg-black/50 border-white/10 text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading ? "Creating account..." : "Sign up"}
                        </Button>
                        <div className="text-center text-sm text-gray-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
