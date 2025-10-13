import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = localStorage.getItem('currentUser');
  const token = raw ? (JSON.parse(raw)?.token as string | undefined) : undefined;

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
      return throwError(() => err);
    })
  );
};
