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

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            Cookies.set("token", res.data.token, { expires: 7 });
            Cookies.set("user", JSON.stringify(res.data.user), { expires: 7 });
            if (res.data.user.role === "admin") {
                router.push("/dashboard");
            } else {
                router.push("/payment");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Login failed");
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-purple-900/10 blur-[100px] pointer-events-none" />

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
                    <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-md text-sm text-center">{error}</div>}
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-300">Password</Label>
                                <Link href="#" className="text-sm text-purple-400 hover:text-purple-300">
                                    Forgot password?
                                </Link>
                            </div>
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
                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                        <div className="text-center text-sm text-gray-400">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="text-purple-400 hover:text-purple-300">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
