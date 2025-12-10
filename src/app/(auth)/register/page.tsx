"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { User, Mail, Lock } from "lucide-react";
import {toast} from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                }),
            });

            if (!res.ok) {
                toast.error("Registration failed.");
            } else {
                // Auto-login after registration
                const signInRes = await fetch("/api/auth/callback/credentials", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: form.email,
                        password: form.password,
                    }),
                });

                if (signInRes.ok) {
                    toast.success("Registration successful");
                    router.push("/dashboard");
                    router.refresh();
                }
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

            {/* Left Section */}
            <div className="bg-green-600 text-white flex flex-col justify-center items-center p-10">
                <h1 className="text-4xl font-bold mb-4">Join REMINIX</h1>
                <p className="text-lg opacity-90 text-center max-w-md">
                    Create your account and streamline event planning with your team.
                </p>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Register</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                            <div>
                                <Label>Name</Label>
                                <div className="relative">
                                    <User className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Your Name"
                                        className="pl-8"
                                        value={form.name}
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-8"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm({ ...form, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <Label>Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-8"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                                {/* Confirm Password */}
                                <div>
                                    <Label>Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-8"
                                            value={form.confirmPassword}
                                            onChange={(e) =>
                                                setForm({ ...form, confirmPassword: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                            {error && <p className="text-red-500">{error}</p>}

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Creating account..." : "Register"}
                            </Button>

                            <p className="text-center text-sm mt-2">
                                Already have an account?{" "}
                                <span
                                    className="text-green-600 cursor-pointer underline"
                                    onClick={() => router.push("/login")}
                                >
                                  Login
                                </span>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
