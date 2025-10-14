// app/api/auth/verify-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '缺少驗證 token' },
        { status: 400 }
      );
    }

    const [users] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, email, email_verified, verification_token_expires 
       FROM users 
       WHERE verification_token = ? AND provider = 'local'`,
      [token]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: '無效的驗證連結' },
        { status: 400 }
      );
    }

    const user = users[0];

    if (user.email_verified) {
      return NextResponse.json(
        { success: false, error: '此帳號已經驗證過了' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expires = new Date(user.verification_token_expires);
    
    if (now > expires) {
      return NextResponse.json(
        { success: false, error: '驗證連結已過期' },
        { status: 400 }
      );
    }

    // 更新為已驗證
    await pool.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires = NULL 
       WHERE id = ?`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Email 驗證成功！現在可以登入了。'
    });

  } catch (error) {
    console.error('驗證錯誤:', error);
    return NextResponse.json(
      { success: false, error: '驗證失敗' },
      { status: 500 }
    );
  }
}