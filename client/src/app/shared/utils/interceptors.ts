import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { catchError, Observable, throwError } from 'rxjs';
import {NotificationService} from '@core/services/notification.service';
import { API_URL, isDevMode } from '@core/environment/config.constants';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  // Prefix relative URLs with API_URL, avoiding double slashes
  if (isDevMode) {
    if (!req.url.startsWith('http')) {
      const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
      req = req.clone({
        url: `${API_URL}${path}`,
      });
    }
  }
  // Read token from signal and set header only if present
  const token = authService.token();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
}

export function errorCatcher(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {

  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);


  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        notificationService.addNotification('Session expired. Please log in again.', 4);
        authService.logout();
      } else
      if (err.status === 403) {

      } else if (err.status === 500) {
        notificationService.addNotification('Some error occurred', 4);
      } else {
        const errorMessage = err.error?.message || 'An error occurred';
        notificationService.addNotification(errorMessage, 4);
      }
      return throwError(() => err);
    })
  );
}
