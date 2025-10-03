import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    // check signal OR localStorage
    const user = this.auth.currentUser();
    if (user) {
      return true;
    }

    // agar login nahi hai to redirect
    this.router.navigate(['/login']);
    return false;
  }
}