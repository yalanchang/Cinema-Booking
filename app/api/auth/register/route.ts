import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();

    // 驗證輸入
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: '請填寫所有必填欄位' },
        { status: 400 }
      );
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '請輸入有效的Email' },
        { status: 400 }
      );
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密碼至少需要 6 個字元' },
        { status: 400 }
      );
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: '此 Email 已被註冊' },
        { status: 400 }
      );
    }

    // 加密密碼
    const hashedPassword = await hashPassword(password);

    // 建立使用者
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    const userId = result.insertId;

    // 生成 Token
    const token = generateToken({ id: userId, email, name });

    // 設定 Cookie
    const response = NextResponse.json({
      success: true,
      data: { id: userId, name, email }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 天
    });

    return response;

  } catch (error: any) {
    console.error('註冊錯誤:', error);
    return NextResponse.json(
      { success: false, error: '註冊失敗，請聯繫客服' },
      { status: 500 }
    );
  }
}