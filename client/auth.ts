import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./lib/prisma"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Use JWT for easier edge compatibility
  ...authConfig,
  providers: [
    ...authConfig.providers.filter(p => p.id !== 'credentials'),
    // Override Credentials with the database logic
    {
      id: "credentials",
      name: "Development Login",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) return null;
          console.log(`🔐 Attempting login for: ${credentials.email}`);
          
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user) {
            console.log(`🆕 Creating new dev user and private workspace for: ${credentials.email}`);
            
            // Always create a new personal workspace for dev isolation
            const workspace = await prisma.workspace.create({
              data: {
                name: `${(credentials.email as string).split('@')[0]}'s Workspace`,
                slug: `workspace-${Math.random().toString(36).substring(7)}`,
                plan: "free"
              }
            });

            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                fullName: (credentials.email as string).split('@')[0],
                workspaceId: workspace.id,
                role: "owner"
              }
            });
          }

          return user;
        } catch (error: any) {
          console.error("❌ Auth Error:", error.message);
          return null;
        }
      }
    }
  ],
  events: {
    async createUser({ user }) {
      const workspace = await prisma.workspace.create({
        data: {
          name: `${user.name || 'My'}'s Workspace`,
          slug: `workspace-${user.id.substring(0, 8)}`,
          plan: 'free',
        }
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { workspaceId: workspace.id }
      });
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.workspaceId = user.workspaceId;
      }

      // If workspaceId is missing (can happen on first login), fetch it
      if (token.id && !token.workspaceId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { workspaceId: true }
        });
        if (dbUser) {
          token.workspaceId = dbUser.workspaceId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.workspaceId = token.workspaceId;
      }
      return session;
    },
  },
})
