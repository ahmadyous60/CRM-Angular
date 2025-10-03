import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles: string[] = route.data['roles'];
    const currentUser = this.auth.currentUser();

    // user login hi nahi hai
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // role check
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = currentUser.roles.some((role: string) =>
        requiredRoles.includes(role)
      );

      if (!hasRole) {
        this.router.navigate(['/contacts']); 
        return false;
      }
    }

    return true;
  }
}
