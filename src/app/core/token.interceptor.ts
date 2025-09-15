import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.auth.currentUser();
    let cloned = req;

    if (currentUser?.token) {
      cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }

    return next.handle(cloned).pipe(
      catchError(err => {
        if (err.status === 401) {
          // Token expired → try refreshing
          return this.auth.refreshToken().pipe(
            switchMap(success => {
              if (success) {
                const newUser = this.auth.currentUser();
                const retry = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newUser?.token}`
                  }
                });
                return next.handle(retry);
              }
              return throwError(() => err);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}
