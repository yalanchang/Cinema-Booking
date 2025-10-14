import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 建立使用者
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users 
       (name, email, password, phone, provider, email_verified, verification_token, verification_token_expires) 
       VALUES (?, ?, ?, ?, 'local', FALSE, ?, ?)`,
      [name, email, hashedPassword, phone || null, verificationToken, tokenExpires]
    );

    const userId = result.insertId;

    // 發送驗證信
    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('發送驗證信失敗:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: '註冊成功！請檢查您的信箱並點擊驗證連結。',
      data: { id: userId, name, email }
    });

  } catch (error: any) {
    console.error('註冊錯誤:', error);
    return NextResponse.json(
      { success: false, error: '註冊失敗，請稍後再試' },
      { status: 500 }
    );
  }
}