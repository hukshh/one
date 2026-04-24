import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export default {
  providers: [
    GitHub,
    Google,
    Credentials({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      // Note: authorize will be implemented in the main auth.ts 
      // because it needs database access which is not edge-compatible
    })
  ],
} satisfies NextAuthConfig
