// components/chat/ChatParticipants.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Crown, MoreVertical, UserPlus, VolumeX } from "lucide-react";

interface Participant {
    id: number;
    userId: number;
    role: string;
    joinedAt: string;
    isMuted: boolean;
    user: {
        id: number;
        name: string | null;
        email: string;
        image: string | null;
    };
}

interface ChatParticipantsProps {
    participants: Participant[];
    currentUserId: number;
    currentUserRole: string;
    onAddParticipant?: () => void;
    onToggleMute?: (userId: number, isMuted: boolean) => void;
    onChangeRole?: (userId: number, role: string) => void;
    onRemoveParticipant?: (userId: number) => void;
}

export default function ChatParticipants({
                                             participants,
                                             currentUserId,
                                             currentUserRole,
                                             onAddParticipant,
                                             onToggleMute,
                                             onChangeRole,
                                             onRemoveParticipant,
                                         }: ChatParticipantsProps) {
    const sortedParticipants = [...participants].sort((a, b) => {
        // Show admin first, then by join date
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                    </Badge>
                );
            case "moderator":
                return <Badge variant="secondary">Moderator</Badge>;
            default:
                return <Badge variant="outline">Member</Badge>;
        }
    };

    const canManageParticipants = currentUserRole === "admin";

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Participants ({participants.length})</h3>
                    {canManageParticipants && onAddParticipant && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddParticipant}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {sortedParticipants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={participant.user.image || ""} />
                                    <AvatarFallback>
                                        {participant.user.name?.charAt(0) || participant.user.email?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm truncate">
                                            {participant.user.name || participant.user.email}
                                            {participant.user.id === currentUserId && (
                                                <span className="text-muted-foreground text-xs ml-2">(You)</span>
                                            )}
                                        </p>
                                        {getRoleBadge(participant.role)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Joined {new Date(participant.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {canManageParticipants && participant.user.id !== currentUserId && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {onToggleMute && (
                                            <DropdownMenuItem
                                                onClick={() => onToggleMute(participant.user.id, !participant.isMuted)}
                                            >
                                                <VolumeX className="h-4 w-4 mr-2" />
                                                {participant.isMuted ? "Unmute" : "Mute"}
                                            </DropdownMenuItem>
                                        )}

                                        {participant.role !== "admin" && onChangeRole && (
                                            <>
                                                <Separator className="my-1" />
                                                <div className="px-2 py-1.5 text-xs font-semibold">
                                                    Change Role
                                                </div>
                                                <DropdownMenuItem
                                                    onClick={() => onChangeRole(participant.user.id, "admin")}
                                                >
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onChangeRole(participant.user.id, "moderator")}
                                                >
                                                    Make Moderator
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onChangeRole(participant.user.id, "member")}
                                                >
                                                    Make Member
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {onRemoveParticipant && (
                                            <>
                                                <Separator className="my-1" />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => onRemoveParticipant(participant.user.id)}
                                                >
                                                    Remove from chat
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}