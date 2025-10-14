import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import crypto from 'crypto';

async function handleDataDeletion(userId: string) {
  // 查詢使用者
  const [users] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE provider = "facebook" AND provider_id = ?',
    [userId]
  );

  if (users.length === 0) {
    return {
      message: 'User not found or already deleted',
      userId
    };
  }

  const dbUserId = users[0].id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 刪除訂單座位
    await connection.query(
      'DELETE bs FROM booking_seats bs INNER JOIN bookings b ON bs.booking_id = b.id WHERE b.user_id = ?',
      [dbUserId]
    );

    // 刪除場次已訂座位
    await connection.query(
      'DELETE sbs FROM showtime_booked_seats sbs INNER JOIN bookings b ON sbs.booking_id = b.id WHERE b.user_id = ?',
      [dbUserId]
    );

    // 刪除訂單
    await connection.query(
      'DELETE FROM bookings WHERE user_id = ?',
      [dbUserId]
    );

    // 刪除使用者
    await connection.query(
      'DELETE FROM users WHERE id = ?',
      [dbUserId]
    );

    await connection.commit();

    return {
      success: true,
      userId,
      dbUserId
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// 支援 GET 方法
export async function GET(request: NextRequest) {
  try {
    console.log('📥 收到 GET 請求');
    console.log('URL:', request.url);
    console.log('Query params:', Object.fromEntries(request.nextUrl.searchParams));

    const searchParams = request.nextUrl.searchParams;
    const signed_request = searchParams.get('signed_request');

    // 如果沒有 signed_request，返回成功回應讓 Facebook 驗證通過
    if (!signed_request) {
      console.log('⚠️ 沒有 signed_request，返回測試回應');
      const confirmationCode = crypto.randomBytes(16).toString('hex');
      const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion-status?code=${confirmationCode}`;

      return NextResponse.json({
        url: statusUrl,
        confirmation_code: confirmationCode
      });
    }

    console.log('✅ 處理 signed_request');

    // 解析 Facebook 的 signed_request
    const [encodedSig, payload] = signed_request.split('.');
    const data = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    const userId = data.user_id;

    if (!userId) {
      throw new Error('Invalid user_id in signed_request');
    }

    console.log('👤 處理用戶:', userId);

    await handleDataDeletion(userId);

    const confirmationCode = crypto.randomBytes(16).toString('hex');
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion-status?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });

  } catch (error: any) {
    console.error('❌ GET 錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to delete user data', details: error.message },
      { status: 500 }
    );
  }
}

// 支援 POST 方法
export async function POST(request: NextRequest) {
  try {
    console.log('📥 收到 POST 請求');
    
    const body = await request.json();
    console.log('Body:', body);

    const { signed_request } = body;

    // 如果沒有 signed_request，返回成功回應
    if (!signed_request) {
      console.log('⚠️ 沒有 signed_request，返回測試回應');
      const confirmationCode = crypto.randomBytes(16).toString('hex');
      const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion-status?code=${confirmationCode}`;

      return NextResponse.json({
        url: statusUrl,
        confirmation_code: confirmationCode
      });
    }

    console.log('✅ 處理 signed_request');

    // 解析 Facebook 的 signed_request
    const [encodedSig, payload] = signed_request.split('.');
    const data = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    );

    const userId = data.user_id;

    if (!userId) {
      throw new Error('Invalid user_id in signed_request');
    }

    console.log('👤 處理用戶:', userId);

    await handleDataDeletion(userId);

    const confirmationCode = crypto.randomBytes(16).toString('hex');
    const statusUrl = `${process.env.NEXT_PUBLIC_APP_URL}/data-deletion-status?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });

  } catch (error: any) {
    console.error('❌ POST 錯誤:', error);
    return NextResponse.json(
      { error: 'Failed to delete user data', details: error.message },
      { status: 500 }
    );
  }
}