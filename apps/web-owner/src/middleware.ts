import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''; // In a real app, use a secure cookie
  
  // For demonstration, we'll check localStorage on the client, 
  // but middleware can check cookies.
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  // If trying to access dashboard without token
  // (Note: In a simple SPA/Next app without iron-session/next-auth, 
  // we often handle this in a Layout or use Cookies)
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
