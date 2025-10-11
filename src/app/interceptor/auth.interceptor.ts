import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');

  // 🚨 Exclure refresh-token de l’interceptor
  if (req.url.includes('/auth/refresh-token')) {
    console.log('[Interceptor] Requête refresh-token → on laisse passer sans interception');
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
