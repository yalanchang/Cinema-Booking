import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      phone?: string;
      provider?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    phone?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    phone?: string;
    provider?: string;
  }
}