import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: '請驗證您的 MIRROR 電影院帳號',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #1a1a1a; color: #fff; }
            .container { max-width: 600px; margin: 0 auto; background: #2a2a2a; padding: 40px; border-radius: 10px; }
            .logo { text-align: center; font-size: 32px; font-weight: bold; color: #D26900; margin-bottom: 30px; }
            .button { display: inline-block; background: #D26900; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #444; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">MIRROR 電影院</div>
            <h2>嗨，${name}！</h2>
            <p>感謝您註冊 MIRROR 電影院會員。</p>
            <p>請點擊下方按鈕來驗證您的電子郵件：</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">驗證我的帳號</a>
            </p>
            <p style="color: #888; font-size: 14px;">
              或複製連結：<br>
              <a href="${verificationUrl}" style="color: #D26900;">${verificationUrl}</a>
            </p>
            <p style="color: #888; font-size: 14px;">此連結將在 24 小時後失效。</p>
            <div class="footer">
              <p>這是自動發送的郵件，請勿回覆。</p>
              <p>&copy; 2025 MIRROR 電影院</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}