import { NextRequest, NextResponse } from 'next/server';
import pool  from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        
        if (data.RtnCode === '1') {
            const merchantTradeNo = data.MerchantTradeNo as string;
            const bookingId = parseInt(merchantTradeNo.substring(2, 8));
            const connection = await pool.getConnection();
            const paymentDate = data.PaymentDate as string;
            const tradeNo = data.TradeNo as string;


            
            try {
                const [result]: any = await connection.query(
                    'UPDATE bookings SET payment_status = ?, payment_method = ?,payment_transaction_id = ?, updated_at = NOW() WHERE id = ?',
                    ['paid', 'ecpay', tradeNo, bookingId]
                );
                
                
                if (result.affectedRows > 0) {
                    return new NextResponse('1|OK', { status: 200 });
                } else {
                    return new NextResponse('0|Booking not found', { status: 200 });
                }
                
            } finally {
                connection.release();
            }
        }
        
        console.log('Payment failed:', data.RtnMsg);
        return new NextResponse('0|Payment Failed', { status: 200 });
        
    } catch (error) {
        console.error('Callback error:', error);
        return new NextResponse('0|Error: ' + (error as Error).message, { status: 200 });
    }
}