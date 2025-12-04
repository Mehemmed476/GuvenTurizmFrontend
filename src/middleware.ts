import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
    role?: string | string[];
}

export function middleware(request: NextRequest) {
  // 1. Gedilən yolu yoxla
  const path = request.nextUrl.pathname;

  // 2. Yalnız "/admin" ilə başlayan yolları qoruyuruq
  if (path.startsWith('/admin')) {
    
    // Cookie-dən tokeni oxu
    const token = request.cookies.get('accessToken')?.value;

    // Token yoxdursa -> Ana səhifəyə at
    if (!token) {
       return NextResponse.redirect(new URL('/', request.url));
    }

    try {
       // Tokeni dekod et və rolu yoxla
       const decoded: DecodedToken = jwtDecode(token);
       const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;
       const role = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;

       // Əgər Admin deyilsə -> Ana səhifəyə at
       if (role !== 'Admin') {
          return NextResponse.redirect(new URL('/', request.url));
       }

    } catch (e) {
       // Token xarabdırsa -> Ana səhifəyə at
       return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Hər şey qaydasındadırsa, davam et
  return NextResponse.next();
}

// Middleware-in işləyəcəyi yollar
export const config = {
  matcher: ['/admin/:path*'],
}