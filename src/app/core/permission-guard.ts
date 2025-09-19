import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission: string = route.data['permission'];
    const currentUser = this.auth.currentUser();

    // user login hi nahi hai
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // permission check
    if (!this.auth.hasPermission(requiredPermission)) {
      this.router.navigate(['/forbidden']); 
      return false;
    }

    return true;
  }
}
