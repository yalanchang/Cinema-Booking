import { NextRequest, NextResponse } from 'next/server';
import { createECPayForm } from '@/lib/ecpay';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, itemName } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 建立綠界訂單編號
    const orderId = `BK${bookingId}_${Date.now()}`;
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/ecpay/callback`;
    const orderResultUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation/${bookingId}`;

    // 生成表單資料
    const formData = createECPayForm(
      orderId,
      amount,
      itemName,
      returnUrl,
      orderResultUrl
    );

    // 更新訂單付款方式
    await pool.query(
      `UPDATE bookings 
       SET payment_method = 'ecpay'
       WHERE id = ?`,
      [bookingId]
    );

    return NextResponse.json({
      success: true,
      formData,
    });
  } catch (error: any) {
    console.error('ECPay Request Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}