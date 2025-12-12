// components/event/EventCollaborators.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Loader2, User, Shield, Edit } from "lucide-react";
import { toast } from "sonner";

interface Collaborator {
    id: number;
    userId: number;
    role: string;
    user: {
        id: number;
        name: string | null;
        email: string;
        image: string | null;
    };
}

interface EventCollaboratorsProps {
    eventId: number;
    currentUserId: number;
    isCreator: boolean;
}

export default function EventCollaborators({
                                               eventId,
                                               currentUserId,
                                               isCreator
                                           }: EventCollaboratorsProps) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("editor");
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    // Load collaborators
    async function loadCollaborators() {
        try {
            setLoading(true);
            const res = await fetch(`/api/events/${eventId}/collaborators`);
            if (res.ok) {
                const data = await res.json();
                setCollaborators(data);
            } else {
                toast.error("Failed to load collaborators");
            }
        } catch (error) {
            toast.error("Failed to load collaborators");
        } finally {
            setLoading(false);
        }
    }

    // Add collaborator
    async function handleAddCollaborator() {
        if (!email || !email.includes('@')) {
            toast.error("Please enter a valid email");
            return;
        }

        try {
            setAdding(true);
            const res = await fetch(`/api/events/${eventId}/collaborators/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            });

            if (res.ok) {
                const newCollaborator = await res.json();
                setCollaborators(prev => [...prev, newCollaborator]);
                setEmail("");
                setRole("editor");
                toast.success("Collaborator added successfully");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to add collaborator");
            }
        } catch (error) {
            toast.error("Failed to add collaborator");
        } finally {
            setAdding(false);
        }
    }

    // Remove collaborator
    async function handleRemoveCollaborator(userId: number) {
        if (!confirm("Are you sure you want to remove this collaborator?")) {
            return;
        }

        try {
            const res = await fetch(`/api/events/${eventId}/collaborators/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                setCollaborators(prev => prev.filter(c => c.userId !== userId));
                toast.success("Collaborator removed");
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || "Failed to remove collaborator");
            }
        } catch (error) {
            toast.error("Failed to remove collaborator");
        }
    }

    // Update role
    async function handleUpdateRole(userId: number, newRole: string) {
        try {
            const res = await fetch(`/api/events/${eventId}/collaborators/update-role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            });

            if (res.ok) {
                setCollaborators(prev =>
                    prev.map(c =>
                        c.userId === userId ? { ...c, role: newRole } : c
                    )
                );
                toast.success("Role updated");
            } else {
                toast.error("Failed to update role");
            }
        } catch (error) {
            toast.error("Failed to update role");
        }
    }

    useEffect(() => {
        loadCollaborators();
    }, [eventId]);

    // For non-creators, just show the list
    if (!isCreator) {
        return (
            <div className="border rounded-lg p-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Collaborators</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : collaborators.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No collaborators yet</p>
                ) : (
                    <ul className="space-y-3">
                        {collaborators.map((collaborator) => (
                            <li key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {collaborator.user.image ? (
                                        <img
                                            src={collaborator.user.image}
                                            alt={collaborator.user.name || "User"}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-lg font-semibold text-white">
                                                {(collaborator.user.name || collaborator.user.email).charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{collaborator.user.name || collaborator.user.email}</p>
                                        <p className="text-sm text-gray-500">{collaborator.user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        collaborator.role === 'editor'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {collaborator.role}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    // For creators - full management
    return (
        <div className="border rounded-lg p-6 mt-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Manage Collaborators</h2>
            </div>

            {/* Add Collaborator Form */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-3 text-blue-800">Add New Collaborator</h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">User Email</label>
                        <Input
                            type="email"
                            placeholder="Enter user's email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="viewer">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Viewer (can only view)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="editor">
                                    <div className="flex items-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        <span>Editor (can edit)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleAddCollaborator}
                        disabled={adding || !email}
                        className="w-full"
                    >
                        {adding ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Adding...
                            </>
                        ) : "Add Collaborator"}
                    </Button>
                </div>
            </div>

            {/* Current Collaborators */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Current Collaborators</h3>
                    <span className="text-sm text-gray-500">
                        {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : collaborators.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No collaborators yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add someone to collaborate on this event</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {collaborators.map((collaborator) => (
                            <div
                                key={collaborator.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        {collaborator.user.image ? (
                                            <img
                                                src={collaborator.user.image}
                                                alt={collaborator.user.name || "User"}
                                                className="w-12 h-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                <span className="text-lg font-semibold text-white">
                                                    {(collaborator.user.name || collaborator.user.email).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {collaborator.role === 'editor' && (
                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                                                <Edit className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{collaborator.user.name || "No name"}</p>
                                        <p className="text-sm text-gray-500">{collaborator.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Select
                                        value={collaborator.role}
                                        onValueChange={(newRole) => handleUpdateRole(collaborator.userId, newRole)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveCollaborator(collaborator.userId)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}