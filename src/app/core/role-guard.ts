import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
  const expectedRoles: string[] = route.data['roles'];
  const currentUser = this.auth.currentUser(); 

  if (!currentUser || !currentUser.roles) {
    this.router.navigate(['/login']);
    return false;
  }

  const hasRole = currentUser.roles.some(role => expectedRoles.includes(role));
  if (!hasRole) {
    this.router.navigate(['/contacts']); 
    return false;
  }

  return true;
}
}

