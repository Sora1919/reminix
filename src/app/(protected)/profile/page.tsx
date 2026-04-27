"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Camera, CalendarDays, LogOut, Save } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {ThemeToggle} from "@/components/theme-toggle";

type ProfileDTO = {
    name: string | null;
    email: string;
    image: string | null;
};

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const fileRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [initial, setInitial] = useState<ProfileDTO | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // load profile from API (source of truth)
    useEffect(() => {
        if (status !== "authenticated") return;

        let cancelled = false;

        async function load() {
            try {
                setLoading(true);

                const res = await fetch("/api/profile");
                if (!res.ok) throw new Error("Failed to load profile");

                const data = (await res.json()) as ProfileDTO;
                if (cancelled) return;

                const dto: ProfileDTO = {
                    name: data.name ?? session?.user?.name ?? "",
                    email: data.email ?? session?.user?.email ?? "",
                    image: data.image ?? (session?.user as any)?.image ?? null,
                };

                setInitial(dto);
                setName(dto.name ?? "");
                setEmail(dto.email);
                setImageUrl(dto.image ?? "");
            } catch (e) {
                console.error(e);
                // fallback from session if API fails
                const dto: ProfileDTO = {
                    name: session?.user?.name ?? "",
                    email: session?.user?.email ?? "",
                    image: (session?.user as any)?.image ?? null,
                };
                setInitial(dto);
                setName(dto.name ?? "");
                setEmail(dto.email);
                setImageUrl(dto.image ?? "");
                toast("Could not load profile from server (using session data).");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [status, session?.user]);

    const isDirty = useMemo(() => {
        if (!initial) return false;
        return (name ?? "") !== (initial.name ?? "") || (imageUrl ?? "") !== (initial.image ?? "");
    }, [initial, name, imageUrl]);

    const initials = useMemo(() => {
        const base = (name || email || "U").trim();
        return base.slice(0, 1).toUpperCase();
    }, [name, email]);

    async function handleSave() {
        if (!isDirty) return;
        if (name.trim().length < 2) return toast("Name must be at least 2 characters.");

        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim(), image: imageUrl || null }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast(err?.error ?? "Failed to save changes");
                return;
            }

            const updated = (await res.json()) as ProfileDTO;
            setInitial(updated);
            toast("Profile updated!");
            router.refresh();
        } catch (e) {
            console.error(e);
            toast("Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarPick(file: File) {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast(err?.error ?? "Upload failed");
                return;
            }

            const data = await res.json(); // expects { url }
            setImageUrl(data.url);
            toast("Photo uploaded. Don’t forget to Save Changes.");
        } catch (e) {
            console.error(e);
            toast("Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
                <div className="h-8 w-40 rounded bg-muted" />
                <div className="mt-6 h-24 rounded-xl bg-muted" />
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="h-72 rounded-xl bg-muted lg:col-span-2" />
                    <div className="h-72 rounded-xl bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8 space-y-6">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Profile</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage your personal information and appearance.
                    </p>
                </div>

                <ThemeToggle />
            </div>

            {/* Hero card */}
            <Card className="overflow-hidden border-primary/10">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Left: user */}
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="relative">
                                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                                    <AvatarImage src={imageUrl} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>

                                <button
                                    type="button"
                                    className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted"
                                    onClick={() => fileRef.current?.click()}
                                    aria-label="Change profile photo"
                                    title="Change profile photo"
                                    disabled={uploading}
                                >
                                    <Camera className="h-4 w-4" />
                                </button>

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleAvatarPick(f);
                                        e.currentTarget.value = "";
                                    }}
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-lg font-semibold truncate">{name || "Your name"}</p>
                                <p className="text-sm text-muted-foreground truncate">{email}</p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Badge variant="secondary">Active member</Badge>
                                    {uploading ? <Badge variant="outline">Uploading…</Badge> : null}
                                    {isDirty ? <Badge variant="outline">Unsaved changes</Badge> : null}
                                </div>
                            </div>
                        </div>

                        {/* Right: actions (✅ mobile-safe) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto md:min-w-[420px]">
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => router.push("/calendar")}
                            >
                                <CalendarDays className="h-4 w-4" />
                                View Calendar
                            </Button>

                            <Button
                                className="w-full gap-2"
                                onClick={handleSave}
                                disabled={!isDirty || saving || uploading}
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Details */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            <p className="text-xs text-muted-foreground">
                                This name will show in chats and collaboration.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={email} readOnly disabled />
                            <p className="text-xs text-muted-foreground">
                                Email can’t be changed here (linked to login).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Profile image URL (optional)</Label>
                            <Input
                                id="image"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/avatar.png"
                            />
                            <p className="text-xs text-muted-foreground">
                                You can paste a URL or upload using the camera icon.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl border p-4">
                            <p className="text-xs text-muted-foreground">STATUS</p>
                            <p className="mt-1 font-semibold">Active member</p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-xs text-muted-foreground">SIGNED IN AS</p>
                            <p className="mt-1 font-semibold break-all">{email}</p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Keep your name and photo up to date so collaborators recognize you instantly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}