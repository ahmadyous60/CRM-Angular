import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const currentUser = auth.currentUser();
  const token = currentUser?.token;

  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(cloned).pipe(
    catchError(err => {
      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap(success => {
            if (success) {
              const newUser = auth.currentUser();
              const newToken = newUser?.token;

              if (newToken) {
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(retryReq);
              }
            }
            auth.logout();
            return throwError(() => new Error('Session expired. Please login again.'));
          })
        );
      }
      return throwError(() => err);
    })
  );
};
