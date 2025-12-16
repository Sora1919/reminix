"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ChatProvider } from "./providers/chat-provider";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ChatProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </ChatProvider>
        </SessionProvider>
    );
}
