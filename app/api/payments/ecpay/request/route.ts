import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/api/payments/ecpay/callback`;
    const clientBackUrl = `${baseUrl}/booking/confirmation/${bookingId}?payment=cancelled`;
    const orderResultUrl = `${baseUrl}/booking/confirmation/${bookingId}?payment=success`;


    if (!bookingId || !amount) {
        return NextResponse.json({
            success: false,
            error: 'Missing parameters'
        }, { status: 400 });
    }

    try {
        const totalAmount = Math.floor(parseFloat(amount)).toString();
        const timestamp = Date.now().toString(); 
        const paddedBookingId = bookingId.padStart(6, '0'); 
        const merchantTradeNo = `BK${paddedBookingId}${timestamp.slice(-12)}`;
        const params: any = {
            MerchantID: process.env.ECPAY_MERCHANT_ID || '3002607',
            MerchantTradeNo: merchantTradeNo, 
            MerchantTradeDate: formatDate(new Date()),
            PaymentType: 'aio',
            TotalAmount: totalAmount, 
            TradeDesc: '電影票購買',
            ItemName: '電影票',
            ReturnURL: returnUrl,
            ClientBackURL: clientBackUrl,
            OrderResultURL: orderResultUrl,
            ChoosePayment: 'ALL',
            EncryptType: 1,
        };

        const checkMacValue = generateCheckMacValue(params);
        params.CheckMacValue = checkMacValue;

        const queryString = new URLSearchParams(params).toString();
        
        const submitPageUrl = new URL(`/payment/ecpay/submit?${queryString}`, baseUrl);
        
        return NextResponse.redirect(submitPageUrl.toString());

    } catch (error) {
        console.error('ECPay error:', error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation/${bookingId}?error=payment_failed`
        );
    }
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function generateCheckMacValue(params: any): string {
    const hashKey = process.env.ECPAY_HASH_KEY || 'pwFHCqoQZGmho4w6';
    const hashIV = process.env.ECPAY_HASH_IV || 'EkRm7iFT261dpevs';
    
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys
        .map(key => `${key}=${params[key]}`)
        .join('&');
    
    const rawString = `HashKey=${hashKey}&${paramString}&HashIV=${hashIV}`;
    const encodedString = encodeURIComponent(rawString)
        .replace(/%20/g, '+')
        .replace(/%2d/g, '-')
        .replace(/%5f/g, '_')
        .replace(/%2e/g, '.')
        .replace(/%21/g, '!')
        .replace(/%2a/g, '*')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')')
        .toLowerCase();
    
    return crypto
        .createHash('sha256')
        .update(encodedString)
        .digest('hex')
        .toUpperCase();
}