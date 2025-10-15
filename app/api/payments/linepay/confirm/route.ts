import { NextRequest, NextResponse } from 'next/server';
import { confirmLinePayment } from '@/lib/linepay';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');
    const bookingId = searchParams.get('bookingId');

    if (!transactionId || !bookingId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment/error`
      );
    }

    // 取得訂單金額
    const [bookings] = await pool.query<any[]>(
      'SELECT total_amount FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment/error`
      );
    }

    const amount = bookings[0].total_amount;

    // 確認付款
    const result = await confirmLinePayment(transactionId, amount);

    if (result.returnCode === '0000') {
      // 更新訂單狀態為已付款
      await pool.query(
        `UPDATE bookings 
         SET payment_status = 'paid', 
             booking_status = 'confirmed'
         WHERE id = ?`,
        [bookingId]
      );

      // 重定向到成功頁面
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation/${bookingId}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment/error`
      );
    }
  } catch (error) {
    console.error('LINE Pay Confirm Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment/error`
    );
  }
}