import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {filter,take, map, catchError, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { jwtDecode } from "jwt-decode";
import { MatDialog } from '@angular/material/dialog';
import { SessionTimeoutDialogComponent } from '../features/sessiontimeout/session-time-out.component';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API_URL = `${environment.apiUrl}/Auth`;

  private SESSION_WARNING_MARGIN_MS = 30 * 1000; 
  private dialogTimeoutMs = 30 * 1000; 
  private warningTimer: any = null;
  private expiryTimer: any = null;
    // concurrency guard for refresh
  private refreshInProgress = false;
  private refreshSubject = new BehaviorSubject<boolean | null>(null);

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private dialog: MatDialog, private router: Router) {}
  

login(username: string, password: string): Observable<User | null> {
  return this.http.post<any>(`${this.API_URL}/login`, { username, password }).pipe(
    map(res => {
      const decoded = jwtDecode<any>(res.accessToken);

      const claims = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        roles: Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])
          ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
          : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]],
        permissions: decoded["Permission"] || [],
        fullName: decoded["FullName"] || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      };

      const user: User = {
        id: claims.id,
        username: claims.username,
        email: claims.email,
        name: claims.fullName,
        roles: claims.roles,
        permissions: claims.permissions,
        token: res.accessToken,
        refreshToken: res.refreshToken
      };

      this.setUser(user);
      return user;
    }),
    catchError(err => {
      this.handleAuthError(err);
      return of(null);
    })
  );
}
  // ✅ Signup
  signup(username: string, password: string, name: string, email: string): Observable<User | null> {
  return this.http.post<{ accessToken: string; refreshToken: string }>(
    `${this.API_URL}/signup`,
    { username, name, email, password }
  ).pipe(
    map(res => {
      // Decode JWT to extract roles and permissions
      const decoded = jwtDecode<any>(res.accessToken);

      const claims = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
        roles: Array.isArray(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"])
          ? decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
          : [decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]],
        permissions: decoded["Permission"] || [],
        fullName: decoded["FullName"] || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      };

      const user: User = {
        id: claims.id,
        username: claims.username,
        email: claims.email ?? '',
        name: claims.fullName,
        roles: claims.roles,
        permissions: claims.permissions,
        token: res.accessToken,
        refreshToken: res.refreshToken
      };

      this.setUser(user);
      return user;
    }),
    catchError(err => {
      this.handleAuthError(err);
      return of(null);
    })
  );
}


  // ✅ Logout
  logout(): void {
    const user = this.currentUser();
    if (user?.refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken: user.refreshToken }).subscribe({
        next: () => {
          this.snackBar.open('You have been logged out successfully ✅', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (err) => console.error('Error revoking token', err)
      });
    }
    this.clearUser();
  }

  refreshToken(): Observable<boolean> {
    const user = this.currentUser();
    if (!user?.refreshToken) return of(false);

    // If a refresh is in progress, queue behind it
    if (this.refreshInProgress) {
      return this.refreshSubject.pipe(
        filter(v => v !== null),
        take(1),
        map(v => v as boolean)
      );
    }

    this.refreshInProgress = true;
    this.refreshSubject.next(null); // reset

    return this.http.post<any>(`${this.API_URL}/refresh`, { refreshToken: user.refreshToken }).pipe(
      map(res => {
        const access = res.accessToken ?? res.AccessToken;
        const refresh = res.refreshToken ?? res.RefreshToken;
        if (!access) throw new Error('No access token in refresh response');

        user.token = access;
        user.refreshToken = refresh;
        this.setUser(user);

        this.refreshInProgress = false;
        this.refreshSubject.next(true);
        return true;
      }),
      catchError(err => {
        console.error('Refresh token failed', err);
        this.refreshInProgress = false;
        this.refreshSubject.next(false);
        this.logout(); // revoke client session
        return of(false);
      })
    );
  }


  restoreUser(): void {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    const user: User = JSON.parse(saved);
    this.currentUser.set(user);

    // use setUser so timers are scheduled
    this.setUser(user);
  }
}

  // ✅ Forgot Password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  // ✅ Reset Password
  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/reset-password`, { email, token, newPassword });
  }

  // ========================
  // Helpers
  // ========================

  private setUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // schedule timers based on token
      if (user?.token) {
      this.clearSessionTimers();
      this.startSessionTimer(user.token);
    }
  }

  private clearUser(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
     this.clearSessionTimers();
  }

  private handleAuthError(err: any): void {
    if (err.status === 401) {
      this.snackBar.open(err.error.message || 'Wrong password entered ❌', 'Close', { duration: 3000 });
    } else if (err.status === 404) {
      this.snackBar.open(err.error.message || 'User not found ❌', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('Login failed. Please try again. ⚠️', 'Close', { duration: 3000 });
    }
  }

  // ✅ Permission check
  hasPermission(permissionId: string): boolean {
  const user = this.currentUser();
  return user?.permissions?.some(p => p.id === permissionId) ?? false;
}

  // ✅ Role check
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.roles?.includes(role) ?? false;
  }

  updateUserRoles(userId: string, roles: string[]): Observable<any> {
  return this.http.put(`${this.API_URL}/users/${userId}/roles`, roles); 
}
getAllUsers(): Observable<User[]> {
  return this.http.get<any[]>(`${this.API_URL}/users`).pipe(
    map(res =>
      res.map(u => ({
        id: u.id,
        username: u.userName,   // ✅ map here too
        email: u.email,
        name: u.name,
        roles: u.roles,
        permissions: u.permissions || [],
        token: '',
        refreshToken: ''
      }))
    )
  );
}
deleteUser(userId: string): Observable<any> {
  return this.http.delete(`${this.API_URL}/users/${userId}`);
}

  // ========================
  //  Timers
  // ========================
  private clearSessionTimers() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }
  private startSessionTimer(accessToken: string) {
    // jwt exp is usually in seconds since epoch
    try {
      const decoded: any = jwtDecode(accessToken);
      const expSec = decoded?.exp;
      if (!expSec) return;

      const expiryMs = expSec * 1000;
      const now = Date.now();
      const msUntilExpiry = expiryMs - now;
      if (msUntilExpiry <= 0) {
        // already expired
        this.handleSessionExpired();
        return;
      }

      const msUntilWarning = Math.max(0, msUntilExpiry - this.SESSION_WARNING_MARGIN_MS);

      // schedule warning
      this.warningTimer = setTimeout(() => {
        this.openSessionWarningDialog();
      }, msUntilWarning);

      // schedule final expiry logout (as a safety net)
      this.expiryTimer = setTimeout(() => {
        this.handleSessionExpired();
      }, msUntilExpiry);
    } catch (err) {
      console.error('Failed to decode token for session timer', err);
    }
  }

 private handleSessionExpired() {
  this.snackBar.open('Session expired. Redirecting to login...', 'Close', { duration: 3000});
  this.logout();
  this.router.navigate(['/login']);
}

  private openSessionWarningDialog() {
    const dialogRef = this.dialog.open(SessionTimeoutDialogComponent, {
      data: { timeoutMs: Math.min(this.dialogTimeoutMs, this.SESSION_WARNING_MARGIN_MS) },
      disableClose: true
    });

    // afterClosed returns 'continue' | 'logout' | undefined
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'continue') {
        // try refresh
        this.refreshToken().subscribe(success => {
          if (!success) {
            // refresh failed -> logout already handled in refreshToken
            this.snackBar.open('Session could not be continued. Logging out...', 'Close', { duration: 3000 });
            this.logout();
          } else {
            
          }
        });
      } else {
        // user chose logout or dialog timed out -> logout
        this.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  getAllPermissions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.API_URL}/permissions`);
}

assignPermissions(roleId: string, permissionIds: string[]): Observable<any> {
  return this.http.post(`${this.API_URL}/roles/${roleId}/permissions`, permissionIds);
}

 revokePermission(roleId: string, permissionId: string): Observable<any> {
  const url = `${this.API_URL}/roles/${roleId}/permissions/${permissionId}`;
  console.log("Revoke Permission URL:", url);
  console.log("Role ID:", roleId, "Permission ID:", permissionId);

  return this.http.delete(url).pipe(
    catchError(err => {
      console.error("Error revoking permission:", err);
      throw err; // rethrow so subscriber can handle
    })
  );
}



getUserPermissions(userId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.API_URL}/users/${userId}/permissions`);
}

}
