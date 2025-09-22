// import { Injectable, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { map, catchError, switchMap } from 'rxjs/operators';
// import { Observable, of } from 'rxjs';
// import { User } from '../models/user.model';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { environment } from '../../environments/environment';


// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private API_URL = `${environment.apiUrl}/Auth`;

//   currentUser = signal<User | null>(null);

//   constructor(private http: HttpClient,  private snackBar: MatSnackBar) {}

//   // ✅ Login
//  login(username: string, password: string): Observable<User | null> {
//   return this.http.post<any>(`${this.API_URL}/login`, { username, password })
//     .pipe(
//       map(res => {
//         const user: User = {
//           id: res.user.id,
//           username: res.user.userName,
//           email: res.user.email,
//           name: res.user.name, 
//           roles: res.user.roles,         // <-- add roles here
//           token: res.accessToken,
//           refreshToken: res.refreshToken
//         };
//         this.currentUser.set(user);
//         localStorage.setItem('currentUser', JSON.stringify(user));
//         return user;
//       }),
//       catchError(err => {
//         if (err.status === 401) {
//           alert(err.error.message || 'Wrong password entered');
//         } else if (err.status === 404) {
//           alert(err.error.message || 'User not found');
//         } else {
//           alert('Login failed. Please try again.');
//         }
//         return of(null);
//       })
//     );
// }

//   // ✅ Signup
//   signup(username: string, password: string, name: string, email: string): Observable<User | null> {
//     return this.http.post<User>(`${this.API_URL}/signup`, { username, name, email, password })
//       .pipe(
//         switchMap(() => this.login(username, password)) // login now returns User
//       );
//   }

//     // ✅ Logout
//  logout() {
//     const saved = localStorage.getItem('currentUser');
//     if (saved) {
//       const user = JSON.parse(saved) as User;

//       this.http.post(`${this.API_URL}/logout`, { refreshToken: user.refreshToken })
//         .subscribe({
//           next: () => {
//             this.snackBar.open('You have been logged out successfully ✅', 'Close', {
//               duration: 3000,
//               panelClass: ['success-snackbar']
//             });
//           },
//           error: (err) => console.error('Error revoking token', err)
//         });
//     }
//     this.currentUser.set(null);
//     localStorage.removeItem('currentUser');
//   }


//   // ✅ Refresh token
//   refreshToken(): Observable<boolean> {
//     const saved = localStorage.getItem('currentUser');
//     if (!saved) return of(false);

//     const user = JSON.parse(saved) as User;

//     return this.http.post<any>(`${this.API_URL}/refresh`, { refreshToken: user.refreshToken })
//       .pipe(
//         map(res => {
//           user.token = res.accessToken;
//           user.refreshToken = res.refreshToken;
//           this.currentUser.set(user);
//           localStorage.setItem('currentUser', JSON.stringify(user));
//           return true;
//         }),
//         catchError(err => {
//           console.error('Refresh token failed', err);
//           this.logout();
//           return of(false);
//         })
//       );
//   }

//   // ✅ Restore session on reload
//   restoreUser() {
//     const saved = localStorage.getItem('currentUser');
//     if (saved) {
//       this.currentUser.set(JSON.parse(saved));
//     }
//   }

//   // ✅ Forgot Password
//   forgotPassword(email: string) {
//     return this.http.post(`${this.API_URL}/forgot-password`, { email });
//   }

//   // ✅ Reset Password
//   resetPassword(email: string, token: string, newPassword: string) {
//     return this.http.post(`${this.API_URL}/reset-password`, {
//       email,
//       token,
//       newPassword
//     });
//   }
// }
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { jwtDecode } from "jwt-decode";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = `${environment.apiUrl}/Auth`;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}
  

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
        permissions: decoded["Permission"] || []
      };

      const user: User = {
        id: claims.id,
        username: claims.username,
        email: claims.email,
        name: claims.username,
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
        permissions: decoded["Permission"] || []
      };

      const user: User = {
        id: claims.id,
        username: claims.username,
        email: claims.email ?? '',
        name: claims.username,
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

  // ✅ Refresh Token
  refreshToken(): Observable<boolean> {
    const user = this.currentUser();
    if (!user?.refreshToken) return of(false);

    return this.http.post<any>(`${this.API_URL}/refresh`, { refreshToken: user.refreshToken }).pipe(
      map(res => {
        user.token = res.accessToken;
        user.refreshToken = res.refreshToken;
        this.setUser(user);
        return true;
      }),
      catchError(err => {
        console.error('Refresh token failed', err);
        this.logout();
        return of(false);
      })
    );
  }

  // ✅ Restore session
  restoreUser(): void {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser.set(JSON.parse(saved));
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
  // 🔒 Helpers
  // ========================

  private setUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private clearUser(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
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
  hasPermission(permission: string): boolean {
    const user = this.currentUser();
    return user?.permissions?.includes(permission) ?? false;
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

}
