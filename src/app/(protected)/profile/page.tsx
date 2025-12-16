"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [name, setName] = useState(session?.user?.name || "");
    const [image, setImage] = useState(session?.user?.image || "");
    const [saving, setSaving] = useState(false);

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

            // TODO: connect this to /api/profile later
            await new Promise((r) => setTimeout(r, 1000));

            alert("Profile updated (mock)");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    }


    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your personal information
                    </p>
                </div>
                <ThemeToggle />
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={image || undefined} />
                            <AvatarFallback>
                                <User className="h-8 w-8" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <Label>Profile Image URL</Label>
                            <Input
                                placeholder="https://example.com/avatar.png"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Name */}
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={session.user?.email || ""} disabled />
                    </div>

                    {/* Created At */}
                    <div className="text-sm text-muted-foreground">
                        Account created on{" "}
                        {new Date().toLocaleDateString()}
                    </div>

                    <Separator />

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
