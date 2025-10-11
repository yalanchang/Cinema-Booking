import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 驗證輸入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '請輸入 Email 和密碼' },
        { status: 400 }
      );
    }

    // 查詢使用者
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Email 或密碼錯誤' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 驗證密碼
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email 或密碼錯誤' },
        { status: 401 }
      );
    }

    // 生成 Token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    // 設定 Cookie
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error: any) {
    console.error('登入錯誤:', error);
    return NextResponse.json(
      { success: false, error: '登入失敗，請稍後再試' },
      { status: 500 }
    );
  }
}