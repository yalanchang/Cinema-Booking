import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { bookingId, amount, method } = await request.json();


        let paymentUrl = '';

        if (method === 'linepay') {
            paymentUrl = `/api/payments/linepay/request?bookingId=${bookingId}&amount=${amount}`;
        } else if (method === 'ecpay') {
            paymentUrl = `/api/payments/ecpay/request?bookingId=${bookingId}&amount=${amount}`;
            
        }

        return NextResponse.json({
            success: true,
            paymentUrl: paymentUrl,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Payment creation failed'
        }, { status: 500 });
    }
}