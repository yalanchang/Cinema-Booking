import { NextRequest, NextResponse } from 'next/server';
import pool  from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        const receivedCheckMacValue = data.CheckMacValue as string;
        const calculatedCheckMacValue = generateCheckMacValue(data as any);
        
        if (receivedCheckMacValue !== calculatedCheckMacValue) {
            return new NextResponse('0|Invalid CheckMacValue', { status: 200 });
        }
        
        if (data.RtnCode === '1') {
            const merchantTradeNo = data.MerchantTradeNo as string;
            
            const bookingId = parseInt(merchantTradeNo.substring(2, 8));
            const connection = await pool.getConnection();
            const tradeNo = data.TradeNo as string;
            
            
            try {
                const [result]: any = await connection.query(
                    'UPDATE bookings SET payment_status = ?, payment_method = ?, payment_transaction_id = ?, updated_at = NOW() WHERE id = ?',
                    ['paid', 'ecpay', tradeNo, bookingId]
                );
                
                console.log('[Callback] 數據庫更新結果:', {
                    affectedRows: result.affectedRows,
                    bookingId: bookingId
                });
                
                if (result.affectedRows > 0) {
                    return new NextResponse('1|OK', { status: 200 });
                } else {
                    return new NextResponse('0|Booking not found', { status: 200 });
                }
                
            } finally {
                connection.release();
            }
        } else {
            console.log('付款失敗，RtnCode:', data.RtnCode);
        }
        
        return new NextResponse('0|Payment Failed', { status: 200 });
        
    } catch (error) {
        console.error('[Callback] 錯誤:', error);
        return new NextResponse('0|Error: ' + (error as Error).message, { status: 200 });
    }
}

function generateCheckMacValue(data: any) {
    const hashKey = 'pwFHCqoQZGmho4w6';
    const hashIV = 'EkRm7iFT261dpevs';
    
    const dataCopy = { ...data };
    delete dataCopy.CheckMacValue;
    
    const sortedKeys = Object.keys(dataCopy).sort();

    let queryString = '';
    for (const key of sortedKeys) {
        queryString += `&${key}=${dataCopy[key]}`;
    }
    
    const rawString = `HashKey=${hashKey}${queryString}&HashIV=${hashIV}`;

    let encodedString = encodeURIComponent(rawString).toLowerCase()
        .replace(/%20/g, '+')
        .replace(/%2d/g, '-')
        .replace(/%5f/g, '_')
        .replace(/%2e/g, '.')
        .replace(/%21/g, '!')
        .replace(/%2a/g, '*')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')');

    // 使用 SHA256（綠界測試環境使用 SHA256）
    const hash = crypto.createHash('sha256').update(encodedString, 'utf8').digest('hex');
    return hash.toUpperCase();
}