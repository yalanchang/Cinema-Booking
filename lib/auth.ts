import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  phone?: string; 

}
export async function getCurrentUser(): Promise<UserPayload | null> {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session || !session.user?.email) {
        return null;
      }
  
      // 從資料庫查詢完整的使用者資料
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, name, email, phone FROM users WHERE email = ?',
        [session.user.email]
      );
  
      if (users.length === 0) {
        return null;
      }
  
      const user = users[0];
  
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || null
      };
    } catch (error) {
      console.error('取得使用者錯誤:', error);
      return null;
    }
  }
  
// 加密密碼
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// 驗證密碼
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}


  
