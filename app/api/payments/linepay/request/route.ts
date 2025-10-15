import { NextRequest, NextResponse } from 'next/server';
import { createLinePayRequest } from '@/lib/linepay';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, productName } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }

    // 建立 LINE Pay 訂單
    const orderId = `BK${bookingId}_${Date.now()}`;
    const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/linepay/confirm?bookingId=${bookingId}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment/cancel`;

    const result = await createLinePayRequest(
      orderId,
      amount,
      productName,
      confirmUrl,
      cancelUrl
    );

    if (result.returnCode === '0000') {
      // 儲存交易資訊到資料庫
      await pool.query(
        `UPDATE bookings 
         SET payment_method = 'linepay', 
             payment_transaction_id = ?
         WHERE id = ?`,
        [result.info.transactionId, bookingId]
      );

      return NextResponse.json({
        success: true,
        paymentUrl: result.info.paymentUrl.web,
        transactionId: result.info.transactionId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.returnMessage },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('LINE Pay Request Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}