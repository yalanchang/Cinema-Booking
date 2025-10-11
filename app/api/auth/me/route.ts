import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登入' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token 無效' },
        { status: 401 }
      );
    }

    // 查詢最新使用者資料
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
      [payload.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: '使用者不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users[0]
    });

  } catch (error: any) {
    console.error('取得使用者資料錯誤:', error);
    return NextResponse.json(
      { success: false, error: '取得使用者資料失敗' },
      { status: 500 }
    );
  }
}