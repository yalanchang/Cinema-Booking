import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        // 處理表單資料
        const formData = await request.formData();
        const bookingId = formData.get('bookingId') as string;
        const amount = parseInt(formData.get('amount') as string);
        
        console.log('Creating ECPay payment for booking:', bookingId, 'amount:', amount);

        // 生成交易編號
        const timestamp = Date.now().toString().slice(-10);
        const merchantTradeNo = `BK${String(bookingId).padStart(6, '0')}${timestamp}`;

        // 格式化時間
        const now = new Date();
        const merchantTradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const ngrokUrl = 'https://degradedly-pseudoorganic-teena.ngrok-free.dev'; 
        

        // 綠界參數
        const params: any = {
            MerchantID: '3002607',  
            MerchantTradeNo: merchantTradeNo,
            MerchantTradeDate: merchantTradeDate,
            PaymentType: 'aio',
            TotalAmount: amount.toString(),
            TradeDesc: 'MovieTicket',
            ItemName: `Movie Ticket x ${Math.floor(amount/280)}`,
            ChoosePayment: 'ALL',
            EncryptType: 1,
            
            ReturnURL: `${ngrokUrl}/api/payments/ecpay/callback`,
            ClientBackURL: `http://localhost:3000/booking/confirmation/${bookingId}?payment=success`,
            CustomField1: bookingId
        };

        // 產生檢查碼
        const checkMacValue = generateCheckMacValue(params);
        params.CheckMacValue = checkMacValue;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>正在跳轉至綠界付款...</title>
                <style>
                    body {
                        background: #171717;
                        color: white;
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .loading {
                        text-align: center;
                    }
                    .spinner {
                        border: 4px solid rgba(210, 105, 0, 0.3);
                        border-top: 4px solid #D26900;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="loading">
                    <div class="spinner"></div>
                    <h2>正在跳轉至綠界付款頁面...</h2>
                    <form id="ecpay-form" method="POST" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5">
                        ${Object.entries(params).map(([key, value]) => 
                            `<input type="hidden" name="${key}" value="${value}" />`
                        ).join('')}
                    </form>
                </div>
                <script>
                    setTimeout(function() {
                        document.getElementById('ecpay-form').submit();
                    }, 1000);
                </script>
            </body>
            </html>
        `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
        });

    } catch (error) {
        console.error('Error:', error);
        return new NextResponse(
            `<html><body><h1>錯誤</h1><p>${(error as Error).message}</p></body></html>`,
            { 
                status: 500,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            }
        );
    }
}

function generateCheckMacValue(params: any) {
    const hashKey = 'pwFHCqoQZGmho4w6';
    const hashIV = 'EkRm7iFT261dpevs';

    // 依字母排序（區分大小寫）
    const sortedKeys = Object.keys(params).sort();

    // 組合字串
    let queryString = '';
    for (const key of sortedKeys) {
        queryString += `&${key}=${params[key]}`;
    }
    
    // 組成完整字串
    const rawString = `HashKey=${hashKey}${queryString}&HashIV=${hashIV}`;

    // URL encode
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