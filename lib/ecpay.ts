import crypto from 'crypto';

const ECPAY_CONFIG = {
  merchantId: process.env.ECPAY_MERCHANT_ID!,
  hashKey: process.env.ECPAY_HASH_KEY!,
  hashIV: process.env.ECPAY_HASH_IV!,
  env: process.env.ECPAY_ENV || 'test',
};

const API_URL = ECPAY_CONFIG.env === 'test'
  ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
  : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';

// 生成檢查碼
function generateCheckMacValue(params: any): string {
  // 排序參數
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as any);

  // 組合字串
  let checkStr = `HashKey=${ECPAY_CONFIG.hashKey}`;
  for (const key in sortedParams) {
    checkStr += `&${key}=${sortedParams[key]}`;
  }
  checkStr += `&HashIV=${ECPAY_CONFIG.hashIV}`;

  // URL encode
  checkStr = encodeURIComponent(checkStr).toLowerCase();
  checkStr = checkStr
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')');

  // MD5 hash
  const hash = crypto.createHash('md5').update(checkStr).digest('hex').toUpperCase();
  return hash;
}

// 建立付款表單資料
export function createECPayForm(
  orderId: string,
  amount: number,
  itemName: string,
  returnUrl: string,
  orderResultUrl: string
) {
  const tradeDate = new Date()
    .toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '');

  const params = {
    MerchantID: ECPAY_CONFIG.merchantId,
    MerchantTradeNo: orderId,
    MerchantTradeDate: tradeDate,
    PaymentType: 'aio',
    TotalAmount: amount,
    TradeDesc: '電影票訂單',
    ItemName: itemName,
    ReturnURL: returnUrl,
    OrderResultURL: orderResultUrl,
    ChoosePayment: 'ALL', // 可選: Credit(信用卡)、WebATM、ATM、CVS、BARCODE
    EncryptType: 1,
  };

  const checkMacValue = generateCheckMacValue(params);

  return {
    ...params,
    CheckMacValue: checkMacValue,
    action: API_URL,
  };
}

// 驗證回傳資料
export function verifyECPayCallback(data: any): boolean {
  const receivedCheckMacValue = data.CheckMacValue;
  delete data.CheckMacValue;

  const calculatedCheckMacValue = generateCheckMacValue(data);
  return receivedCheckMacValue === calculatedCheckMacValue;
}