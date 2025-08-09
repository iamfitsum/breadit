import { auth } from "@/auth";
import { authOptions } from "./auth-options";

export { authOptions };

export const getAuthSession = () => auth();
