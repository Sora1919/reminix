"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Mail, Lock } from "lucide-react";
import {toast} from "sonner";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid email or password");
            } else {
                toast.success("Login successful");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

            {/* Left Section */}
            <div className="relative flex items-center justify-center bg-blue-950 p-6 min-h-[50vh] md:min-h-screen">
                <div className="relative w-full h-full max-w-5xl">
                    <Image
                        src="/login.png"
                        alt="Join Reminix illustration"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>


            {/* Right Section */}
            <div className="flex items-center justify-center p-6 bg-background">
                <Card className="w-full max-w-md shadow-lg bg-background">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Login</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Email */}
                            <div>
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-8"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <Label>Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-8"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500">{error}</p>}

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>

                            <p className="text-center text-sm mt-2">
                                Don’t have an account?{" "}
                                <span
                                    className="text-primary cursor-pointer underline"
                                    onClick={() => router.push("/register")}
                                >
                                  Register
                                </span>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
