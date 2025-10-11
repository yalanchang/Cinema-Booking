import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { verifyToken } from '@/lib/auth';


export async function POST(request: NextRequest) {
  let userId: number | null = null;

  const token = request.cookies.get('auth_token')?.value;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.id;
    }
  }
  const connection = await pool.getConnection();
  
  try {
    const body = await request.json();
    const { showtimeId, seatIds, customerName, customerEmail, customerPhone } = body;

    // 驗證必要欄位
    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '請選擇座位' },
        { status: 400 }
      );
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: '請填寫姓名和電子郵件' },
        { status: 400 }
      );
    }

    // 開始交易
    await connection.beginTransaction();
    console.log('🔄 Transaction started for booking');

    // 1. 鎖定場次記錄並檢查
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
    console.log(`📅 Showtime: ${showtime.id}, Available seats: ${showtime.available_seats}`);
    
    // 檢查座位數量
    if (showtime.available_seats < seatIds.length) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, error: `座位不足，僅剩 ${showtime.available_seats} 個座位` },
        { status: 400 }
      );
    }

    // 2. 檢查選擇的座位是否有效且未被預訂
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

    // 3. 檢查座位是否已被預訂
    const [bookedSeats] = await connection.query<RowDataPacket[]>(
      'SELECT seat_id FROM showtime_booked_seats WHERE showtime_id = ? AND seat_id IN (?)',
      [showtimeId, seatIds]
    );

    if (bookedSeats.length > 0) {
      await connection.rollback();
      const bookedSeatIds = bookedSeats.map(bs => bs.seat_id);
      return NextResponse.json(
        { success: false, error: '部分座位已被預訂，請重新選擇' },
        { status: 400 }
      );
    }

    // 4. 計算總金額
    const totalAmount = parseFloat(showtime.price) * seatIds.length;
    console.log(`💰 Total amount: ${totalAmount}`);

    // 5. 建立訂單
 const [bookingResult] = await connection.query<ResultSetHeader>(
  `INSERT INTO bookings (user_id, showtime_id, customer_name, customer_email, customer_phone, total_amount, booking_status)
   VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
  [userId, showtimeId, customerName, customerEmail, customerPhone || null, totalAmount]
);

    const bookingId = bookingResult.insertId;
    console.log(`✅ Booking created: ${bookingId}`);

    // 6. 新增訂票座位記錄
    for (const seatId of seatIds) {
      // 新增到 booking_seats
      await connection.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)',
        [bookingId, seatId]
      );

      // 新增到 showtime_booked_seats
      await connection.query(
        'INSERT INTO showtime_booked_seats (showtime_id, seat_id, booking_id) VALUES (?, ?, ?)',
        [showtimeId, seatId, bookingId]
      );
    }

    // 7. 更新場次可用座位數
    await connection.query(
      'UPDATE showtimes SET available_seats = available_seats - ? WHERE id = ?',
      [seatIds.length, showtimeId]
    );

    // 提交交易
    await connection.commit();
    console.log('✅ Transaction committed successfully');

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

// GET - 取得訂單詳情
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