import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {    
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.duration,
        m.genre,
        m.rating,
        m.poster_url,
        m.release_date,
        COUNT(DISTINCT s.id) as showtime_count
      FROM movies m
      LEFT JOIN showtimes s ON m.id = s.movie_id 
        AND s.show_date >= CURDATE()
      GROUP BY m.id
      ORDER BY m.release_date DESC
    `);
        
    return NextResponse.json({ 
      success: true, 
      data: rows 
    });
  } catch (error: any) {
    console.error('Movies API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch movies',
        message: error.message 
      },
      { status: 500 }
    );
  }
}