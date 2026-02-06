"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, User, Camera , Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name ?? "");
            setImage(session.user.image ?? "");
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.push("/login");
        return null;
    }

    async function handleSave() {
        try {
            setSaving(true);

            setMessage(null);
            setError(null);

            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, image }),
            });

            if (!res.ok) {
                const payload = (await res.json()) as { error?: string };
                throw new Error(payload.error ?? "Unable to update profile.");
            }

            await update({ name, image });
            setMessage("Profile updated successfully.");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error ? err.message : "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your personal information and appearance.
                    </p>
                </div>
                <ThemeToggle />
            </div>

            <div className="rounded-2xl border bg-linear-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-2 border-white shadow">
                                <AvatarImage src={image || undefined} />
                                <AvatarFallback>
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 rounded-full bg-background p-1 shadow">
                                <Camera className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">
                                {session?.user?.name || "Your name"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {session?.user?.email ?? "email@example.com"}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push("/calendar")}>
                            View Calendar
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="shadow-sm bg-background">
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={session?.user?.email || ""}
                                disabled
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Profile image URL</Label>
                            <Input
                                id="image"
                                placeholder="https://example.com/avatar.png"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </div>

                        {message ? (
                            <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/80 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                                {message}
                            </div>
                        ) : null}

                        {error ? (
                            <div className="rounded-lg border border-rose-200/70 bg-rose-50/80 px-4 py-2 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
                                {error}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card className="shadow-sm bg-background">
                    <CardHeader>
                        <CardTitle>Account Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="rounded-lg border bg-background p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Status
                            </p>
                            <p className="mt-2 text-base font-semibold text-foreground">
                                Active member
                            </p>
                        </div>
                        <div className="rounded-lg border bg-background p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Signed in as
                            </p>
                            <p className="mt-2 break-all text-base font-semibold text-foreground">
                                {session?.user?.email ?? "email@example.com"}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            Keep your name and photo up to date so collaborators
                            recognize you instantly.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
