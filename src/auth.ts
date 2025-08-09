import NextAuth from "next-auth";
import { authOptions } from "./lib/auth-options";

export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(authOptions);

