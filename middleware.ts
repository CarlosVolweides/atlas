import { createClient } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  
  // Refrescar la sesión si es necesario
  // Esto automáticamente refresca el token si está expirado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas que requieren autenticación
  const protectedRoutes = ['/inicio', '/curso'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Proteger rutas que requieren autenticación
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si el usuario está autenticado y trata de ir a /login, redirigir a /inicio
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/inicio';
    return NextResponse.redirect(url);
  }

  // Retornar la respuesta (con las cookies actualizadas si hubo refresh)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (para que no interfiera con las API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

