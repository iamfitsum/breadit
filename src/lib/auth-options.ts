import { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { nanoid } from "nanoid";

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.picture === "string") session.user.image = token.picture;
        if (typeof (token as any).username === "string") session.user.username = (token as any).username;
      }

      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({ where: { email: token.email as string } });
      if (!dbUser) {
        if (user) {
          (token as any).id = (user as any).id as string;
        }
        return token;
      }
      if (!dbUser.username) {
        await db.user.update({
          where: { id: dbUser.id },
          data: { username: nanoid(10) },
        });
      }

      return {
        id: dbUser.id,
        name: dbUser.name ?? undefined,
        email: dbUser.email ?? undefined,
        picture: dbUser.image ?? undefined,
        username: dbUser.username ?? undefined,
      } as any;
    },
    redirect() {
      return "/";
    },
  },
};

