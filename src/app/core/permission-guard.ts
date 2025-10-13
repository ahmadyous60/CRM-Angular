import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Permission } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission: string = route.data['permission'];
    const currentUser = this.auth.currentUser();

    //If user is not logged in
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    //If no specific permission required for this route, allow access
    if (!requiredPermission) {
      return true;
    }

    const userPermissions: Permission[] = currentUser.permissions || [];

    // Check if user has required permission by comparing permission.name
    const hasPermission = userPermissions.some(
      (p) => p.name === requiredPermission
    );

    if (!hasPermission) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // Access granted
    return true;
  }
}
