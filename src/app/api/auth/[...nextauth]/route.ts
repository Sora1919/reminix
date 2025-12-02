import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
    },

    pages: {
        signIn: "/login",
    },

    providers: [
        CredentialsProvider({
            name: "credentials",

            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            // ⬇ FULLY TYPED AUTHORIZE FUNCTION
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing email or password");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],

    // ⬇ FULLY TYPED JWT CALLBACK
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id; // safe because of type declaration
            }
            return token;
        },

        // ⬇ FULLY TYPED SESSION CALLBACK
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
