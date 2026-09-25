import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

let refreshInProgress = false;

const SENSITIVE_KEYS = new Set([
  'password', 'confirmPassword', 'newPassword', 'ConfirmedNewPassword',
  'currentPassword', 'otp', 'accessToken', 'refreshToken', 'token', 'authorization'
]);

function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);

  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(source)) {
    result[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : redact(val);
  }
  return result;
}

function logRequest(req: HttpRequest<unknown>): void {
  console.groupCollapsed(`%c[HTTP REQUEST] ${req.method} ${req.urlWithParams}`, 'color:#0ea5a8;font-weight:bold');
  console.log('Method:', req.method);
  console.log('URL:', req.urlWithParams);
  console.log('Body:', redact(req.body));
  console.log('Headers:', redact(req.headers.keys().reduce((acc, key) => ({ ...acc, [key]: req.headers.get(key) }), {})));
  console.groupEnd();
}

function logResponse(req: HttpRequest<unknown>, event: HttpEvent<unknown>): void {
  if ((event as any).status !== undefined) {
    console.groupCollapsed(`%c[HTTP RESPONSE] ${req.method} ${req.urlWithParams}`, 'color:#198754;font-weight:bold');
    console.log('Status:', (event as any).status);
    console.log('Response:', redact((event as any).body));
    console.groupEnd();
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();

  let request = req.clone({ withCredentials: true });
  if (token) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  logRequest(request);

  return next(request).pipe(
    switchMap((event) => {
      logResponse(request, event);
      return [event];
    }),
    catchError((error: HttpErrorResponse) => {
      console.groupCollapsed(`%c[HTTP ERROR] ${request.method} ${request.urlWithParams}`, 'color:#dc3545;font-weight:bold');
      console.log('Status:', error.status);
      console.log('Error response:', redact(error.error));
      console.groupEnd();

      const isAuthRequest =
        request.url.includes('/auth/login') ||
        request.url.includes('/auth/signup') ||
        request.url.includes('/auth/verify-otp') ||
        request.url.includes('/auth/resend-otp') ||
        request.url.includes('/auth/forget-password') ||
        request.url.includes('/auth/reset-password');

      if (error.status === 401 && !isAuthRequest && !request.url.includes('/auth/refresh-token') && !request.url.includes('/auth/logout')) {
        return tryRefresh(request, next, auth, router);
      }

      if (error.status === 404 && !isAuthRequest && !request.url.includes('/error')) {
        void router.navigate(['/error'], {
          queryParams: { status: 404, message: error.error?.message || 'The requested resource was not found.' }
        });
      }

      return throwError(() => error);
    }),
    finalize(() => {
      // Keep the console output focused on the request/response above.
    })
  );
};

function tryRefresh(
  originalReq: HttpRequest<unknown>,
  next: (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>,
  auth: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (refreshInProgress) {
    auth.clearAuth();
    void router.navigate(['/login']);
    return throwError(() => new Error('Session refresh already in progress.'));
  }

  refreshInProgress = true;
  return auth.refreshToken().pipe(
    switchMap((response: any) => {
      refreshInProgress = false;
      console.log('[AUTH REFRESH] success:', redact(response));
      const newToken = response?.data?.accessToken ?? response?.accessToken;
      if (!newToken) {
        auth.clearAuth();
        void router.navigate(['/login']);
        return throwError(() => new Error('No access token was returned.'));
      }
      auth.setAccessToken(newToken);
      const retry = originalReq.clone({
        setHeaders: { Authorization: `Bearer ${newToken}` },
        withCredentials: true
      });
      console.log('[HTTP RETRY AFTER REFRESH]', retry.method, retry.urlWithParams);
      return next(retry);
    }),
    catchError(refreshError => {
      refreshInProgress = false;
      console.error('[AUTH REFRESH] error:', redact(refreshError));
      auth.clearAuth();
      void router.navigate(['/login']);
      return throwError(() => refreshError);
    })
  );
}
