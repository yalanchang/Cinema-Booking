import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - 取得場次的所有座位及已訂座位狀態
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showtimeId = searchParams.get('showtimeId');
    
    if (!showtimeId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Showtime ID is required' 
        },
        { status: 400 }
      );
    }

    // 取得該影廳的所有座位
    const [seats] = await pool.query<RowDataPacket[]>(`
      SELECT s.*, t.name as theater_name
      FROM seats s
      INNER JOIN showtimes st ON s.theater_id = st.theater_id
      INNER JOIN theaters t ON s.theater_id = t.id
      WHERE st.id = ?
      ORDER BY s.row_label ASC, s.seat_number ASC
    `, [showtimeId]);

    // 取得該場次已訂的座位
    const [bookedSeats] = await pool.query<RowDataPacket[]>(`
      SELECT 
        sbs.seat_id,
        s.row_label,
        s.seat_number
      FROM showtime_booked_seats sbs
      INNER JOIN seats s ON sbs.seat_id = s.id
      WHERE sbs.showtime_id = ?
    `, [showtimeId]);

    const bookedSeatIds = bookedSeats.map(bs => bs.seat_id);

    // 取得場次資訊
    const [showtimeInfo] = await pool.query<RowDataPacket[]>(`
      SELECT 
        st.*,
        m.title as movie_title,
        m.id as movie_id,
        t.name as theater_name
      FROM showtimes st
      INNER JOIN movies m ON st.movie_id = m.id
      INNER JOIN theaters t ON st.theater_id = t.id
      WHERE st.id = ?
    `, [showtimeId]);

    if (showtimeInfo.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Showtime not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        seats,
        bookedSeatIds,
        bookedSeats,
        showtime: showtimeInfo[0],
        totalSeats: seats.length,
        availableSeats: seats.length - bookedSeatIds.length
      }
    });
  } catch (error: any) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch seats',
        message: error.message 
      },
      { status: 500 }
    );
  }
}