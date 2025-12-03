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

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    async function handleRegister(values: any) {
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                body: JSON.stringify(values),
            });

            const data = await res.json();

            if (!res.ok) {
                toast("Registration failed",{
                    description: data.error || "Something went wrong",
                    action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                    },
                });
                return;
            }

            toast("Account created!",{
                description: "You can now log in.",
            });

            //Redirect to login
            router.push("/login");

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
                        <form onSubmit={handleRegister} className="space-y-4">

                            {/* Name */}
                            <div>
                                <Label>Name</Label>
                                <div className="relative">
                                    <User className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Your Name"
                                        className="pl-8"
                                        onChange={(e) =>
                                            setForm({ ...form, name: e.target.value })
                                        }
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
                                Create Account
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
