import { User } from "@/lib/types";

export const useSignup = (user: User) => {
  const BACKEND_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  if (!BACKEND_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
};
