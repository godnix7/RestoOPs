import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { adminToken } = await request.json();

  const response = NextResponse.json({ success: true });

  response.cookies.set('adminToken', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}
