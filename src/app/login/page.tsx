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

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    async function handleLogin(values: any) {
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
            });

            if (res?.error) {
                toast("Login failed",{
                    description: "Invalid email or password.",
                    action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                    },
                });
                return;
            }

            toast("Login successful",{
                description: "Redirecting...",
            });

            router.push("/dashboard");

        } catch (err) {
            toast("Error",{
                description: "Unexpected error occurred.",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            });
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

            {/* Left Section */}
            <div className="bg-blue-600 text-white flex flex-col justify-center items-center p-10">
                <h1 className="text-4xl font-bold mb-4">Welcome to REMINIX</h1>
                <p className="text-lg opacity-90 text-center max-w-md">
                    Plan events, manage tasks, collaborate with your team — all in one place.
                </p>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Login</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">

                            {/* Email */}
                            <div>
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-8"
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
                                    <Lock className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-8"
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                Login
                            </Button>

                            <p className="text-center text-sm mt-2">
                                Don’t have an account?{" "}
                                <span
                                    className="text-blue-600 cursor-pointer underline"
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
