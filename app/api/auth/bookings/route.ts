import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';


export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '請先登入會員' },
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

    // 查詢使用者的所有訂單
    const [bookings] = await pool.query<RowDataPacket[]>(`
      SELECT 
        b.id,
        b.total_amount,
        b.booking_status,
        b.created_at,
        s.show_date,
        s.show_time,
        m.title as movie_title,
        t.name as theater_name,
        GROUP_CONCAT(
          CONCAT(se.row_label, se.seat_number) 
          ORDER BY se.row_label, se.seat_number 
          SEPARATOR ', '
        ) as seats
      FROM bookings b
      INNER JOIN showtimes s ON b.showtime_id = s.id
      INNER JOIN movies m ON s.movie_id = m.id
      INNER JOIN theaters t ON s.theater_id = t.id
      INNER JOIN booking_seats bs ON b.id = bs.booking_id
      INNER JOIN seats se ON bs.seat_id = se.id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `, [payload.id]);

    return NextResponse.json({
      success: true,
      data: bookings
    });

  } catch (error: any) {
    console.error('取得訂單記錄錯誤:', error);
    return NextResponse.json(
      { success: false, error: '取得訂單記錄失敗' },
      { status: 500 }
    );
  }
}