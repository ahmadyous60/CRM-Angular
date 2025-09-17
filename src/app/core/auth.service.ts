import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = `${environment.apiUrl}/Auth`;

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient,  private snackBar: MatSnackBar) {}

  // ✅ Login
 login(username: string, password: string): Observable<User | null> {
  return this.http.post<any>(`${this.API_URL}/login`, { username, password })
    .pipe(
      map(res => {
        const user: User = {
          id: res.user.id,
          username: res.user.userName,
          email: res.user.email,
          name: res.user.name, 
          roles: res.user.roles,         // <-- add roles here
          token: res.accessToken,
          refreshToken: res.refreshToken
        };
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }),
      catchError(err => {
        if (err.status === 401) {
          alert(err.error.message || 'Wrong password entered');
        } else if (err.status === 404) {
          alert(err.error.message || 'User not found');
        } else {
          alert('Login failed. Please try again.');
        }
        return of(null);
      })
    );
}

  // ✅ Signup
  signup(username: string, password: string, name: string, email: string): Observable<User | null> {
    return this.http.post<User>(`${this.API_URL}/signup`, { username, name, email, password })
      .pipe(
        switchMap(() => this.login(username, password)) // login now returns User
      );
  }

    // ✅ Logout
 logout() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const user = JSON.parse(saved) as User;

      this.http.post(`${this.API_URL}/logout`, { refreshToken: user.refreshToken })
        .subscribe({
          next: () => {
            this.snackBar.open('You have been logged out successfully ✅', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => console.error('Error revoking token', err)
        });
    }
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }


  // ✅ Refresh token
  refreshToken(): Observable<boolean> {
    const saved = localStorage.getItem('currentUser');
    if (!saved) return of(false);

    const user = JSON.parse(saved) as User;

    return this.http.post<any>(`${this.API_URL}/refresh`, { refreshToken: user.refreshToken })
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
