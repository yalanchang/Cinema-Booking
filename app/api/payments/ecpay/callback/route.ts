import { NextRequest, NextResponse } from 'next/server';
import { verifyECPayCallback } from '@/lib/ecpay';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    // 驗證資料
    const isValid = verifyECPayCallback(data);

    if (!isValid) {
      console.error('ECPay Callback Verification Failed');
      return new NextResponse('0|Verification Failed', { status: 400 });
    }

    // 解析訂單編號
    const merchantTradeNo = data.MerchantTradeNo;
    const bookingId = merchantTradeNo.split('_')[0].replace('BK', '');
    const rtnCode = data.RtnCode;

    if (rtnCode === '1') {
      // 付款成功
      await pool.query(
        `UPDATE bookings 
         SET payment_status = 'paid', 
             booking_status = 'confirmed',
             payment_transaction_id = ?
         WHERE id = ?`,
        [data.TradeNo, bookingId]
      );

      return new NextResponse('1|OK');
    } else {
      // 付款失敗
      return new NextResponse('0|Payment Failed');
    }
  } catch (error) {
    console.error('ECPay Callback Error:', error);
    return new NextResponse('0|Error', { status: 500 });
  }
}