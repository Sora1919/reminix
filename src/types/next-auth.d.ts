import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string | null;
            email: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}
