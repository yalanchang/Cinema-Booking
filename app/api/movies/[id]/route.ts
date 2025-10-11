// app/api/movies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      'SELECT * FROM movies WHERE id = ?',
      [params.id]
    );

    await connection.end();

    const movies = rows as any[];
    
    if (movies.length === 0) {
      return NextResponse.json(
        { success: false, error: '找不到此電影' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: movies[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: '資料庫查詢錯誤' },
      { status: 500 }
    );
  }
}