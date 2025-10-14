import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [slides] = await pool.query<RowDataPacket[]>(
      `SELECT id, image_url 
       FROM carousel_slides 
       WHERE is_active = TRUE 
       ORDER BY display_order ASC
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Error fetching carousel slides:', error);
    return NextResponse.json(
      { success: false, error: '無法載入輪播圖' },
      { status: 500 }
    );
  }
}