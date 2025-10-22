// types/user.ts

// 性別列舉
export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other',
    PreferNotToSay = 'prefer_not_to_say'
  }
  
  // 登入提供者列舉
  export enum Provider {
    Local = 'local',
    Google = 'google',
    Facebook = 'facebook'
  }
  
  // 語言偏好列舉
  export enum PreferredLanguage {
    ZhTW = 'zh-TW',
    ZhCN = 'zh-CN',
    En = 'en'
  }
  
  // 基本使用者介面
  export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    gender?: Gender | null;
    birthdate?: string | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
    zipCode?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    preferredLanguage: PreferredLanguage;
    newsletter: boolean;
    smsNotification: boolean;
    provider: Provider;
    providerId?: string | null;
    avatar?: string | null;
    emailVerified: boolean;
    lastLoginAt?: Date | string | null;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }
  
  // 使用者建立輸入
  export interface CreateUserInput {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    provider?: Provider;
    providerId?: string;
    avatar?: string;
  }
  
  // 使用者更新輸入
  export interface UpdateUserInput {
    name?: string;
    phone?: string;
    gender?: Gender;
    birthdate?: string;
    address?: string;
    city?: string;
    district?: string;
    zipCode?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    preferredLanguage?: PreferredLanguage;
    newsletter?: boolean;
    smsNotification?: boolean;
    avatar?: string;
  }
  
  // 密碼變更輸入
  export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  // 個人資料表單資料
  export interface ProfileFormData extends UpdateUserInput, Partial<ChangePasswordInput> {
    name: string;
  }
  
  // API 回應介面
  export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
  }
  
  // 使用者 Session 擴展
  export interface SessionUser {
    id: string | number;
    email: string;
    name?: string | null;
    image?: string | null;
    phone?: string | null;
    gender?: Gender | null;
    birthdate?: string | null;
    address?: string | null;
    city?: string | null;
    district?: string | null;
    zipCode?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    preferredLanguage?: PreferredLanguage;
    newsletter?: boolean;
    smsNotification?: boolean;
    provider?: Provider;
  }