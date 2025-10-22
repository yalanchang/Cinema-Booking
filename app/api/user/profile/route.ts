// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 定義使用者資料介面
interface UserData extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthdate?: Date | string;
  address?: string;
  city?: string;
  district?: string;
  zip_code?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  preferred_language?: 'zh-TW' | 'zh-CN' | 'en';
  newsletter?: boolean | number;
  sms_notification?: boolean | number;
  provider?: 'local' | 'google' | 'facebook';
  avatar?: string;
  email_verified?: boolean | number;
  last_login_at?: Date;
}

// 定義更新請求的資料介面
interface UpdateProfileRequest {
  name: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthdate?: string;
  address?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  preferredLanguage?: 'zh-TW' | 'zh-CN' | 'en';
  newsletter?: boolean;
  smsNotification?: boolean;
  currentPassword?: string;
  newPassword?: string;
}

// 建立資料庫連線
async function getConnection(): Promise<mysql.Connection> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME ,
  });
  return connection;
}

// 驗證手機號碼格式（台灣）
function isValidTaiwanPhone(phone: string): boolean {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone);
}

// 獲取使用者資料
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: '請先登入' },
        { status: 401 }
      );
    }

    const connection = await getConnection();

    try {
      const [rows] = await connection.execute<UserData[]>(
        `SELECT 
          id, name, email, phone, gender, birthdate, 
          address, city, district, zip_code,
          emergency_contact, emergency_phone,
          preferred_language, newsletter, sms_notification,
          provider, avatar, email_verified, last_login_at
        FROM users 
        WHERE email = ?`,
        [session.user.email]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { message: '找不到使用者' },
          { status: 404 }
        );
      }

      const user = rows[0];
      
      // 格式化日期為 YYYY-MM-DD
      if (user.birthdate) {
        const date = new Date(user.birthdate);
        user.birthdate = date.toISOString().split('T')[0];
      }

      // 將數字轉換為布林值
      const formattedUser = {
        ...user,
        newsletter: Boolean(user.newsletter),
        sms_notification: Boolean(user.sms_notification),
        email_verified: Boolean(user.email_verified),
      };

      return NextResponse.json(formattedUser);

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('GET /api/user/profile error:', error);
    return NextResponse.json(
      { 
        message: '伺服器錯誤',
        error: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}

// PUT 請求 - 更新使用者資料
export async function PUT(request: NextRequest) {
  try {
    // 獲取當前 session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: '請先登入' },
        { status: 401 }
      );
    }

    // 解析請求內容
    const body: UpdateProfileRequest = await request.json();
    const {
      name,
      phone,
      gender,
      birthdate,
      address,
      city,
      district,
      zipCode,
      emergencyContact,
      emergencyPhone,
      preferredLanguage,
      newsletter,
      smsNotification,
      currentPassword,
      newPassword,
    } = body;

    // 驗證必填欄位
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: '姓名為必填欄位' },
        { status: 400 }
      );
    }

    // 驗證手機號碼格式
    if (phone && !isValidTaiwanPhone(phone)) {
      return NextResponse.json(
        { message: '請輸入有效的手機號碼格式 (09xxxxxxxx)' },
        { status: 400 }
      );
    }

    // 驗證緊急聯絡人電話格式
    if (emergencyPhone && !isValidTaiwanPhone(emergencyPhone)) {
      return NextResponse.json(
        { message: '請輸入有效的緊急聯絡人電話格式' },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    try {
      // 獲取使用者現有資料
      const [userRows] = await connection.execute<UserData[]>(
        'SELECT id, password, provider FROM users WHERE email = ?',
        [session.user.email]
      );

      if (userRows.length === 0) {
        return NextResponse.json(
          { message: '找不到使用者' },
          { status: 404 }
        );
      }

      const user = userRows[0];
      
      // 準備更新查詢
      let updateQuery = `
        UPDATE users SET 
          name = ?,
          phone = ?,
          gender = ?,
          birthdate = ?,
          address = ?,
          city = ?,
          district = ?,
          zip_code = ?,
          emergency_contact = ?,
          emergency_phone = ?,
          preferred_language = ?,
          newsletter = ?,
          sms_notification = ?
      `;
      
      const params: any[] = [
        name.trim(),
        phone || null,
        gender || null,
        birthdate || null,
        address || null,
        city || null,
        district || null,
        zipCode || null,
        emergencyContact || null,
        emergencyPhone || null,
        preferredLanguage || 'zh-TW',
        newsletter ? 1 : 0,
        smsNotification ? 1 : 0
      ];

      // 處理密碼變更（僅限本地帳號）
      if (newPassword && user.provider === 'local') {
        if (!currentPassword) {
          return NextResponse.json(
            { message: '請輸入目前密碼' },
            { status: 400 }
          );
        }

        // 驗證目前密碼
        if (!user.password) {
          return NextResponse.json(
            { message: '帳號密碼設定異常' },
            { status: 400 }
          );
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return NextResponse.json(
            { message: '目前密碼不正確' },
            { status: 400 }
          );
        }

        // 驗證新密碼長度
        if (newPassword.length < 6) {
          return NextResponse.json(
            { message: '新密碼至少需要6個字元' },
            { status: 400 }
          );
        }

        // 加密新密碼
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateQuery += ', password = ?';
        params.push(hashedPassword);
      }

      // 完成查詢語句
      updateQuery += ' WHERE id = ?';
      params.push(user.id);

      // 執行更新
      await connection.execute<ResultSetHeader>(updateQuery, params);

      // 更新最後登入時間
      await connection.execute<ResultSetHeader>(
        'UPDATE users SET last_login_at = NOW() WHERE id = ?',
        [user.id]
      );

      // 獲取更新後的資料
      const [updatedRows] = await connection.execute<UserData[]>(
        `SELECT 
          id, name, email, phone, gender, birthdate, 
          address, city, district, zip_code,
          emergency_contact, emergency_phone,
          preferred_language, newsletter, sms_notification,
          provider, avatar
        FROM users 
        WHERE id = ?`,
        [user.id]
      );

      if (updatedRows.length === 0) {
        throw new Error('無法獲取更新後的使用者資料');
      }

      const updatedUser = updatedRows[0];
      
      // 格式化回傳資料
      if (updatedUser.birthdate) {
        const date = new Date(updatedUser.birthdate);
        updatedUser.birthdate = date.toISOString().split('T')[0];
      }

      const formattedUser = {
        ...updatedUser,
        newsletter: Boolean(updatedUser.newsletter),
        sms_notification: Boolean(updatedUser.sms_notification),
      };

      return NextResponse.json({
        message: '個人資料更新成功',
        user: formattedUser
      });

    } finally {
      await connection.end();
    }

  } catch (error) {
    console.error('PUT /api/user/profile error:', error);
    return NextResponse.json(
      { 
        message: '伺服器錯誤，請稍後再試',
        error: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}