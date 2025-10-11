import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '已登出'
  });

  response.cookies.delete('auth_token');

  return response;
}