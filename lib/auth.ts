import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || '123';


export interface UserPayload {
  id: number;
  email: string;
  name: string;
  phone?: string; 

}

// 加密密碼
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 驗證密碼
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// 生成 JWT Token
export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

// 驗證 JWT Token
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }

  
}
export async function getCurrentUser(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value; 
  
    if (!token) {
      return null;
    }
  
    return verifyToken(token);
  }
