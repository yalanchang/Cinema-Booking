import crypto from 'crypto';

const LINE_PAY_CONFIG = {
  channelId: process.env.LINE_PAY_CHANNEL_ID!,
  channelSecret: process.env.LINE_PAY_CHANNEL_SECRET!,
  env: process.env.LINE_PAY_ENV || 'sandbox',
};

const API_URL = LINE_PAY_CONFIG.env === 'sandbox'
  ? 'https://sandbox-api-pay.line.me'
  : 'https://api-pay.line.me';

// 生成簽名
function generateSignature(uri: string, body: string, nonce: string): string {
  const message = LINE_PAY_CONFIG.channelSecret + uri + body + nonce;
  const signature = crypto
    .createHmac('sha256', LINE_PAY_CONFIG.channelSecret)
    .update(message)
    .digest('base64');
  return signature;
}

// 發起付款請求
export async function createLinePayRequest(
  orderId: string,
  amount: number,
  productName: string,
  confirmUrl: string,
  cancelUrl: string
) {
  const uri = '/v3/payments/request';
  const nonce = Date.now().toString();

  const requestBody = {
    amount,
    currency: 'TWD',
    orderId,
    packages: [
      {
        id: orderId,
        amount,
        products: [
          {
            name: productName,
            quantity: 1,
            price: amount,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl,
      cancelUrl,
    },
  };

  const body = JSON.stringify(requestBody);
  const signature = generateSignature(uri, body, nonce);

  try {
    const response = await fetch(`${API_URL}${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': LINE_PAY_CONFIG.channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature,
      },
      body,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('LINE Pay Request Error:', error);
    throw error;
  }
}

// 確認付款
export async function confirmLinePayment(
  transactionId: string,
  amount: number
) {
  const uri = `/v3/payments/${transactionId}/confirm`;
  const nonce = Date.now().toString();

  const requestBody = {
    amount,
    currency: 'TWD',
  };

  const body = JSON.stringify(requestBody);
  const signature = generateSignature(uri, body, nonce);

  try {
    const response = await fetch(`${API_URL}${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': LINE_PAY_CONFIG.channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature,
      },
      body,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('LINE Pay Confirm Error:', error);
    throw error;
  }
}