import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import bcrypt from "bcryptjs";
import mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

async function getConnection(): Promise<mysql.Connection> {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
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


            let formattedBirthdate = user.birthdate;
            if (user.birthdate) {
              if (typeof user.birthdate === 'string') {
                formattedBirthdate = user.birthdate.split('T')[0];
              } else if (user.birthdate instanceof Date) {
                const date = new Date(user.birthdate);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                formattedBirthdate = `${year}-${month}-${day}`;
              }
            }
            const formattedUser = {
                ...user, 
                birthdate: formattedBirthdate,
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

// PUT 
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: '請先登入' },
                { status: 401 }
            );
        }
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const avatarFile = formData.get('avatar') as File | null;
        const gender = formData.get('gender') as string;
        const birthdate = formData.get('birthdate') as string;
        const address = formData.get('address') as string;
        const city = formData.get('city') as string;
        const district = formData.get('district') as string;
        const zipCode = formData.get('zipCode') as string;
        const newsletter = formData.get('newsletter') === 'true' ? 1 : 0;
        const smsNotification = formData.get('smsNotification') === 'true' ? 1 : 0;

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

            let avatarUrl = null;
            if (avatarFile) {
                const bytes = await avatarFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const timestamp = Date.now();
                const ext = avatarFile.name.split('.').pop() || 'jpg';
                const filename = `avatar-${timestamp}.${ext}`;

                const fs = require('fs');
                const path = require('path');
                const uploadDir = path.join(process.cwd(), 'public', 'uploads');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                fs.writeFileSync(path.join(uploadDir, filename), buffer);
                avatarUrl = `/uploads/${filename}`;
            }


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
                newsletter,
                smsNotification
            ];

            if (avatarUrl) {
                updateQuery += ', avatar = ?';
                params.push(avatarUrl);
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
    address, city, district, zip_code,newsletter, sms_notification,
    provider, avatar
  FROM users 
  WHERE id = ?`,
                [user.id]
            );


            if (updatedRows.length === 0) {
                throw new Error('無法獲取更新後的使用者資料');
            }

            const updatedUser = updatedRows[0];
            // 處理日期格式 - 確保是 YYYY-MM-DD
            let formattedBirthdate = updatedUser.birthdate;
            if (updatedUser.birthdate) {
                if (typeof updatedUser.birthdate === 'string') {
                    // 如果已經是字符串，取前面的日期部分
                    formattedBirthdate = updatedUser.birthdate.split('T')[0];
                } else if (updatedUser.birthdate instanceof Date) {
                    // 如果是 Date 對象，用本地時間格式化
                    const date = new Date(updatedUser.birthdate);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    formattedBirthdate = `${year}-${month}-${day}`;
                }
            }

            const formattedUser = {
                ...updatedUser,
                birthdate: formattedBirthdate

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