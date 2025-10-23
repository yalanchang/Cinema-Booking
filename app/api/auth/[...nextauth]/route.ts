
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const authOptions: NextAuthOptions = {
  providers: [
    //  Google 登入
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    //  Facebook 登入
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'public_profile ', 
        },
      },
    }),

    // 一般帳號密碼登入
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

        const [users] = await pool.query<RowDataPacket[]>(
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

        // 一般註冊
        if (!user.email_verified) {
          throw new Error('請先驗證您的電子郵件。請檢查您的信箱。');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
 if (!account) {
        return false;
      }
      try {
        // Google 或 Facebook 登入
        if (account.provider === 'google' || account.provider === 'facebook') {
          const [existingUsers] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            [account.provider, account.providerAccountId]
          );

          if (existingUsers.length > 0) {
            console.log(' 用戶已存在, ID:', existingUsers[0].id);
            
            // 更新用戶資訊 (名稱和頭像可能變更)
            await pool.query(
              'UPDATE users SET name = ?, avatar = ? WHERE id = ?',
              [user.name || existingUsers[0].name, user.image || existingUsers[0].avatar, existingUsers[0].id]
            );
            
            return true;
          }
              const generatedEmail = `${account.providerAccountId}@${account.provider}.social`;
              const [result] = await pool.query<ResultSetHeader>(
                `INSERT INTO users 
                 (name, email, provider, provider_id, email_verified, avatar, password) 
                 VALUES (?, ?, ?, ?, TRUE, ?, NULL)`,
                [
                  user.name || `${account.provider} User`,
                  generatedEmail,
                  account.provider,
                  account.providerAccountId,
                  user.image || null
                ]
              );
              
              console.log('新用戶已建立, ID:', result.insertId);
              return true;
            }

        return true;
      } catch (error) {
        console.error('登入錯誤:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
        if (account) {
            console.log('處理 account provider:', account.provider);
            
            // 用 provider + provider_id 查詢完整用戶資訊
            const [users] = await pool.query<RowDataPacket[]>(
              'SELECT id, name, email, phone, avatar, provider, provider_id FROM users WHERE provider = ? AND provider_id = ?',
              [account.provider, account.providerAccountId]
            );


            if (users.length > 0) {
              const dbUser = users[0];
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.phone = dbUser.phone;
              token.provider = dbUser.provider;
              token.picture = dbUser.avatar;
              console.log(' JWT token 已更新, user ID:', dbUser.id);
            } else {
              console.error(' 在資料庫中找不到用戶');
            }
          } else if (user) {
            // Credentials 登入
            const [users] = await pool.query<RowDataPacket[]>(
              'SELECT id, name, email, phone, avatar, provider FROM users WHERE email = ? AND provider = "local"',
              [user.email]
            );
            

        if (users.length > 0) {
          const dbUser = users[0];
          token.id = dbUser.id;
          token.phone = dbUser.phone;
          token.provider = dbUser.provider;
          token.picture = dbUser.avatar;
        }
        
      }
      else if (token.email) {
        // ← 新增：每次 session 訪問時重新整理
        const [users] = await pool.query<RowDataPacket[]>(
          'SELECT id, name, email, phone, avatar, provider FROM users WHERE email = ?',
          [token.email]
        );
    
        if (users.length > 0) {
          const dbUser = users[0];
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.phone = dbUser.phone;
          token.provider = dbUser.provider;
          token.picture = dbUser.avatar;
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