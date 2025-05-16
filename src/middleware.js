import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
 
async function verifyToken(token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      return payload;
 
    } catch (error) {
      return null;
    }
  }
 
export async function middleware(req) {
  const { pathname } = req.nextUrl;  
  const token = req.cookies.get("auth_token")?.value || "";
 
  if (!token) {
    if (pathname.startsWith('/expenses') || ['/','/dues','/expenses','/members','/expense-types'].includes(pathname)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }
 
  const jwtdata = await verifyToken(token);
 
  if (!jwtdata?.status) {    
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }
 
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }
 
  return NextResponse.next();
}
 
export const config = {
    matcher:['/expenses/:path*','/','/dues','/expenses','/members','/expense-types','/login']
}
 