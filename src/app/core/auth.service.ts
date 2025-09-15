import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'https://localhost:7298/api/Auth';

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  // ✅ Login
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.API_URL}/login`, { username, password })
      .pipe(
        map(res => {
          const user: User = {
            ...res.user,
            token: res.accessToken,
            refreshToken: res.refreshToken
          };
          this.currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          return true;
        }),
        catchError(err => {
          if (err.status === 401) {
            alert(err.error.message || 'Wrong password entered');
          } else if (err.status === 404) {
            alert(err.error.message || 'User not found');
          } else {
            alert('Login failed. Please try again.');
          }
          return of(false);
        })
      );
  }

  // ✅ Signup
 signup(username: string, password: string, name: string, email: string): Observable<User> {
  return this.http.post<User>(`${this.API_URL}/signup`, { username, name, email, password })
    .pipe(
      tap(res => {
        const user: User = {
          ...res,
          token: '',           
          refreshToken: ''      
        };
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
}


  // ✅ Refresh token
  refreshToken(): Observable<boolean> {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return of(false);

    const user = JSON.parse(saved) as User;

    return this.http.post<any>(`${this.API_URL}/refresh-token`, { refreshToken: user.refreshToken })
      .pipe(
        map(res => {
          user.token = res.accessToken;
          user.refreshToken = res.refreshToken;
          this.currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          return true;
        }),
        catchError(err => {
          console.error('Refresh token failed', err);
          this.logout();
          return of(false);
        })
      );
  }

  // ✅ Logout
  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  // ✅ Restore session on reload
  restoreUser() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser.set(JSON.parse(saved));
    }
  }



  // ✅ Forgot Password
  forgotPassword(email: string) {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  // ✅ Reset Password
  resetPassword(email: string, token: string, newPassword: string) {
  return this.http.post(`${this.API_URL}/reset-password`, {
    email,
    token,
    newPassword
  });
}
}
