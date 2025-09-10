// import { Injectable, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { map, tap } from 'rxjs/operators';
// import { Observable } from 'rxjs';
// import { User } from './model';



// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private API_URL = 'http://localhost:3000/users';

//   // ✅ public signal, accessible directly
//   currentUser = signal<User | null>(null);

//   constructor(private http: HttpClient) {}

//   // Login (check if user exists)
//   login(username: string, password: string): Observable<boolean> {
//     return this.http.get<User[]>(`${this.API_URL}?username=${username}&password=${password}`)
//       .pipe(
//         map(users => {
//           if (users.length > 0) {
//             const user = users[0];
//             this.currentUser.set(user);
//             localStorage.setItem('currentUser', JSON.stringify(user));
//             return true;
//           }
//           return false;
//         })
//       );
//   }

//   // Signup (create new user)
//   signup(username: string, password: string, name: string): Observable<User> {
//     return this.http.post<User>(this.API_URL, { username, password, name })
//       .pipe(
//         tap(user => {
//           this.currentUser.set(user);
//           localStorage.setItem('currentUser', JSON.stringify(user));
//         })
//       );
//   }

//   // Logout
//   logout() {
//     this.currentUser.set(null);
//     localStorage.removeItem('currentUser');
//   }

//   // Restore session on reload
//   restoreUser() {
//     const saved = localStorage.getItem('currentUser');
//     if (saved) {
//       this.currentUser.set(JSON.parse(saved));
//     }
//   }
// }
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { User } from './model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = 'https://localhost:7298/api/Auth';

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  // ✅ Login
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<User>(`${this.API_URL}/login`, { username, password })
      .pipe(
        map(user => {
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
        tap(user => {
          this.currentUser.set(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
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
