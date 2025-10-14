import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  // ✅ 改用 NextAuth
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { success: false, error: '請先登入會員' },
      { status: 401 }
    );
  }

  // ✅ 從資料庫取得完整使用者資料
  const [users] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, email, phone FROM users WHERE email = ?',
    [session.user.email]
  );

  if (users.length === 0) {
    return NextResponse.json(
      { success: false, error: '找不到使用者資料' },
      { status: 401 }
    );
  }

  const user = users[0];

  const connection = await pool.getConnection();
  
  try {
    const body = await request.json();
    const { showtimeId, seatIds } = body;

    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '請選擇座位' },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [showtimes] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM showtimes WHERE id = ? FOR UPDATE',
      [showtimeId]
    );

    if (showtimes.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: '場次不存在' },
        { status: 404 }
      );
    }

    const showtime = showtimes[0];
    
    if (showtime.available_seats < seatIds.length) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: `座位不足，僅剩 ${showtime.available_seats} 個座位` },
        { status: 400 }
      );
    }

    const [validSeats] = await connection.query<RowDataPacket[]>(
      `SELECT s.id 
       FROM seats s
       INNER JOIN showtimes st ON s.theater_id = st.theater_id
       WHERE st.id = ? AND s.id IN (?)`,
      [showtimeId, seatIds]
    );

    if (validSeats.length !== seatIds.length) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: '部分座位無效' },
        { status: 400 }
      );
    }

    const [bookedSeats] = await connection.query<RowDataPacket[]>(
      'SELECT seat_id FROM showtime_booked_seats WHERE showtime_id = ? AND seat_id IN (?)',
      [showtimeId, seatIds]
    );

    if (bookedSeats.length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: '部分座位已被預訂，請重新選擇' },
        { status: 400 }
      );
    }

    const totalAmount = parseFloat(showtime.price) * seatIds.length;

    // ✅ 使用從資料庫查詢的 user 資料
    const [bookingResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO bookings (user_id, showtime_id, customer_name, customer_email, customer_phone, total_amount, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        user.id,
        showtimeId, 
        user.name,
        user.email,
        user.phone || null,
        totalAmount
      ]
    );

    const bookingId = bookingResult.insertId;

    for (const seatId of seatIds) {
      await connection.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)',
        [bookingId, seatId]
      );

      await connection.query(
        'INSERT INTO showtime_booked_seats (showtime_id, seat_id, booking_id) VALUES (?, ?, ?)',
        [showtimeId, seatId, bookingId]
      );
    }

    await connection.query(
      'UPDATE showtimes SET available_seats = available_seats - ? WHERE id = ?',
      [seatIds.length, showtimeId]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        totalAmount,
        seatCount: seatIds.length,
        message: '訂票成功！'
      }
    });

  } catch (error: any) {
    await connection.rollback();
    console.error('❌ Booking error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '訂票失敗，請稍後再試',
        message: error.message 
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        b.*,
        s.show_date,
        s.show_time,
        s.price,
        m.title as movie_title,
        m.duration,
        m.genre,
        m.rating,
        m.poster_url,
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
      WHERE b.id = ?
      GROUP BY b.id
    `, [bookingId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '訂單不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error: any) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch booking',
        message: error.message 
      },
      { status: 500 }
    );
  }
}