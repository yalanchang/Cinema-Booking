import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET - 根據電影ID取得場次列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const movieId = searchParams.get('movieId');
    
    if (!movieId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Movie ID is required' 
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        s.*,
        t.name as theater_name,
        t.capacity,
        m.title as movie_title,
        m.duration,
        m.genre,
        m.rating
      FROM showtimes s
      INNER JOIN theaters t ON s.theater_id = t.id
      INNER JOIN movies m ON s.movie_id = m.id
      WHERE s.movie_id = ? 
        AND s.show_date >= CURDATE()
      ORDER BY s.show_date ASC, s.show_time ASC
    `, [movieId]);
    
    return NextResponse.json({ 
      success: true, 
      data: rows 
    });
  } catch (error: any) {
    console.error('❌ Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch showtimes',
        message: error.message 
      },
      { status: 500 }
    );
  }
}