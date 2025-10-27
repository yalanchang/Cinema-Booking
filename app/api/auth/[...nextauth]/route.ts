import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile",
                },
            },
        }),

        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'public_profile ',
                },
            },
        }),

        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('請輸入 Email 和密碼');
                }

                const connection = await pool.getConnection();
                try {
                    const [users] = await connection.execute<RowDataPacket[]>(
                        'SELECT * FROM users WHERE email = ? AND provider = "local"',
                        [credentials.email]
                    );

                    if (users.length === 0) {
                        throw new Error('Email 或密碼錯誤');
                    }

                    const user = users[0];

                    const isValid = await verifyPassword(credentials.password, user.password);
                    if (!isValid) {
                        throw new Error('Email 或密碼錯誤');
                    }

                    if (!user.email_verified) {
                        throw new Error('請先驗證您的電子郵件。請檢查您的信箱。');
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.avatar,
                    };
                } finally {
                    connection.release();
                }
            }
        })
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (!account) {
                return false;
            }
            try {
                if (account.provider === 'google' || account.provider === 'facebook') {
                    const connection = await pool.getConnection();
                    try {
                        const [existingUsers] = await connection.execute<RowDataPacket[]>(
                            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
                            [account.provider, account.providerAccountId]
                        );

                        if (existingUsers.length > 0) {
                            console.log('用戶已存在, ID:', existingUsers[0].id);

                            // 如果用戶有 email，更新它
                            if (user.email) {
                                await connection.execute(
                                    'UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?',
                                    [user.name || existingUsers[0].name, user.email, user.image || existingUsers[0].avatar, existingUsers[0].id]
                                );
                            } else {
                                await connection.execute(
                                    'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
                                    [user.name || existingUsers[0].name, user.image || existingUsers[0].avatar, existingUsers[0].id]
                                );
                            }

                            return true;
                        }
                        
                        // 使用真實的 email，如果沒有則生成假的
                        const userEmail = user.email || `${account.providerAccountId}@${account.provider}.social`;
                        
                        const [result] = await connection.execute<ResultSetHeader>(
                            `INSERT INTO users 
                             (name, email, provider, provider_id, email_verified, avatar, password) 
                             VALUES (?, ?, ?, ?, TRUE, ?, NULL)`,
                            [
                                user.name || `${account.provider} User`,
                                userEmail,
                                account.provider,
                                account.providerAccountId,
                                user.image || null
                            ]
                        );

                        console.log('新用戶已建立, ID:', result.insertId);
                        return true;
                    } finally {
                        connection.release();
                    }
                }

                return true;
            } catch (error) {
                console.error('登入錯誤:', error);
                return false;
            }
        },

        async jwt({ token, user, account }) {
            if (account) {
                const connection = await pool.getConnection();
                try {
                    const [users] = await connection.execute<RowDataPacket[]>(
                        'SELECT id, name, email, phone, gender, DATE_FORMAT(birthdate, "%Y-%m-%d") as birthdate, address, city, district, zip_code, avatar, provider FROM users WHERE provider = ? AND provider_id = ?',
                        [account.provider, account.providerAccountId]
                    );

                    if (users.length > 0) {
                        const dbUser = users[0];
                        token.id = dbUser.id;
                        token.email = dbUser.email;
                        token.name = dbUser.name;
                        token.phone = dbUser.phone;
                        token.gender = dbUser.gender;
                        token.birthdate = dbUser.birthdate;
                        token.address = dbUser.address;
                        token.city = dbUser.city;
                        token.district = dbUser.district;
                        token.zip_code = dbUser.zip_code;
                        token.provider = dbUser.provider;
                        token.picture = dbUser.avatar;
                    }
                } finally {
                    connection.release();
                }
            }
            else if (token.email) {
                const connection = await pool.getConnection();
                try {
                    const [users] = await connection.execute<RowDataPacket[]>(
                        'SELECT id, name, email, phone, gender, DATE_FORMAT(birthdate, "%Y-%m-%d") as birthdate, address, city, district, zip_code, avatar, provider FROM users WHERE email = ?',
                        [token.email]
                    );

                    if (users.length > 0) {
                        const dbUser = users[0];
                        token.id = dbUser.id;
                        token.name = dbUser.name;
                        token.email = dbUser.email;
                        token.phone = dbUser.phone;
                        token.gender = dbUser.gender;
                        token.birthdate = dbUser.birthdate;
                        token.address = dbUser.address;
                        token.city = dbUser.city;
                        token.district = dbUser.district;
                        token.zip_code = dbUser.zip_code;
                        token.provider = dbUser.provider;
                        token.picture = dbUser.avatar;
                    }
                } finally {
                    connection.release();
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
                session.user.id = token.id as string;
                session.user.phone = token.phone as string;
                session.user.provider = token.provider as string;
                (session.user as any).gender = token.gender;
                (session.user as any).birthdate = token.birthdate;
                (session.user as any).address = token.address;
                (session.user as any).city = token.city;
                (session.user as any).district = token.district;
                (session.user as any).zip_code = token.zip_code;
            }
            return session;
        },

        async redirect({ url, baseUrl }) {
            if (url.startsWith(baseUrl)) return url;
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            return baseUrl;
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    session: {
        strategy: 'jwt',
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };