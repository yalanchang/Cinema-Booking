// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | number;
      email: string;
      name?: string | null;
      image?: string | null;
      phone?: string | null;
      gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
      birthdate?: string | null;
      address?: string | null;
      city?: string | null;
      district?: string | null;
      zipCode?: string | null;
      emergencyContact?: string | null;
      emergencyPhone?: string | null;
      preferredLanguage?: 'zh-TW' | 'zh-CN' | 'en';
      newsletter?: boolean;
      smsNotification?: boolean;
      provider?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string | number;
    phone?: string | null;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    birthdate?: string | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
    zipCode?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    preferredLanguage?: 'zh-TW' | 'zh-CN' | 'en';
    newsletter?: boolean;
    smsNotification?: boolean;
    provider?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string | number;
    phone?: string | null;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
    birthdate?: string | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
    zipCode?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    preferredLanguage?: 'zh-TW' | 'zh-CN' | 'en';
    newsletter?: boolean;
    smsNotification?: boolean;
    provider?: string | null;
  }
}