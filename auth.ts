import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { AdminUser } from "@/models/AdminUser";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Admin credentials",

      credentials: {
        store: { label: "Store", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const store = String(credentials?.store || "").trim();
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");

        if (!store || !email || !password) return null;

        await connectDB();

        const admin = await AdminUser.findOne({
          email,
          tenantSlug: store,
          active: true,
        }).select("+passwordHash");

        if (!admin) return null;

        const validPassword = await bcrypt.compare(
          password,
          admin.passwordHash
        );

        if (!validPassword) return null;

        return {
          id: String(admin._id),
          name: admin.name || "",
          email: admin.email,
          tenantId: String(admin.tenantId),
          tenantSlug: admin.tenantSlug,
          role: admin.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.tenantId = token.tenantId;
        session.user.tenantSlug = token.tenantSlug;
        session.user.role = token.role;
      }

      return session;
    },
  },
};